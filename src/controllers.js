import fastGlob from 'fast-glob';
// TODO: replace fastGlob to fs.readDir if possible
import { importFiles } from './utils/promises.js';
import { attachMiddlewares, initMiddlewares } from './middlewares.js';
import { createCtx } from './utils/request.js';

// TODO: allow to manipulate this (interceptors)
const controllerWrapper = handler => {
	return async (req, res, next) => {
		try {
			const data = await handler(createCtx(req));
			const { status = 200, headers = {} } = data || {};
			let { body = {} } = data || {};

			// TODO: allow to manipulate response object
			if (typeof body === 'object') {
				const parsedBody = { success: true };
				if (Object.keys(body).length > 0) {
					parsedBody.data = body;
				}
				body = parsedBody;
			}

			res.status(status).set(headers).send(body);
		} catch (err) {
			next(err);
		}
	};
};

/** @param {string} string */
const hasDynamicArg = string => /\[[a-z]+\]/gi.test(string);
/** @param {string} string */
const isCatchAll = string => string.includes('[...]');

/** @param {string} route */
const fixRouteSlashes = route => {
	if (!route.startsWith('/')) route = `/${route}`;
	if (route.length > 1 && route.endsWith('/')) route = route.slice(0, -1);

	return route;
};

const HTTP_METHODS = ['get', 'post', 'put', 'delete'];
/**
 *
 * @param {Object} options
 * @param {string} options.prefix
 * @returns {Promise<[{ method: ('get'|'post'|'put'|'delete'), route: string, handler: function, middlewares: function[] }]>}
 */
export const generateControllers = async (options = {}) => {
	const { prefix = '' } = options;

	const fileListPromises = [fastGlob('controllers/**/*.js', { absolute: true }), fastGlob('middlewares/**/*.js', { absolute: true })];
	const [controllersFileList, middlewaresFileList] = await Promise.all(fileListPromises);

	const resolvedFilesPromises = [importFiles(controllersFileList), importFiles(middlewaresFileList)];
	const [controllersResolvedFiles, middlewaresResolvedFiles] = await Promise.all(resolvedFilesPromises);

	initMiddlewares(middlewaresFileList, middlewaresResolvedFiles);

	const controllers = controllersFileList.reduce((acc, file, i) => {
		const controllerFunctions = controllersResolvedFiles[i];
		let [, route] = file.split('controllers');
		route = route.replace('.js', '');

		if (route.endsWith('index')) route = route.slice(0, -5);
		if (hasDynamicArg(route)) {
			route = route.replace(/\[/g, ':').replace(/\]/g, '');
		}
		if (isCatchAll(route)) {
			route = route.replace('[...]', '*');
		}
		route = prefix + route;

		Object.entries(controllerFunctions).forEach(([key, value]) => {
			let [method, name = ''] = key.split('_');
			if (method === 'del') method = 'delete';
			if (!HTTP_METHODS.includes(method)) return;

			if (name.includes('$')) {
				name = name.replace('$', ':');
			}

			if (name) {
				name = route.endsWith('/') ? name : `/${name}`;
			}

			const { middlewares: middlewaresList } = controllerFunctions;
			const middlewares = attachMiddlewares(middlewaresList, key);

			const object = {
				method,
				route: fixRouteSlashes(route + name),
				handler: controllerWrapper(value),
				middlewares,
			};
			acc.push(object);
		});

		return acc;
	}, []);

	return controllers;
};
