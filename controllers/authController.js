const crypto = require('crypto');
const { promisify } = require('util');
const jwt = require('jsonwebtoken');
const User = require('./../models/userModel');
const catchAsync = require('./../utils/catchAsync');
const appError = require('./../utils/appError');
const sendEmail = require('./../utils/email');

const signToken = (id) => {
	return jwt.sign({ id }, process.env.JWT_SECRET, {
		expiresIn: process.env.JWT_EXPIRES_IN,
	});
};

const createSendToken = (user, statusCode, res) => {
	const token = signToken(user.id);
	user.password = undefined;

	res.status(statusCode).json({
		status: 'success',
		token,
		data: {
			user,
		},
	});
};

exports.signup = catchAsync(async (req, res, next) => {
	const newUser = await User.createUser(req.body);
	createSendToken(newUser, 201, res);
});

exports.login = catchAsync(async (req, res, next) => {
	const { email, password } = req.body;
	if (!email || !password) {
		next(new appError('Please provide email and password!', 400));
	}

	// Use the findByEmail function to get the user
	const user = await User.findByEmail(email);
	if (!user || !(await User.correctPassword(password, user.password))) {
		return next(new appError('Wrong email or password', 401));
	}

	createSendToken(user, 200, res);
});

exports.protect = catchAsync(async (req, res, next) => {
	let token;
	if (
		req.headers.authorization &&
		req.headers.authorization.startsWith('Bearer')
	) {
		token = req.headers.authorization.split(' ')[1];
	}
	if (!token) {
		return next(
			new appError('You are not logged in! Please log in to get access.', 401)
		);
	}
	const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
	const freshUser = await User.findById(decoded.id);
	if (!freshUser) {
		return next(
			new appError(
				'The user belonging to this token does no longer exits.',
				401
			)
		);
	}
	const isChangePassword = User.changePasswordAfter(freshUser, decoded.iat);
	if (!isChangePassword) {
		return next(
			new appError('User recently changed password! Please log in again.', 401)
		);
	}
	req.user = freshUser;
	next();
});

exports.restrictTo = (...roles) => {
	return (req, res, next) => {
		if (!roles.includes(req.user.role)) {
			return next(
				new appError('You do not have permission to perform this action', 403)
			);
		}
		next();
	};
};

exports.forgotPassword = catchAsync(async (req, res, next) => {
	const user = await User.findByEmail(req.body.email);
	if (!user) {
		return next(new appError('There is no user with email address', 404));
	}
	const verifyNumber = Math.floor(100000 + Math.random() * 900000);
	User.updateVerifyCode(verifyNumber, req.body.email);

	const message = `
    <h1 style="color: limegreen; font-family: Arial, sans-serif;">Smart Farm Verification ☘️</h1>
    <p style="font-size: 14px; color: #000000;">This is your verification code: <strong style="font-size: 15px; color: red;">${verifyNumber}</strong>.</p>
    <p style="font-size: 14px; color: #7cfc00; font-style: italic;">If you didn't forget your password, please ignore this email!</p>
    <p style="font-size: 14px; color: #000000;">Best regards,<br> <br> <strong ><em style="font-size: 14px; background-color: #008000; color: white; text-shadow: 2px 2px 2px rgba(0, 0, 0, 0.3);">The Smart Farm Team </em> </strong></p>
	`;

	try {
		await sendEmail({
			email: user.email,
			subject: '[Smart Farm] Your password Verify Code',
			message,
		});
		res.status(200).json({
			status: 'success',
			message: 'Verify Code sent to email!',
		});
	} catch (err) {
		return next(new appError('There was an error sending the email!'), 500);
	}
});
exports.resetPassword = catchAsync(async (req, res, next) => {
	const user = await User.findByEmail(req.query.email);

	if (!user) {
		return next(new appError('User is invalid!', 400));
	}

	user.password = req.body.password;
	user.passwordConfirm = req.body.passwordConfirm;
	if (req.body.password !== req.body.passwordConfirm) {
		return next(new appError('Passwords do not match!', 400));
	}
	try {
		User.updatePassword(
			req.body.verifyNumber,
			req.query.email,
			req.body.password
		);
	} catch (err) {
		// Handle the error here
		return next(new appError('Verify Number is invalid!', 400));
	}
	createSendToken(user, 200, res);
});

exports.updatePassword = catchAsync(async (req, res, next) => {
	const user = await User.findById(req.user.id);
	if (!(await User.correctPassword(req.body.passwordCurrent, user.password))) {
		return next(new appError('Your current password is wrong.', 401));
	}
	if (req.body.password != req.body.passwordConfirm) {
		return next(
			new appError('Your password and password confirm do not match.', 401)
		);
	}
	user.password = req.body.password;

	await User.findByIdAndUpdate(req.user.id, user);

	createSendToken(user, 200, res);
});
