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

/** @param {Array} controllerMiddlewaresList */
export const attachMiddlewares = (controllerMiddlewaresList = []) => {
	const middlewares = [];
	controllerMiddlewaresList.forEach(name => {
		if (!availableMiddlewares.has(name)) return;
		middlewares.push(availableMiddlewares.get(name));
	});

	return middlewares;
};
