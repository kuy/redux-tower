'use strict';

module.exports = {
  entry: './example/src/index.js',
  module: {
    loaders: [{
      test: /\.js$/,
      loader: 'babel-loader',
      exclude: /node_modules/
    }, {
      test: /\.css$/,
      loader: 'style-loader!css-loader'
    }, {
      test: /\.(png|woff|woff2|eot|ttf|svg)(\?v=[0-9]\.[0-9]\.[0-9])?$/,
      loader: 'url-loader'
    }]
  },
  output: {
    path: __dirname + '/build',
    filename: 'bundle.js',
    publicPath: '/in-memory'
  },
  devtool: 'inline-source-map'
};
