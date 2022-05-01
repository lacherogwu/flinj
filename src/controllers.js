import fastGlob from 'fast-glob';
// TODO: replace fastGlob to fs.readDir if possible
import { importFiles } from './utils/promises.js';
import { attachMiddlewares } from './middlewares.js';

// TODO: support many libraries not only express
// TODO: allow to manipulate this
// TOOD: add error handler
const controllerWrapper = handler => {
	return async (req, res, next) => {
		const { params, query } = req;
		const ctx = { params, query };
		try {
			const data = await handler(ctx);
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
			res.status(500).json({ success: false, message: err.message });
		}
	};
};

const HTTP_METHODS = ['get', 'post', 'put', 'patch', 'delete'];
export const generateControllers = async () => {
	const files = await fastGlob('controllers/**/*.js', { absolute: true });
	const resolvedFiles = await importFiles(files);

	const controllers = files.reduce((acc, file, i) => {
		const controllerFunctions = resolvedFiles[i];
		let [, routePath] = file.split('controllers');
		routePath = routePath.replace('.js', '');
		if (routePath.endsWith('/index')) routePath = routePath.slice(0, -6);

		Object.entries(controllerFunctions).forEach(([key, value]) => {
			let [method, ...name] = key.split('_');
			name = name.join('/');
			if (method == 'del') method = 'delete';
			if (name.includes('$')) name = name.replace(/\$/g, ':');
			if (!HTTP_METHODS.includes(method)) return;

			const { middlewares: middlewaresList } = controllerFunctions;
			const middlewares = attachMiddlewares(middlewaresList);

			const object = {
				method,
				name: `${routePath}/${name}`,
				handler: controllerWrapper(value),
				middlewares,
			};
			acc.push(object);
		});

		return acc;
	}, []);

	return controllers;
};
