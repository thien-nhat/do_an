const Data = require('../models/dataModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');
const APIFeatures = require('./../utils/apiFeatures');

exports.getAllData = catchAsync(async (req, res, next) => {
	const features = new APIFeatures(Data.find(), req.query).filter().sort();
	const data = await features.query;

	res.status(200).json({
		status: 'success',
		result: data.length,
		data: {
			data,
		},
	});
});
exports.getData = catchAsync(async (req, res, next) => {
	const data = await Data.findById(req.params.id);
	if (!data) {
		return next(new AppError('No data found with that ID', 404));
	}
	res.status(200).json({
		status: 'success',
		data: {
			data,
		},
	});
});
exports.createData = catchAsync(async (req, res, next) => {
	const newData = await Data.create(req.body);

	res.status(201).json({
		status: 'success',
		data: {
			data: newData,
		},
	});
});

exports.deleteData = catchAsync(async (req, res, next) => {
	const data = await Data.deleteOne({ _id: req.params.id });
	if (!data.deletedCount) {
		return next(new AppError('No data found with that ID', 404));
	}
	res.status(200).json({
		status: 'success',
		message: 'The data has been deleted successfully',
	});
});
