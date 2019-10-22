const User = require('../models/User');
const bcrypt = require('bcryptjs');
const JWT = require('jsonwebtoken');
const passport = require('passport');
const { registerValidation, loginValidation } = require('../models/validation');

// REGISTER
exports.register = async (req, res) => {
  const { error } = registerValidation(req.body);
  if (error) return res.status(400).json(error.details[0].message);

  // Kiem tra email bi trung?
  const userCheck = await User.findOne({ email: req.body.email });
  if (userCheck) return res.status(400).json('Email already exists');

  // Ma hoa mat khau
  const salt = await bcrypt.genSalt();
  const hashedPassword = await bcrypt.hash(req.body.password, salt);

  const newUser = new User({
    name: req.body.name,
    email: req.body.email,
    password: hashedPassword
  });

  try {
    const savedUser = await newUser.save();
    res.json({ newUser: newUser._id });
  } catch (err) {
    res.status(400).json(err);
  }
};

// LOGIN
exports.login = async (req, res) => {
  passport.authenticate('local', { session: false }, (err, user, info) => {
    console.log(err);
    if (err || !user) {
      return res.status(400).json({
        message: info ? info.message : 'Login failed',
        user: user
      });
    }

    req.login(user, { session: false }, err => {
      if (err) {
        res.send(err);
      }

      const token = JWT.sign({ userID: user._id }, process.env.TOKEN_SECRET);

      return res.json({
        message: info.message,
        user: {
          date: user.date,
          email: user.email,
          name: user.name
        },
        token
      });
    });
  })(req, res);

  //   const { error } = loginValidation(req.body);
  //   if (error) return res.status(400).send(error.details[0].message);

  //   // Kiem tra email co ton tai?
  //   const userCheck = await User.findOne({ email: req.body.email });
  //   if (!userCheck) return res.status(400).send('Email does not exist');

  //   const validatePass = await bcrypt.compare(
  //     req.body.password,
  //     userCheck.password
  //   );
  //   if (!validatePass) return res.status(400).send('Invalid password');

  //   // Tao Token
  //   const token = JWT.sign({ userId: userCheck._id }, process.env.TOKEN_SECRET);

  //   res.header('auth-token', token).send(token);
};
