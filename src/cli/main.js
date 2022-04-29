#!/usr/bin/env node
import nodemon from 'nodemon';
import { config } from '../config/index.js';

const { port } = config;
const [env] = process.argv.slice(2);
const isDev = env === 'dev';

console.log(`listening at http://localhost:${port}`);

// if (isDev) {
// 	nodemon({
// 		script: 'index.js',
// 	});
// } else {
// 	await new Promise(resolve => setTimeout(resolve, 10000));
// }
