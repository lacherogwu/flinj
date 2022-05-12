export const get = ctx => {
	console.log('GET / route');
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

export const middlewares = ['auth'];
