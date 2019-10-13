const router = require('express').Router();
const passport = require('passport');
const authController = require('../controllers/authController');

router.post('/register', authController.register);

router.post('/login', authController.login);

module.exports = router;
