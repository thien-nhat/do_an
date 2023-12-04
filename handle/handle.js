const axios = require('axios');
const { MongoClient, ServerApiVersion } = require('mongodb');

// Xác định URL của API
const apiURL = 'https://demo.thingsboard.io:443/api/plugins/telemetry';

// Xác định endpoint và phương thức
const endpoint =
	'/DEVICE/4c2fe410-cd78-11ed-9b15-dd2dac50548f/values/timeseries';
const method = 'GET';

// Xác thực thông qua token
const token =
	'eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJ2YW4ucGhhbWRpbmh2YW4yMkBoY211dC5lZHUudm4iLCJ1c2VySWQiOiI2NmMxNzYyMC1iOGNiLTExZWQtOWIxNS1kZDJkYWM1MDU0OGYiLCJzY29wZXMiOlsiVEVOQU5UX0FETUlOIl0sInNlc3Npb25JZCI6IjczNGIzNGU4LTZjMDctNGNmMy1iODg2LWZkN2I4MjQyYzNmZiIsImlzcyI6InRoaW5nc2JvYXJkLmlvIiwiaWF0IjoxNjk2NjAyODQ5LCJleHAiOjE2OTg0MDI4NDksImZpcnN0TmFtZSI6IlbEgk4iLCJsYXN0TmFtZSI6IlBI4bqgTSDEkMOMTkgiLCJlbmFibGVkIjp0cnVlLCJwcml2YWN5UG9saWN5QWNjZXB0ZWQiOnRydWUsImlzUHVibGljIjpmYWxzZSwidGVuYW50SWQiOiI2NTMzYWEzMC1iOGNiLTExZWQtOWIxNS1kZDJkYWM1MDU0OGYiLCJjdXN0b21lcklkIjoiMTM4MTQwMDAtMWRkMi0xMWIyLTgwODAtODA4MDgwODA4MDgwIn0.uWioCBpjNsrdRLrx7uJJBsbx04cOVP_-RCWEBhPEuXkHNJGX7bz1dlfx4JBnWgF2v33Kj8zdO9VyAILFbBZgyA'; // Thay YOUR_AUTH_TOKEN bằng token xác thực của bạn

function sendRequest(data) {
	const uri =
		'mongodb+srv://ngonhatthien2:thien@cluster0.pc7iuz4.mongodb.net/?retryWrites=true&w=majority';

	// Create a MongoClient with a MongoClientOptions object to set the Stable API version
	const client = new MongoClient(uri, {
		serverApi: {
			version: ServerApiVersion.v1,
			strict: true,
			deprecationErrors: true,
		},
	});
    data.createdAt = Date.now();
	async function run() {
		try {
			// Connect the client to the server	(optional starting in v4.7)
			await client.connect();
			// Send a ping to confirm a successful connection
			await client
				.db('project_cse')
				.collection('datas')
				.insertOne(data, (err, result) => {
					if (err) {
						console.log(err);
						return;
					}
					console.log(result);
				});

			console.log('Đã post dữ liệu lên database', data);
		} finally {
			// Ensures that the client will close when you finish/error
			await client.close();
		}
	}
	run().catch(console.dir);
}

// Hàm để gửi yêu cầu long polling
let preData = {};
const sendLongPollingRequest = async () => {
	try {
		const response = await axios.request({
			method,
			url: apiURL + endpoint,
			params: {
				keys: 'temperature,humidity',
				useStrictDataTypes: true,
				timeout: 5000, // Thời gian chờ phản hồi từ server (5 giây)
			},
			headers: { Authorization: `Bearer ${token}` },
		});

		// Xử lý dữ liệu sau khi nhận phản hồi từ server
		const data = response.data;
		delete preData['_id'];
        delete preData['createdAt'];

		// console.log('Predata', preData);
		// console.log('Data', data);

		if (JSON.stringify(preData) == JSON.stringify(data)) {
			console.log('Dữ liệu lấy về bị trùng lặp');
		} else {
			sendRequest(data);
			preData = data;
		}
	} catch (error) {
		console.error('Lỗi khi gửi yêu cầu:', error);
	} finally {
		// Gửi yêu cầu long polling sau 5 giây
		setTimeout(sendLongPollingRequest, 5000);
	}
};

// Gửi yêu cầu long polling ban đầu
// sendLongPollingRequest();
module.exports = sendLongPollingRequest;
