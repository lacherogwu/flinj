import { terser } from 'rollup-plugin-terser';

export default {
	input: 'src/main.js',
	output: [
		{
			file: 'lib/main.mjs',
			format: 'esm',
		},
		// {
		// 	file: 'lib/main.cjs',
		// 	format: 'cjs',
		// },
	],
	external: ['fast-glob'],
	plugins: [terser()],
};
