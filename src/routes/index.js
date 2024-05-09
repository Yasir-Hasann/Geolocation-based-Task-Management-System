// module imports
const express = require('express');

// file imports
const auth = require('./auth');
const task = require('./task');

// variable initializations
const router = express.Router();

router.use('/auth', auth);
router.use('/task', task);

module.exports = router;
