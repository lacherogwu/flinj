import { createCtx } from './utils/request.js';

const middlewareWrapper = handler => {
	return async (req, res, next) => {
		try {
			const data = await handler(createCtx(req));
			if (!data) return next();

			const { status = 200, body, headers = {} } = data;
			res.status(status).set(headers).send(body);
		} catch (err) {
			// TODO: handle errors
			console.log(err);
		}
	};
};

let availableMiddlewares = new Map();
let globalMiddlewares = [];

const getAvailableMiddlewares = (files, resolvedFiles) =>
	files.reduce((acc, file, i) => {
		const fileName = file.split('middlewares/').pop().replace('.js', '');
		const handler = resolvedFiles[i].default;
		acc.set(fileName, middlewareWrapper(handler));

		return acc;
	}, new Map());

const addGlobalMiddlewares = () => {
	availableMiddlewares.forEach((value, key) => {
		if (!key.endsWith('.global')) return;
		globalMiddlewares.push(value);
	});
};

export const initMiddlewares = (files, resolvedFiles) => {
	availableMiddlewares = getAvailableMiddlewares(files, resolvedFiles);
	addGlobalMiddlewares();
};

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
