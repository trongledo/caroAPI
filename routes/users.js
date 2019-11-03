const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

/* GET users listing. */

router.get('/', function(req, res) {
  res.send(req.user);
});

router.patch('/update', authController.update);

module.exports = router;
