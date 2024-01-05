const axios = require('axios');
const db = require('../database/database');

// Define the URL of the API
const apiURL = 'https://demo.thingsboard.io:443/api/plugins/telemetry';

// Define the endpoint and method
const endpoint =
	'/DEVICE/4c2fe410-cd78-11ed-9b15-dd2dac50548f/values/timeseries?keys=temperature%2Chumidity%2CsoilMoisture&useStrictDataTypes=true&fbclid=IwAR1Cu4BUQYVIJVR_fOmmypSm2BXehnid8iO__7dOVAUnDy6-eX8NgtoLgpA';

const method = 'GET';

// Authenticate via token
const token =
	'eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJ2YW4ucGhhbWRpbmh2YW4yMkBoY211dC5lZHUudm4iLCJ1c2VySWQiOiI2NmMxNzYyMC1iOGNiLTExZWQtOWIxNS1kZDJkYWM1MDU0OGYiLCJzY29wZXMiOlsiVEVOQU5UX0FETUlOIl0sInNlc3Npb25JZCI6IjczNGIzNGU4LTZjMDctNGNmMy1iODg2LWZkN2I4MjQyYzNmZiIsImlzcyI6InRoaW5nc2JvYXJkLmlvIiwiaWF0IjoxNzAxMjg0ODk0LCJleHAiOjE3MDMwODQ4OTQsImZpcnN0TmFtZSI6IlbEgk4iLCJsYXN0TmFtZSI6IlBI4bqgTSDEkMOMTkgiLCJlbmFibGVkIjp0cnVlLCJwcml2YWN5UG9saWN5QWNjZXB0ZWQiOnRydWUsImlzUHVibGljIjpmYWxzZSwidGVuYW50SWQiOiI2NTMzYWEzMC1iOGNiLTExZWQtOWIxNS1kZDJkYWM1MDU0OGYiLCJjdXN0b21lcklkIjoiMTM4MTQwMDAtMWRkMi0xMWIyLTgwODAtODA4MDgwODA4MDgwIn0.XL8r6u_GK7RtHLgr6kmCrn1ljod3SiLQqq-nHUvXwgBkRCVwwRTh0ug51_Xcg3rEXQaE_lKONlHbzIDYt1NDow'; // Replace YOUR_AUTH_TOKEN with your authentication token

function sendRequest(data) {
	// data.createdAt = Date.now();
	const sql = `INSERT INTO data (temperature, humidity, soilMoisture, ts) VALUES (?, ?, ?, ?)`;
	const temp = data.temperature[0].ts;

	data.temperature[0].ts = new Date(data.temperature[0].ts);

	data.temperature[0].ts.setHours(data.temperature[0].ts.getHours() + 7);
	let formattedDate = data.temperature[0].ts
		.toISOString()
		.slice(0, 19)
		.replace('T', ' ');

	db.query(
		sql,
		[
			data.temperature[0].value,
			data.humidity[0].value,
			data.soilMoisture[0].value,
			formattedDate,
		],
		(err, result) => {
			if (err) throw err;
			console.log('Data posted to database');
		}
	);
	data.temperature[0].ts = temp;
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
				timeout: 5000,
			},
			headers: { Authorization: `Bearer ${token}` },
		});

		// Process the data after receiving a response from the server
		const data = response.data;
		delete preData['id'];
		delete preData['ts'];

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
