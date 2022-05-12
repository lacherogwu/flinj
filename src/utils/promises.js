/** @param {Array} files  */
export const importFiles = files => {
	const promises = files.map(file => import(file));
	return Promise.all(promises);
};
