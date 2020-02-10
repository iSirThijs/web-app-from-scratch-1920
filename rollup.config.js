export default {
	input: 'src/app.mjs',
	output: {
		file: 'docs/scripts/app.js',
		format: 'umd'
	},
	watch: {
		exclude: 'node_modules/**'
	}
}