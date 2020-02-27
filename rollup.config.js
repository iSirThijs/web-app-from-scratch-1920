import alias from '@rollup/plugin-alias'
import serve from 'rollup-plugin-serve'

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
		}),
		... process.env.BUILD === 'dev' ? [ serve('docs') ] : []
	]
}