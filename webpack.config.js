const path = require("path");
const MonacoWebpackPlugin = require('monaco-editor-webpack-plugin');
const CopyWebpackPlugin = require("copy-webpack-plugin");
const HtmlWebpackPlugin = require('html-webpack-plugin');
const merge = require("webpack-merge");


/** @type{import("webpack").Configuration} */
const commonConfig = {
    output: {
        filename: "[name].bundle.js",
    },
    resolve: {
        extensions: [".ts", ".tsx", ".js"],
    },
    devtool: "inline-source-map",
    module: {
        rules: [{
                test: /\.scss$/,
                use: [
                    "style-loader", // creates style nodes from JS strings
                    "css-loader", // translates CSS into CommonJS
                    "sass-loader" // compiles Sass to CSS, using Node Sass by default
                ]
            },
            {
                test: /\.tsx?$/,
                loader: "ts-loader",
                exclude: /node_modules/,
                options: {
                    onlyCompileBundledFiles: true,
                }
            },
            {
                test: /\.css$/,
                loader: ["style-loader", "css-loader", ],
            },
        ],
    },
    plugins: [
        new CopyWebpackPlugin([{
                from: "node_modules/@here/harp-map-theme/resources",
                to: ".",
                toType: "dir"
            },
            require.resolve("three/build/three.min.js")
        ])
    ],
    devServer: {
        contentBase: path.join(__dirname, 'dist')
    },
};


const mapEditorConfig = merge(commonConfig, {
    entry: "./src/map-editor/index.tsx",
    plugins: [
        new HtmlWebpackPlugin({
            template: './src/map-editor/index.html'
        }),
    ]
});

const textEditorFrameConfig = merge(commonConfig, {
    entry: {
        textEditor: "./src/text-editor-frame/index.tsx",
    },
    plugins: [
        new MonacoWebpackPlugin(),
        new HtmlWebpackPlugin({
            template: './src/text-editor-frame/textEditor.html',
            filename: 'textEditor.html'
        }),
    ]
});

/** @type{import("webpack").Configuration} */
const decoderConfig = {
    target: "webworker",
    entry: {
        decoder: "./src/decoder.ts",
    },
    output: {
        filename: "[name].bundle.js",
    },
    devtool: "inline-source-map",
    resolve: {
        extensions: [".ts", ".js"],
    },
    module: {
        rules: [{
            test: /\.tsx?$/,
            loader: "ts-loader",
            exclude: /node_modules/,
            options: {
                onlyCompileBundledFiles: true,
            }
        }]
    },
};

module.exports = [mapEditorConfig, textEditorFrameConfig, decoderConfig];