'use strict';

var webpack = require('webpack');

module.exports = {
  entry: {
    minimum: './examples/minimum/index.js',
    blog: './examples/blog/index.js'
  },
  module: {
    rules: [{
      test: /\.js$/,
      use: [
        'babel-loader'
      ],
      exclude: /node_modules/
    }, {
      test: /\.css$/,
      use: [
        'style-loader',
        'css-loader'
      ]
    }, {
      test: /\.(png|woff|woff2|eot|ttf|svg)(\?v=[0-9]\.[0-9]\.[0-9])?$/,
      use: [
        'url-loader'
      ]
    }]
  },
  output: {
    path: __dirname + '/build',
    filename: '[name].bundle.js',
    publicPath: '/in-memory'
  },
  plugins: (process.env.NODE_ENV === 'production') ? [
    new webpack.DefinePlugin({
      'process.env': { NODE_ENV: JSON.stringify('production') }
    }),
    new webpack.optimize.UglifyJsPlugin({
      compress: { warnings: false }
    })
  ] : []
};
