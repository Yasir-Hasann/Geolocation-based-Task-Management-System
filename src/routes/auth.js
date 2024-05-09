// module imports
const express = require('express');

// file imports
const authController = require('../controllers/auth');

// variable initializations
const router = express.Router();

router.route('/login').post(authController.login);
router.route('/register').post(authController.register);

module.exports = router;
