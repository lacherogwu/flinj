import { createCtx } from './utils/request.js';

const middlewareWrapper = handler => {
	return async (req, res, next) => {
		try {
			const data = await handler(createCtx(req));
			if (!data) return next();

			const { status = 200, body, headers = {} } = data;
			res.status(status).set(headers).send(body);
		} catch (err) {
			next(err);
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
 * @param {string} controllerKey
 * @returns {Array}
 */
export const attachMiddlewares = (controllerMiddlewaresList = [], controllerKey) => {
	const middlewares = [...globalMiddlewares];
	controllerMiddlewaresList.forEach(item => {
		let middlewareName = item;
		if (item.includes(':')) {
			const split = item.split(':');
			middlewareName = split[1];
			const allKeys = split[0].split(',');

			const [startWithKeys, includesKeys] = allKeys.reduce(
				(acc, curr) => {
					if (curr.includes('*')) acc[0].push(curr.replace('*', ''));
					else acc[1].push(curr);

					return acc;
				},
				[[], []]
			);

			// check if controllerKey is not startWith any of startWithKeys or controllerKey not includes in includesKey → exit;
			if (!startWithKeys.some(k => controllerKey.startsWith(k)) && !includesKeys.includes(controllerKey)) return;
		}

		if (!availableMiddlewares.has(middlewareName)) return;
		middlewares.push(availableMiddlewares.get(middlewareName));
	});

	return middlewares;
};
