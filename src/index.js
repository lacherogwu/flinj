import { resolve as pathResolve } from 'path';
import { URL } from 'url';
import express from 'express';
import fastGlob from 'fast-glob';
import fs from 'fs/promises';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import AppError from './AppError.js';

function getPath(...paths) {
	const rootDir = process.cwd();
	return paths.map(path => pathResolve(rootDir, path));
}

function parseRoutesObject(input, result = { '*': 'string' }, path) {
	for (const key in input) {
		const value = input[key];
		if (typeof value === 'object') {
			result[`${key}/*`] = 'string';
			parseRoutesObject(value, result, key);
		} else if (typeof value === 'function') {
			result[`${path}/${value.name}`] = 'string';
		}
	}

	return result;
}

async function generateRoutesInterface(input) {
	const object = parseRoutesObject(input);
	const interfaceString = Object.entries(object)
		.map(([key, value]) => `'${key}': ${value};`)
		.join(' ');

	const rootDir = new URL('../types/', import.meta.url).pathname;

	let data = `export interface Routes { ${interfaceString} }`;
	await fs.writeFile(rootDir + 'ROUTES.d.ts', data);
}

async function resolveFiles(...paths) {
	return Promise.all(
		paths.map(async pathList => {
			const resolvedModules = await Promise.all(pathList.map(path => import(path)));
			return pathList.reduce((acc, path, i) => {
				const key = path.slice(path.lastIndexOf('/') + 1, -3);
				acc[key] = resolvedModules[i];
				return acc;
			}, {});
		})
	);
}

async function getFileList(...paths) {
	return Promise.all(paths.map(path => fastGlob(path + '/*.js')));
}

function createMiddlewaresMap(middlewares) {
	const middlewaresMap = new Map();
	Object.entries(middlewares).forEach(([_, { default: handler, use }]) => {
		if (!use?.length) return;
		use.forEach(route => {
			if (middlewaresMap.has(route)) {
				middlewaresMap.get(route).push(handler);
			} else {
				middlewaresMap.set(route, [middlewareWrapper(handler)]);
			}
		});
	});
	return middlewaresMap;
}

/**
 *
 * @param {express.Request} req
 * @param {express.Response} res
 * @returns
 */
function createCtx(req, res) {
	if (!req.stuff) {
		req.stuff = {};
	}
	const { body, params, query, cookies, _parsedUrl, stuff } = req;
	// TODO: think about adding METHOD

	/**
	 *
	 * @param {string} name
	 * @param {string} value
	 * @param {express.CookieOptions} options
	 */
	function setCookie(name, value, options) {
		res.cookie(name, value, options);
	}

	function setHeaders(headers) {
		res.set(headers);
	}

	return { body, url: _parsedUrl, params, query, cookies, stuff, setCookie, setHeaders };
}

function controllerWrapper(handler) {
	return async (req, res, next) => {
		try {
			let status = 200;
			const response = await handler(createCtx(req, res));
			if (response == null) status = 204;

			return res.status(status).json(response);
		} catch (err) {
			next(err);
		}
	};
}

function middlewareWrapper(handler) {
	return async (req, res, next) => {
		try {
			await handler(createCtx(req, res));
			next();
		} catch (err) {
			next(err);
		}
	};
}

function generateRoutes({ controllers, middlewares }) {
	const middlewaresMap = createMiddlewaresMap(middlewares);

	const routes = [];
	Object.entries(controllers).forEach(([rootPath, controllers]) => {
		Object.entries(controllers).forEach(([controllerKey, handler]) => {
			const [_method, _name = ''] = controllerKey.split('_');
			const method = _method.toLocaleLowerCase();
			const name = _name?.replace('$', ':');

			const route = '/' + [rootPath, name].filter(Boolean).join('/');

			// TODO: needs refactor
			const matchMiddlewareKeys = ['*', `${rootPath}/*`, `${rootPath}/${controllerKey}`];
			const allMiddlewares = matchMiddlewareKeys.filter(key => middlewaresMap.has(key)).flatMap(key => middlewaresMap.get(key));
			const middlewares = [...new Set(allMiddlewares)];

			routes.push({
				method,
				route,
				middlewares,
				handler: controllerWrapper(handler),
			});
		});
	});

	return routes;
}

export async function createApp(options = {}) {
	let { controllersDir, middlewaresDir } = options;
	[controllersDir, middlewaresDir] = getPath(controllersDir, middlewaresDir);

	const [controllerFileList, middlewareFileList] = await getFileList(controllersDir, middlewaresDir);
	// TODO: read the file as text instead of js module, to keep the function position correct
	const [controllers, middlewares] = await resolveFiles(controllerFileList, middlewareFileList);
	generateRoutesInterface(controllers);

	const routes = generateRoutes({ controllers, middlewares });
	const app = express();

	return {
		addMiddleware(...middlewares) {
			middlewares.forEach(middleware => app.use(middleware));
			return this;
		},
		start(port) {
			this.addMiddleware(...getDefaultMiddlewares());
			setRoutes(routes);
			applyErrorHandlers();
			app.listen(port, () => console.log(`listening at http://localhost:${port}`));
		},
	};

	function setRoutes(routes) {
		routes.forEach(item => {
			const { method, route, middlewares, handler } = item;
			app[method](route, ...middlewares, handler);
		});
	}

	function applyErrorHandlers() {
		app.all('*', notFoundErrorHandler);
		app.use(globalErrorHandler);
	}

	function getDefaultMiddlewares() {
		return [express.json(), cookieParser(), helmet()];
	}
}

function notFoundErrorHandler(req, res, next) {
	return next(error(404, `Can't find ${req.originalUrl} on this server!`));
}

function globalErrorHandler(err, req, res, next) {
	const { isOperational } = err;
	let { message, status = 500 } = err;
	if (!isOperational) {
		console.log(err);
		status = 500;
		message = 'Something went wrong!';
	}

	return res.status(status).json({ message });
}

export function useMiddleware(...routes) {
	return routes;
}

export function error(status, body) {
	return new AppError(status, body);
}
