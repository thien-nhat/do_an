const express = require('express');
const dataController = require('../controllers/dataController');
const authController = require('../controllers/authController');

const router = express.Router();
router.post(
	'/postmissedrequest',
	authController.protect,
	dataController.postMissedRequest
);
router.get(
	'/predictplantgrowth',
	authController.protect,
	dataController.predictPlantGrowth
);
router
	.route('/')
	.get(authController.protect, dataController.getAllData)
	.post(
		authController.protect,
		authController.restrictTo('admin'),
		dataController.createData
	);
router
	.route('/:id')
	.get(authController.protect, dataController.getData)
	.delete(
		authController.protect,
		authController.restrictTo('admin'),
		dataController.deleteData
	);
// router.route('/getmissedrequest').get();

module.exports = router;
