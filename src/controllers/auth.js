// module imports
const asyncHandler = require('express-async-handler');
const dayjs = require('dayjs');

// file imports
const UserModel = require('../models/user');
const ErrorResponse = require('../utils/error-response');


// @desc   Login User
// @route  POST /api/v1/auth/login
// @access Public
exports.login = asyncHandler(async (req, res, next) => {
    const { email, password } = req.body;
    if (!email || !password) return next(new ErrorResponse('Please provide an email and password', 400));

    const user = await UserModel.findOne({ email }).select('+password');
    if (!user) return next(new ErrorResponse('Invalid Credentials!', 401));

    const isMatch = await user.matchPasswords(password);
    if (!isMatch) return next(new ErrorResponse('Invalid Credentials!', 401));

    const token = user.getSignedjwtToken();
    res.status(200).json({ token, success: true });
});

// @desc   Register User
// @route  POST /api/v1/auth/register
// @access Public
exports.register = asyncHandler(async (req, res, next) => {
    const user = await UserModel.create(req.body);
    if (!user) return next(new ErrorResponse('Something went wrong', 500));

    const token = user.getSignedjwtToken();
    res.status(200).json({ token, success: true });
});