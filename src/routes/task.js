// module imports
const express = require('express');

// file imports
const taskController = require('../controllers/task');
const { verifyUserToken } = require('../middlewares/auth');

// variable initializations
const router = express.Router();

router.route('/').get(verifyUserToken, taskController.getAllTasks).post(verifyUserToken, taskController.addTask);
router.route('/:id').get(verifyUserToken, taskController.getSingleTask);

module.exports = router;
