const axios = require('axios');
const db = require('../database/database');

// Define the URL of the API
const apiURL = 'https://demo.thingsboard.io:443/api/plugins/telemetry';

// Define the endpoint and method
const endpoint =
	'/DEVICE/4c2fe410-cd78-11ed-9b15-dd2dac50548f/values/timeseries';
const method = 'GET';

// Authenticate via token
const token =
	'eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJ2YW4ucGhhbWRpbmh2YW4yMkBoY211dC5lZHUudm4iLCJ1c2VySWQiOiI2NmMxNzYyMC1iOGNiLTExZWQtOWIxNS1kZDJkYWM1MDU0OGYiLCJzY29wZXMiOlsiVEVOQU5UX0FETUlOIl0sInNlc3Npb25JZCI6IjczNGIzNGU4LTZjMDctNGNmMy1iODg2LWZkN2I4MjQyYzNmZiIsImlzcyI6InRoaW5nc2JvYXJkLmlvIiwiaWF0IjoxNzAxMjg0ODk0LCJleHAiOjE3MDMwODQ4OTQsImZpcnN0TmFtZSI6IlbEgk4iLCJsYXN0TmFtZSI6IlBI4bqgTSDEkMOMTkgiLCJlbmFibGVkIjp0cnVlLCJwcml2YWN5UG9saWN5QWNjZXB0ZWQiOnRydWUsImlzUHVibGljIjpmYWxzZSwidGVuYW50SWQiOiI2NTMzYWEzMC1iOGNiLTExZWQtOWIxNS1kZDJkYWM1MDU0OGYiLCJjdXN0b21lcklkIjoiMTM4MTQwMDAtMWRkMi0xMWIyLTgwODAtODA4MDgwODA4MDgwIn0.XL8r6u_GK7RtHLgr6kmCrn1ljod3SiLQqq-nHUvXwgBkRCVwwRTh0ug51_Xcg3rEXQaE_lKONlHbzIDYt1NDow'; // Replace YOUR_AUTH_TOKEN with your authentication token


function sendRequest(data) {
	data.createdAt = Date.now();
	console.log("Data here", data.temperature);
	const sql = `INSERT INTO data (temperature, humidity,ts) VALUES (?, ?, ?)`;
	db.query(
		sql,
		[data.temperature[0].value, data.humidity[0].value, data.temperature[0].ts],
		(err, result) => {
			if (err) throw err;
			console.log('Data posted to database', data);
			console.log('Result posted to database', result);
		}
	);
}

// Function to send long polling request
let preData = {};
const sendLongPollingRequest = async () => {
	try {
		const response = await axios.request({
			method,
			url: apiURL + endpoint,
			params: {
				keys: 'temperature,humidity',
				useStrictDataTypes: true,
				timeout: 5000, // Time to wait for a response from the server (5 seconds)
			},
			headers: { Authorization: `Bearer ${token}` },
		});

		// Process the data after receiving a response from the server
		const data = response.data;
		delete preData['id'];
		delete preData['createdAt'];

		if (JSON.stringify(preData) == JSON.stringify(data)) {
			console.log('The data retrieved is duplicated');
		} else {
			sendRequest(data);
			preData = data;
		}
	} catch (error) {
		console.error('Error when sending request:', error);
	} finally {
		// Send long polling request after 5 seconds
		setTimeout(sendLongPollingRequest, 5000);
	}
};

// Send the initial long polling request
module.exports = sendLongPollingRequest;
