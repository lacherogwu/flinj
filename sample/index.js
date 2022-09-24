import { createApp } from '../src/index.js';

const app = await createApp({
	controllersDir: './controllers',
	middlewaresDir: './middlewares',
	// debug: true,
});
app.start(3002);
