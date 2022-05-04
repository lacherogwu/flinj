export const get = ctx => {
	return {
		body: {
			hello: true,
		},
	};
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

export const middlewares = ['get,post:a', 'post:b', 'c', 'del:d'];
