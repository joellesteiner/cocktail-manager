const path = require('path');

module.exports = {
    entry: './src/index.js', // Entry point for your React app
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: 'bundle.js', // Output bundled file
    },
    module: {
        rules: [
            {
                test: /\.js$/,
                exclude: /node_modules/,
                use: {
                    loader: 'babel-loader',
                },
            },
        ],
    },
    resolve: {
        extensions: ['.js', '.jsx'], // Resolve .js and .jsx extensions
    },
    devServer: {
        contentBase: path.join(__dirname, 'dist'),
        port: 3000, // Run server on port 3000
    },
};
