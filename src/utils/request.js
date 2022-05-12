export const createCtx = req => {
	if (!req.stuff) {
		req.stuff = {};
	}
	const { params, query, stuff, _parsedUrl } = req;
	// TODO: think about adding METHOD

	return { url: _parsedUrl, params, query, stuff };
};
