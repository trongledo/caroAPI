const User = require('../models/User');
const bcrypt = require('bcryptjs');
const JWT = require('jsonwebtoken');
const passport = require('passport');
const {
  registerValidation,
  updateValidation
} = require('../models/validation');

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
    password: hashedPassword,
    image: 'https://image.flaticon.com/icons/svg/206/206879.svg'
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
          name: user.name,
          image: user.image
        },
        token
      });
    });
  })(req, res);
};

// UPDATE
exports.update = async (req, res) => {
  const { error } = updateValidation(req.body);
  if (error) return res.status(400).json(error.details[0].message);

  // Ma hoa mat khau
  const salt = await bcrypt.genSalt();
  const hashedPassword = await bcrypt.hash(req.body.password, salt);

  const newUser = {
    name: req.body.name,
    email: req.body.email,
    password: hashedPassword,
    image: req.body.image
  };

  try {
    const updatedUser = await User.updateOne(
      { _id: req.user._id },
      { $set: newUser }
    );
    res.json(updatedUser);
  } catch (err) {
    res.status(400).json(err);
  }
};
