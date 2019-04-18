import HTMLPlugin from 'html-webpack-plugin'
import CleanPlugin from 'clean-webpack-plugin'

const settings = {
	entry: `${__dirname}/src/entry.jsx`,

	module: {
		rules: [
			{
				test: /\.jsx?$/,
				include: [`${__dirname}/src`],
				use: ['babel-loader'],
			},
		],
	},

	plugins: [
		new HTMLPlugin({
			template: `${__dirname}/src/index.html`,
		}),
		new CleanPlugin(),
	],

	resolve: {
		extensions: ['.js', '.json', '.jsx'],
	},
}

export default (env, { mode = 'development' }) => ({
	...settings,
	mode,
})
