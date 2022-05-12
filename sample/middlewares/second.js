export default ctx => {
	console.log('second middleware');
	console.log(ctx);
	ctx.stuff.userId = 123;
};
