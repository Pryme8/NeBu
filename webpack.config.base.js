const path = require('path');
// Optimizes duplicates in splitted bundles 
const webpack = require('webpack');
// creates index.html file by a template index.ejs
const HtmlWebpackPlugin = require('html-webpack-plugin');
// cleans dist folder
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
// copies the assets folder into dist folder
const CopyWebpackPlugin = require('copy-webpack-plugin');
// output folder location
const distFolder = "./dist";

module.exports = { 
  entry: './src/index.ts',
  plugins: [
    new CleanWebpackPlugin(),
    new HtmlWebpackPlugin({
      template: 'src/index.ejs'
    }),
    new CopyWebpackPlugin({
      patterns: [
        { from: 'src/assets', to: 'assets' },
      ]
    })
  ],
  devServer: {
    port: 4200
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/
      },
      {
        test: /\.css$/,
        use: [
          'style-loader',
          'css-loader'
        ]
      },
      {
        test: /\.m?js/,
        resolve: {
            fullySpecified: false
        }
      }
    ]
  },
  optimization: {
    splitChunks: {
      cacheGroups: {
        commons: {
          test: /[\\/]node_modules[\\/]/,
          name: "vendors",
          chunks: "all"
        }
      }
    }
  },
  resolve: {
    extensions: [".tsx", ".ts", ".js"],
    fallback: {
      'fs': false,
      'path': false,
    },
  },
  output: {
    filename: '[name].bundle.js',
    path: path.resolve(__dirname, distFolder)
  }
};