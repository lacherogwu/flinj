import express from 'express';
import { generateControllers } from 'flinj';

const app = express();

const controllers = await generateControllers();

controllers.forEach(item => {
	const { method, name, handler } = item;
	app[method](name, handler);
});

// console.log(controllers);

const port = 3000;
app.listen(port, () => console.log(`listening at ${port}`));
