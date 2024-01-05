const axios = require('axios');
const db = require('../database/database');

// Define the URL of the API
const apiURL = 'https://demo.thingsboard.io:443/api/plugins/telemetry';
const method = 'GET';
// Authenticate via token
const token =
	'eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJ2YW4ucGhhbWRpbmh2YW4yMkBoY211dC5lZHUudm4iLCJ1c2VySWQiOiI2NmMxNzYyMC1iOGNiLTExZWQtOWIxNS1kZDJkYWM1MDU0OGYiLCJzY29wZXMiOlsiVEVOQU5UX0FETUlOIl0sInNlc3Npb25JZCI6IjczNGIzNGU4LTZjMDctNGNmMy1iODg2LWZkN2I4MjQyYzNmZiIsImlzcyI6InRoaW5nc2JvYXJkLmlvIiwiaWF0IjoxNzAxMjg0ODk0LCJleHAiOjE3MDMwODQ4OTQsImZpcnN0TmFtZSI6IlbEgk4iLCJsYXN0TmFtZSI6IlBI4bqgTSDEkMOMTkgiLCJlbmFibGVkIjp0cnVlLCJwcml2YWN5UG9saWN5QWNjZXB0ZWQiOnRydWUsImlzUHVibGljIjpmYWxzZSwidGVuYW50SWQiOiI2NTMzYWEzMC1iOGNiLTExZWQtOWIxNS1kZDJkYWM1MDU0OGYiLCJjdXN0b21lcklkIjoiMTM4MTQwMDAtMWRkMi0xMWIyLTgwODAtODA4MDgwODA4MDgwIn0.XL8r6u_GK7RtHLgr6kmCrn1ljod3SiLQqq-nHUvXwgBkRCVwwRTh0ug51_Xcg3rEXQaE_lKONlHbzIDYt1NDow'; // Replace YOUR_AUTH_TOKEN with your authentication token

// Define the endpoint and method
const sendRequestWhenMiss = async (startTs, endTs) => {
	// Group data by timestamp
    console.log("Send request ................................", startTs);

	let endpoint1 = `/DEVICE/4c2fe410-cd78-11ed-9b15-dd2dac50548f/values/timeseries?keys=temperature%2Chumidity%2CsoilMoisture&startTs=${startTs}&endTs=${endTs}&fbclid=IwAR1qJgNANu0Au1qwyyRYI6df9Ku3-ykuM1dffLEpneKS5ZTWiEKKvNDN0sU`;
	try {
		const response = await axios.request({
			method,
			url: apiURL + endpoint1,
			params: {
				keys: 'temperature,humidity',
				useStrictDataTypes: true,
				timeout: 5000,
			},
			headers: { Authorization: `Bearer ${token}` },
		});

		// Process the data after receiving a response from the server
		const data = response.data;
		let groupedData = {};
		['temperature', 'humidity', 'soilMoisture'].forEach((key) => {
			data[key].forEach((item) => {
				if (!groupedData[item.ts]) {
					newTs =new Date(item.ts);
					newTs.setHours(newTs.getHours() + 7);
					let formattedDate = newTs
						.toISOString()
						.slice(0, 19)
						.replace('T', ' ');
				
					groupedData[item.ts] = {
						ts: formattedDate,
						temperature: null,
						humidity: null,
						soilMoisture: null,
					};
				}
				groupedData[item.ts][key] = item.value;
			});
		});

		// Insert each group into the database if it doesn't already exist
		const sqlInsert = `INSERT INTO data (temperature, humidity, soilMoisture, ts) VALUES (?, ?, ?, ?)`;
		const sqlSelect = `SELECT * FROM data WHERE ts = ?`;
		Object.values(groupedData).forEach((item) => {
			db.query(sqlSelect, [item.ts], (err, result) => {
				if (err) throw err;
				if (result.length === 0) {
					// If the timestamp does not already exist in the database
					db.query(
						sqlInsert,
						[item.temperature, item.humidity, item.soilMoisture, item.ts],
						(err, result) => {
							if (err) throw err;
							console.log('Data posted to database');
						}
					);
				}
			});
		});
	} catch (error) {
		console.error('Error when sending request:', error);
	}
};

module.exports = sendRequestWhenMiss;

