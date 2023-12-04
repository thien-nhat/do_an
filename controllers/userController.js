const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('./../utils/AppError');

exports.getAllUsers = catchAsync(async (req, res, next) => {
	const users = await User.find();
	res.status(200).json({
		status: 'success',
		result: users.length,
		data: users,
	});
});

exports.getUser = catchAsync(async (req, res, next) => {
	const user = await User.findById(req.params.id);
	if (!user) {
		return next(new AppError('No user found with that ID', 404));
	}
	res.status(200).json({
		status: 'success',
		data: user,
	});
});

exports.updateUser = catchAsync(async (req, res, next) => {
	if (req.body.password || req.body.passwordConfirm) {
		return next(new AppError('This methods is not defined', 404));
	}
	const user = await User.findByIdAndUpdate(req.params.id, req.body, {
		new: true,
		runValidators: true,
	});
	if (!user) {
		return next(new AppError('No user found with that ID', 404));
	}
	res.status(200).json({
		status: 'success',
		data: user,
	});
});

exports.deleteUser = catchAsync(async (req, res, next) => {
	const user = await User.deleteOne({ _id: req.params.id });
	if (!user.deletedCount) {
		return next(new AppError('No user found with that ID', 404));
	}
	res.status(200).json({
		status: 'success',
		message: 'The data has been deleted successfully',
	});
});
exports.getMe = (req, res, next) => {
	req.params.id = req.user.id;
	next();
};
