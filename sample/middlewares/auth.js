export default (req, res, next) => {
	console.log('auth middleware');
	next();
};
