export default {
	input: 'src/app.mjs',
	output: {
		file: 'docs/scripts/app.js',
		format: 'umd',
		sourcemap: true
	},
	watch: {
		exclude: 'node_modules/**'
	}
}