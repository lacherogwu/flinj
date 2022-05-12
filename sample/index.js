import express from 'express';
import { generateControllers } from '../src/main.js';

const app = express();

// app.get('/something/*', (req, res, next) => {
// 	console.log(req.params);
// 	res.json({ success: true });
// });
const controllers = await generateControllers();

controllers.forEach(item => {
	const { method, route, handler, middlewares } = item;
	app[method](route, ...middlewares, handler);
});

const port = 3000;
app.listen(port, () => console.log(`listening at ${port}`));
