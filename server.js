const dotenv = require('dotenv');
const sendLongPollingRequest = require('./handle/handle');

dotenv.config({
	path: './config.env',
});

const app = require('./app');

const port = process.env.PORT || 5000;

app.listen(port, () => {
	console.log(`app running on port ${port}....`);
});
sendLongPollingRequest();
