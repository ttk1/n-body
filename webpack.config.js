const path = require('path');

module.exports = {
  entry: {
    index: './index.ts'
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'index.js'
  },
  devServer: {
    contentBase: 'public',
    port: 3000
  },
  module: {
    rules: [{
      test: /\.glsl$/,
      exclude: [/node_modules/],
      use: 'raw-loader'
    },
    {
      test: /\.ts$/,
      exclude: [/node_modules/],
      use: 'ts-loader'
    }]
  }
};