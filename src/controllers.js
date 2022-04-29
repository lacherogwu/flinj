import fastGlob from 'fast-glob';
// TODO: replace fastGlob to fs.readDir if possible
import { importFiles } from './utils/promises.js';

// TODO: support many libraries not only express
// TODO: allow to manipulate this
// TOOD: add error handler
const controllerWrapper = handler => {
	return async (req, res, next) => {
		const { params, query } = req;

		const ctx = { params, query };
		try {
			const data = await handler(ctx);
			res.status(200).json({ success: true, data });
		} catch (err) {
			res.status(500).json({ success: false, message: err.message });
		}
	};
};

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

			const object = {
				method,
				name: `${routePath}/${name}`,
				handler: controllerWrapper(value),
			};
			acc.push(object);
		});

		return acc;
	}, []);

	return controllers;
};
