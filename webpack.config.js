const webpack = require('webpack');
const path = require('path');
const dest = path.join(__dirname, './build/');

module.exports = {
  entry: __dirname + '/src/index.js',
  module: {
    rules: [
      {
        test: /\.(js)$/,
        include: path.join(__dirname, './src/'),
        use: ['babel-loader']
      }
    ]
  },
  resolve: {
    extensions: ['*', '.js']
  },
  output: {
    path: dest,
    publicPath: 'build/',
    filename: 'webvideo.js',
    library: 'WebVideo',
    libraryTarget: 'umd'
  },
  watch: true,
  devtool: "source-map"
};

