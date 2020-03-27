const path = require('path');

module.exports = {
  entry: './src/js/jazzify.ai.js',
  mode: 'development',
  output: {
    filename: 'jazzify.ai.js',
    path: path.resolve(__dirname, 'dist/js'),
  }
};