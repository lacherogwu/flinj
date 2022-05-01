export default (req, res, next) => {
	console.log('Look at this middleware');
	next();
};
