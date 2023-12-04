const mongoose = require('mongoose');

const dataSchema = new mongoose.Schema({
	data: {
		type: JSON,
	},
	createdAt: {
		type: Date,
		default: Date.now(),
	},
});
const Data = mongoose.model('Data', dataSchema);

module.exports = Data;
