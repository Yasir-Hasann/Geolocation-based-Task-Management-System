// module imports
const asyncHandler = require('express-async-handler');
const jwt = require('jsonwebtoken');

// file imports
const UserModel = require('../models/user');

exports.verifyUserToken = asyncHandler(async (req, res, next) => {
    const token = req.headers.authorization && req.headers.authorization.split('Bearer ')[1];

    if (token) {
        let verify;
        try {
            // Verify Token
            verify = jwt.verify(token.trim(), process.env.JWT_SECRET);
        } catch (error) {
            return res.status(401).send('unauthorized');
        }
        let user;
        try {
            // Get User from Token
            user = await UserModel.findById(verify._id).select('-password');
            if (!user) return res.status(401).send('unauthorized');
            // Attach user to the request object
            req.user = user;
            next();
        } catch (error) {
            return res.status(401).send('unauthorized');
        }
    } else {
        // No token provided
        return res.status(401).send('unauthorized');
    }
});