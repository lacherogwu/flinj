export default ({ stuff }) => {
	console.log('a middleware');
	console.log(stuff);
	stuff.userId = 1;
	stuff.user = { user: { id: 1, name: 'Asaf' } };
	throw new Error();
};
