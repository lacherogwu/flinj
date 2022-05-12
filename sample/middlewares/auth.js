import { AppError } from '../../src/main.js';
const unAuthorized = () => ({
	status: 401,
	body: {
		message: 'you are not allowed to access here',
	},
});

const redirect = location => ({
	status: 301,
	headers: {
		location,
	},
});

export default ctx => {
	if (ctx.query.error === 'true') {
		const err = new Error();
		err.isAxiosError = true;
		err.message = 'cool';
		err.response = {
			status: 401,
			data: {
				item: 'xxx',
			},
		};
		throw err;
		return unAuthorized();
	} else if (ctx.query.error === 'redirect-me') {
		return redirect('/workspaces/41');
	}

	console.log('auth middleware');
	// console.log(ctx);
	ctx.query.something = 'cool';
};
