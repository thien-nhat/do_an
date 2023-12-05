const Data = require('../models/dataModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');
// const APIFeatures = require('./../utils/apiFeatures');

exports.getAllData = catchAsync(async (req, res, next) => {
	Data.getAllData(req.query, (err, result) => {
		if (err) throw err;
		res.status(200).json({
			status: 'success',
			result: Object.keys(result).length,
			data: result,
		});
	});
});
exports.getData = catchAsync(async (req, res, next) => {
	Data.getDataById(req.params.id, (err, result) => {
		if (err || !result || Object.keys(result).length === 0) {
			return next(new AppError('No data found with that ID', 404));
		}
		res.status(200).json({
			status: 'success',
			data: result,
		});
	});
});
exports.createData = catchAsync(async (req, res, next) => {
	const newData = await Data.createData(req.body);

	res.status(201).json({
		status: 'success',
		data: {
			data: newData,
		},
	});
});

exports.deleteData = catchAsync(async (req, res, next) => {
	Data.deleteData(req.params.id, (err, result) => {
		if (err) {
			return next(new AppError('Something when wrong!', 404));
		}
		console.log(result.affectedRows);
		if (!result.affectedRows) {
			return next(new AppError('No data found with that ID', 404));
		}
		res.status(200).json({
			status: 'success',
			message: 'The data has been deleted successfully'
		});
	});
});
