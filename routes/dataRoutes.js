const express = require('express');
const dataController = require('../controllers/dataController');
const authController = require('../controllers/authController');

const router = express.Router();

router
	.route('/')
	.get(
		// authController.protect,
		authController.restrictTo('admin'),
		dataController.getAllData
	)
	.post(
		// authController.protect,
		authController.restrictTo('admin'),
		dataController.createData
	);
router
	.route('/:id')
	.get(
		// authController.protect, 
		dataController.getData)
	.delete(
		// authController.protect,
		authController.restrictTo('admin'),
		dataController.deleteData
	);

module.exports = router;
