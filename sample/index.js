import express from 'express';
import { generateControllers } from 'flinj';

const app = express();

const controllers = await generateControllers();
controllers.forEach(item => {
	const { method, route, handler, middlewares } = item;
	app[method](route, ...middlewares, handler);
});

const port = 3000;
app.listen(port, () => console.log(`listening at ${port}`));
