const express = require('express');
const cors = require('cors');

const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');
const userRouter = require('./routes/userRoutes');
const taskRouter = require('./routes/dataRoutes');

const app = express();

// 1) MIDDLEWARE
app.use(express.json());
app.use(cors());

// ROUTES
app.use('/api/users', userRouter);
app.use('/api/data', taskRouter);

// Unhandled Routes
app.all('*', (req, res, next) => {
	// res.status(404).json({
	// 	status: 'fail',
	// 	message: `Can't find ${req.originalUrl} on this server!`
	// })
	next(new AppError(`Can't find ${req.originalUrl} on this server!`));
});

app.use(globalErrorHandler);

module.exports = app;
