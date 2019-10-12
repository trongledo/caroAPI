const User = require('../models/User');
const bcrypt = require('bcryptjs');
const JWT = require('jsonwebtoken');
const { registerValidation, loginValidation } = require('../models/validation');

// REGISTER CONTROLLER
exports.register = async (req, res) => {
  const { error } = registerValidation(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  // Kiem tra email bi trung?
  const userCheck = await User.findOne({ email: req.body.email });
  if (userCheck) return res.status(400).send('Email already exists');

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
    res.send({ newUser: newUser._id });
  } catch (err) {
    res.status(400).send(err);
  }
};

// LOGIN CONTROLLER
exports.login = async (req, res) => {
  const { error } = loginValidation(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  // Kiem tra email co ton tai?
  const userCheck = await User.findOne({ email: req.body.email });
  if (!userCheck) return res.status(400).send('Email does not exist');

  const validatePass = await bcrypt.compare(
    req.body.password,
    userCheck.password
  );
  if (!validatePass) return res.status(400).send('Invalid password');

  // Tao Token
  const token = JWT.sign({ userId: userCheck._id }, process.env.TOKEN_SECRET);

  res.header('auth-token', token).send(token);
};
