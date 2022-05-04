import fastGlob from 'fast-glob';
import { importFiles } from './utils/promises.js';

const middlewareWrapper = handler => {
	return async (req, res, next) => {
		const { params, query } = req;
		const ctx = { params, query };
		try {
			await handler(ctx);
			next();
		} catch (err) {
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

/**
 *
 * @param {[string]} controllerMiddlewaresList
 * @param {string} key
 * @returns {Array}
 */
export const attachMiddlewares = (controllerMiddlewaresList = [], key) => {
	const middlewares = [];
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
