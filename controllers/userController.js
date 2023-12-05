// const express = require('express');
// const router = express.Router();
const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');

// Create a new user
// router.post('/users', (req, res) => {
// 	const { name, email, password, phone, places, role } = req.body;
// 	const sql = `INSERT INTO users (name, email, password, phone, places, role) VALUES (?, ?, ?, ?, ?, ?)`;

// 	User.query(sql, [name, email, password, phone, places, role], (err, result) => {
// 		if (err) throw err;
// 		res.send(result);
// 	});
// });

// Get all users
exports.getAllUsers = catchAsync(async (req, res, next) => {
	User.getAllUsers((err, result) => {
		if (err) throw err;
		res.send(result);
	});
});

// Get a user by id
exports.getUser = catchAsync(async (req, res, next) => {
	User.getUserById(req.params.id, (err, result) => {
		if (err) throw err;
		res.send(result);
	});
});

// Update a user by id

exports.updateUser = catchAsync(async (req, res, next) => {
	if (req.body.password || req.body.passwordConfirm) {
		return next(new AppError('This methods is not defined', 404));
	}
	const user = await User.findByIdAndUpdate(req.params.id, req.body);
	if (!user) {
		return next(new AppError('No user found with that ID', 404));
	}
	res.status(200).json({
		status: 'success',
		data: user,
	});
});
// Delete a user by id
exports.deleteUser = catchAsync(async (req, res, next) => {
	const { id } = req.params;
	const sql = 'DELETE FROM users WHERE id = ?';

	User.query(sql, [id], (err, result) => {
		if (err) throw err;
		res.status(200).json({
			status: 'success',
			data: result,
		});
	});
});
exports.getMe = (req, res, next) => {
	req.params.id = req.user.id;
	next();
};
