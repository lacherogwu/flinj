import { response } from '../utils/index.js';

export const get = ctx => {
	return response({
		thisIsCool: true,
		evenMoreCool: 'yes',
	});
};

export const post = ctx => {
	return {
		body: {
			hello: true,
		},
	};
};

export const del = ctx => {
	return {
		body: {
			hello: true,
		},
	};
};

export const middlewares = ['get,post:a', 'post:b', 'get:c', 'del:d'];
