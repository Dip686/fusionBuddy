var webpack = require("webpack"),
  path = require("path"),
  CopyWebpackPlugin = require('copy-webpack-plugin');

var options = {
  mode: "production",
  entry: {
    devtools: `${__dirname}/develop/src/internal/devtools.js`,
    panel: `${__dirname}/develop/src/internal/panel.js`,
    pageScript: `${__dirname}/develop/src/pageScript.js`
  },
  devtool: 'source-map',
  output: {
    path: path.join(__dirname, "build", "chrome-ext"),
    filename: "[name].js"
  },
  module: {
    rules: [
      {
        test: /.jsx?$/,
        include: [
          path.resolve(__dirname, "develop")
        ],
        exclude: [
          path.resolve(__dirname, "node_modules")
        ],
        // issuer: { test, include, exclude },
        // conditions for the issuer (the origin of the import)
        enforce: "pre",
        enforce: "post",
        loader: "babel-loader",
        options: {
        },
      }
    ]
  },
  resolve: {
    // alias: alias
  },
  plugins: [
    new CopyWebpackPlugin([
      { from: path.join(__dirname, "develop", "src", "viz"), to: path.join(__dirname, "build", "chrome-ext", "viz") },
      { from: path.join(__dirname, "develop", "src", "vendors"), to: path.join(__dirname, "build", "chrome-ext", "vendors") },
      { from: path.join(__dirname, "develop", "src", "manifest.json"), to: path.join(__dirname, "build", "chrome-ext") },
      { from: path.join(__dirname, "develop", "src", "background.js"), to: path.join(__dirname, "build", "chrome-ext") },
      { from: path.join(__dirname, "develop", "src", "contentScript.js"), to: path.join(__dirname, "build", "chrome-ext") },
    ])
  ]
};

module.exports = options;
