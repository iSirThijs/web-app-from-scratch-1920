import alias from '@rollup/plugin-alias'

export default {
	input: 'src/router.mjs',
	output: {
		file: 'docs/scripts/main.js',
		format: 'umd',
		sourcemap: true
	},
	watch: {
		exclude: 'node_modules/**'
	},
	plugins: [
		alias({
			entries: {
				utils: 'src/utilities',
				modules: 'src/modules',
				components: 'src/components',
				pages: 'src/pages'
			}
		})
	]
}