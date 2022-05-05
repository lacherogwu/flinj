export const get = () => ({
	status: 404,
	body: {
		hey: true,
	},
});

export const del = () => ({
	status: 404,
	body: {
		hey: true,
	},
});

export const middlewares = ['get:auth'];
