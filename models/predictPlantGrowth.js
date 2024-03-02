const db = require('../database/database');

exports.calculateGDD = function (Tbase) {
	return new Promise((resolve, reject) => {
		

		db.query('SELECT * FROM data', (err, data) => {
			console.log('data', data);

			if (err) {
				reject(err);
				return;
			}

			// Group data by date
			let groupedData = {};
			data.forEach((item) => {
				let date = new Date(item.ts);
				date = date.toISOString().split('T')[0]; // Get the date part of the timestamp
				console.log('Date', date);
				if (!groupedData[date]) {
					groupedData[date] = {
						maxTemp: item.temperature,
						minTemp: item.temperature,
					};
				} else {
					if (item.temperature > groupedData[date].maxTemp) {
						groupedData[date].maxTemp = item.temperature;
					}
					if (item.temperature < groupedData[date].minTemp) {
						groupedData[date].minTemp = item.temperature;
					}
				}
			});

			// Calculate GDD for each day
			let GDD = {};
			for (let date in groupedData) {
				let { maxTemp, minTemp } = groupedData[date];
				GDD[date] = (maxTemp + minTemp) / 2 - Tbase;
			}

			// Calculate mean GDD
			let sumGDD = 0;
			let numDays = 0;
			for (let date in GDD) {
				sumGDD += GDD[date];
				numDays++;
			}
			console.log(numDays);
			resolve(sumGDD);
		});
	});
};

exports.calculateMeanGDD = function (Tbase) {
	return new Promise((resolve, reject) => {
		db.query('SELECT * FROM data', (err, data) => {
			if (err) {
				reject(err);
				return;
			}

			// Group data by date
			let groupedData = {};
			data.forEach((item) => {
				let date = new Date(item.ts).toISOString().split('T')[0]; // Get the date part of the timestamp
				if (!groupedData[date]) {
					groupedData[date] = {
						maxTemp: item.temperature,
						minTemp: item.temperature,
					};
				} else {
					if (item.temperature > groupedData[date].maxTemp) {
						groupedData[date].maxTemp = item.temperature;
					}
					if (item.temperature < groupedData[date].minTemp) {
						groupedData[date].minTemp = item.temperature;
					}
				}
			});

			// Calculate GDD for each day
			let GDD = {};
			for (let date in groupedData) {
				let { maxTemp, minTemp } = groupedData[date];
				GDD[date] = (maxTemp + minTemp) / 2 - Tbase;
			}

			// Calculate mean GDD
			let sumGDD = 0;
			let numDays = 0;
			for (let date in GDD) {
				sumGDD += GDD[date];
				numDays++;
			}
			let meanGDD = sumGDD / numDays;

			resolve(meanGDD);
		});
	});
};
