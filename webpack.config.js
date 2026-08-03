const path = require('path');
const HtmlWebpackPlugin = require("html-webpack-plugin");
const htmlWebpackPlugin = new HtmlWebpackPlugin({
    template: path.join(__dirname, "examples/src/index.html"),
    filename: "./index.html"
});
module.exports = {
    entry: path.join(__dirname, "examples/src/index.jsx"),
    // Never the default "dist/" — that folder is the published package.
    output: {
        path: path.join(__dirname, ".dev-build"),
        clean: true
    },
    module: {
        rules: [
            {
                test: /\.(js|jsx)$/,
                use: "babel-loader",
                exclude: /node_modules/
            },
            {
                test: /\.css$/,
                use: ["style-loader", "css-loader"]
            },
            {
                test: /\.(png|jpe?g|gif|svg|ico)$/,
                type: "asset/resource"
            }
        ]
    },
    plugins: [htmlWebpackPlugin],
    resolve: {
        extensions: [".js", ".jsx"],
        // Run the example against this repo's own source instead of a published copy.
        alias: {
            "navigation-controller": path.join(__dirname, "src/index.js")
        }
    },
    devServer: {
        port: 3001
    }
};
