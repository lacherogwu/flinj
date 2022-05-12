import express from 'express';
import { generateControllers, notFoundErrorHandler, globalErrorHandler, AppError } from '../src/main.js';

const app = express();

const controllers = await generateControllers();

controllers.forEach(item => {
	const { method, route, handler, middlewares } = item;
	app[method](route, ...middlewares, handler);
});

const errorsList = [
	{
		identifier: 'isAxiosError',
		value: true,
		mode: 'EQ',
		handler: err => {
			const status = err.response ? err.response.status : 500;
			const message = !err.message.startsWith('Request') ? err.message : undefined;
			const data = err.response ? err.response.data : undefined;

			return new AppError(message, status, data);
		},
	},
	{
		identifier: 'name',
		value: 'CastError',
		mode: 'EQ',
		handler: err => new AppError(`Invalid ${err.path}: ${err.value}`, 400),
	},
	{
		identifier: 'message',
		value: 'User does not exists',
		mode: 'EQ',
		handler: err => new AppError(err.message, 404),
	},
	{
		identifier: 'name',
		value: 'ValidationError',
		mode: 'EQ',
		handler: err => {
			const message = Object.values(err.errors)
				.map(i => i.message)
				.join(', ');
			return new AppError(`Invalid input data. ${message}`, 400);
		},
	},
	{
		identifier: 'code',
		value: 11000,
		mode: 'EQ',
		handler: err => {
			const entries = Object.entries(err.keyValue);
			return new AppError(`Duplicated key. ${entries[0][0]}: ${entries[0][1]}`, 400);
		},
	},
];

app.all('*', notFoundErrorHandler);
app.use(globalErrorHandler({ errorsList, debug: false }));
const port = 3000;
app.listen(port, () => console.log(`listening at ${port}`));
