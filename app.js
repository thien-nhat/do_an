const express = require('express');
const cors = require('cors');

const appError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');
const userRouter = require('./routes/userRoutes');
const dataRouter = require('./routes/dataRoutes');

const app = express();

// 1) MIDDLEWARE
app.use(express.json());
app.use(cors());

// ROUTES
app.use('/api/users', userRouter);
app.use('/api/data', dataRouter);

// Unhandled Routes
app.all('*', (req, res, next) => {
	next(new appError(`Can't find ${req.originalUrl} on this server!`));
});

app.use(globalErrorHandler);

module.exports = app;
