const mongoose = require('mongoose');

const dotenv = require('dotenv');
const sendLongPollingRequest = require('./handle/handle');


dotenv.config({
	path: './config.env',
});
const app = require('./app');

const DB = process.env.DATABASE.replace(
	'<PASSWORD>',
	process.env.DATABASE_PASSWORD
);

// CONNECT
mongoose.set('strictQuery', false);
mongoose.connect(DB).then(() => {
	console.log('DB connection successful!');
});
const port = process.env.PORT || 5000;

app.listen(port, () => {
	console.log(`app running on port ${port}....`);
});
sendLongPollingRequest();

