import fs from 'fs/promises';

export const readFile = path => fs.readFile(path, 'utf-8');
export const exists = path =>
	fs
		.stat(path)
		.then(() => true)
		.catch(() => false);
