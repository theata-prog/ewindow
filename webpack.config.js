'use strict'
var path = require('path');

module.exports = {
  context: __dirname + '/app',
  mode: 'none',
  entry: './entry',
  output: {
    path: __dirname + '/public/images',
    filename: 'main.js'
  },
  module: {
    rules: [
      {
        test: /\.(jpg|png|gif|jpeg)$/,
        exclude: /node_modules/,
        use: [
          {
            loader: 'file-loader',
            options: {
              name: '[name].[ext]',
              outputPath: 'public/images/',
              publicPath: function (path) {
                return '../' + path;
              },
              loader: 'babel-loader',
              options: {
                presets: ['@babel/preset-env']
              }
            }
          }
        ]
      }
    ]
  }
};