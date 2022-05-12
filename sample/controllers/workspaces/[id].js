export const get = ctx => {
	console.log(ctx);
	return {
		body: {
			hello: true,
		},
	};
};

export const middlewares = ['a'];
