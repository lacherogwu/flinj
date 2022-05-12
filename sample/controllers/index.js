export const get = ctx => {
	console.log('GET / route');
	console.log(ctx);
	const { userId } = ctx.stuff;
	console.log(`userId: ${userId} is accessing`);
	return {
		status: 404,
		body: {
			hey: true,
		},
	};
};

export const del = () => ({
	status: 404,
	body: {
		hey: true,
	},
});

export const middlewares = ['get:auth', 'get:second'];
