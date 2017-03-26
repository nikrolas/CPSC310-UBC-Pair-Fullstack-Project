/**
 * Created by Nicky on 2017-03-14.
 */

module.exports = {
    entry: './src/rest/app/component/main.js',
    output: {filename: './src/rest/public/bundle.js' },

    module: {
        loaders: [
            {
                test: /.jsx?$/,
                loader: 'babel-loader',
                exclude: /node-modules/,
                query: {
                    presets: ['es2015', 'react']
                }
            },
            { test: /\.css$/, loader: "style-loader!css-loader"}

        ]
    }
}
