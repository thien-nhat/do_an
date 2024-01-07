const Data = require('../models/dataModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');
const sendRequestWhenMiss = require('../handle/sendRequestWhenMiss');
const predictPlantGrowth = require('../handle/predictPlantGrowth');

exports.getAllData = catchAsync(async (req, res, next) => {
	// Lấy 'page' và 'limit' từ yêu cầu, hoặc sử dụng giá trị mặc định
	const page = parseInt(req.query.page) || 1;
	const limit = parseInt(req.query.limit) || 10;

	Data.getAllData(page, limit, req.query, (err, result) => {
		if (err) throw err;

		// Lấy tổng số dữ liệu
		Data.getCountData((err, count) => {
			if (err) throw err;

			res.status(200).json({
				status: 'success',
				result: count,
				data: result,
			});
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
			message: 'The data has been deleted successfully',
		});
	});
});

exports.postMissedRequest = catchAsync(async (req, res, next) => {
	sendRequestWhenMiss(req.body.startTs, req.body.endTs);
	res.status(200).json({
		status: 'success',
		message: 'The missed data has been successfully retrieved',
	});
});
exports.predictPlantGrowth = catchAsync(async (req, res, next) => {
	// sendRequestWhenMiss(req.body.startTs, req.body.endTs);
	const GDD = await predictPlantGrowth.calculateGDD(10);
	const meanGDD = await predictPlantGrowth.calculateMeanGDD(10);
	const predictDay = (1700 - GDD) / meanGDD;
	// Tạo một đối tượng Date mới cho ngày hiện tại
	let currentDate = new Date();

	// Thêm số ngày dự đoán vào ngày hiện tại
	currentDate.setDate(currentDate.getDate() + predictDay);

	// Ngày dự đoán
	let predictDate = currentDate;
	res.status(200).json({
		status: 'success',
		GDD,
		meanGDD,
		predictDay,
		predictDate,
	});
});
