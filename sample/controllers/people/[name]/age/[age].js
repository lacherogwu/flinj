export const get = ctx => {
	const { params } = ctx;
	return {
		body: {
			hello: true,
			params,
		},
	};
};

export const middlewares = ['core'];
