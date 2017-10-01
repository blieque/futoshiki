const path = require('path');
const webpack = require('webpack');

const HTMLPlugin = require('html-webpack-plugin');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');

module.exports = {
  entry: './src/client.js',
  output: {
    filename: 'bundle-[hash].js',
    hashDigest: 'base64',
    hashDigestLength: 8,
    path: path.resolve(__dirname, 'dist'),
  },
  module: {
    rules: [
      {
        test: /\.html$/,
        loader: 'html-loader',
        options: {
          interpolate: true,
          attrs: ['img:src', 'link:href'],
        },
      },
      {
        test: /\.scss$/,
        use: ExtractTextPlugin.extract({
          use: [
            { loader: 'css-loader', options: {
              sourceMap: true,
              minimize: true
            } },
            { loader: 'sass-loader', options: {
              sourceMap: true
            } },
          ],
        }),
      },
      {
        test: /\.(svg|png|jpe?g|gif|webp|webm|mp4|ogg|wma|mp3|woff|eot)$/,
        loader: 'file-loader',
        options: {
          outputPath: 'assets',
          name: '/[name]-[md5:hash:base64:8].[ext]',
        }
      },
    ],
  },
  plugins: [
    new HTMLPlugin({
      title: 'Futōshiki',
      template: 'src/index.html',
    }),
    new ExtractTextPlugin('[name]-[md5:contenthash:base64:8].css'),
    new UglifyJsPlugin({
      uglifyOptions: {
        output: {
          comments: 'all',
        },
      },
    }),
  ],
};
