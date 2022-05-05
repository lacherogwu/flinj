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
export default ({ query }) => {
	if (query.error === 'true') {
		// throw new AppError('You are not allowed to use this app', 404);
		return unAuthorized();
	} else if (query.error === 'redirect-me') {
		return redirect('/workspaces/41');
	}

	console.log('auth middleware');
};
