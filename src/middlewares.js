import fastGlob from 'fast-glob';
import { importFiles } from './utils/promises.js';

const getMiddlewares = async () => {
	const files = await fastGlob('middlewares/*.js', { absolute: true });
	const resolvedFiles = await importFiles(files);

	return files.reduce((acc, file, i) => {
		const fileName = file.split('/').pop().replace('.js', '');
		acc.set(fileName, resolvedFiles[i].default);

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
