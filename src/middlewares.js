import fastGlob from 'fast-glob';
import { importFiles } from './utils/promises.js';

const middlewareWrapper = handler => {
	return async (req, res, next) => {
		if (!req.stuff) {
			req.stuff = {};
		}

		const { params, query, stuff } = req;
		const ctx = { params, query, stuff };
		try {
			const data = await handler(ctx);
			if (!data) return next();

			const { status = 200, body, headers = {} } = data;
			res.status(status).set(headers).send(body);
		} catch (err) {
			// TODO: handle errors
			console.log(err);
		}
	};
};

const getMiddlewares = async () => {
	const files = await fastGlob('middlewares/*.js', { absolute: true });
	const resolvedFiles = await importFiles(files);

	return files.reduce((acc, file, i) => {
		const fileName = file.split('/').pop().replace('.js', '');
		const handler = resolvedFiles[i].default;
		acc.set(fileName, middlewareWrapper(handler));

		return acc;
	}, new Map());
};

const availableMiddlewares = await getMiddlewares();
const globalMiddlewares = [];
availableMiddlewares.forEach((value, key) => {
	if (!key.endsWith('.global')) return;
	globalMiddlewares.push(value);
});

/**
 *
 * @param {[string]} controllerMiddlewaresList
 * @param {string} key
 * @returns {Array}
 */
export const attachMiddlewares = (controllerMiddlewaresList = [], key) => {
	const middlewares = [...globalMiddlewares];
	controllerMiddlewaresList.forEach(item => {
		let name = item;
		if (item.includes(':')) {
			let split = item.split(':');
			name = split[1];
			let methods = split[0].split(',');
			if (!methods.includes(key)) return;
		}

		if (!availableMiddlewares.has(name)) return;
		middlewares.push(availableMiddlewares.get(name));
	});

	return middlewares;
};
