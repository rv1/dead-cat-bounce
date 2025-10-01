const path = require('path')
const webpack = require('webpack')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const { CleanWebpackPlugin } = require('clean-webpack-plugin')

const PATHS = {
    source: path.join(__dirname, 'source'),
    build: path.join(__dirname, 'static')
}

const ExtractApplicationCSS = new MiniCssExtractPlugin({
    filename: path.join('css', 'application.css')
})

module.exports = {
    entry: {
        source: path.join(PATHS.source, 'js', 'application.js')
    },
    output: {
        path: PATHS.build,
        filename: 'js/[contenthash].js',
        assetModuleFilename: 'assets/[hash][ext][query]'
    },
    module: {
        rules: [
            {
                test: /index\.html$/,
                use: [{
                    loader: 'html-loader',
                    options: {
                        sources: false
                    }
                }]
            },
            {
                test: /\.js$/,
                exclude: /node_modules/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        presets: [
                            [
                                '@babel/preset-env',
                                {
                                    targets: 'defaults'
                                }
                            ]
                        ]
                    }
                }
            },
            {
                test: /\.css$/,
                use: [MiniCssExtractPlugin.loader, 'css-loader']
            },
            {
                test: /\.scss$/,
                use: [MiniCssExtractPlugin.loader, 'css-loader', 'sass-loader']
            },
            {
                test: /\.(png|jpe?g|gif|svg)$/i,
                type: 'asset/resource',
                generator: {
                    filename: 'img/[name][contenthash][ext]'
                }
            },
            {
                test: /\.(mp3|aiff|wav|ogg)$/i,
                type: 'asset/resource',
                generator: {
                    filename: 'audio/[name][contenthash][ext]'
                }
            },
            {
                test: /\.(woff|woff2|eot|ttf|otf)$/i,
                type: 'asset/resource',
                generator: {
                    filename: 'fonts/[name][contenthash][ext]'
                }
            }
        ]
    },
    optimization: {
        runtimeChunk: false,
        splitChunks: {
            cacheGroups: {
                default: false,
                commons: {
                    test: /[\\/]node_modules[\\/]/,
                    name: 'vendor_app',
                    chunks: 'all',
                    minChunks: 2
                }
            }
        }
    },
    devServer: {
        static: path.resolve(__dirname, '.'),
        hot: true
    },
    resolve: {
        extensions: ['.js', '.scss'],
        modules: [path.resolve(__dirname, 'source'), 'node_modules'],
        alias: {
            '@': path.resolve(__dirname, 'source')
        }
    },
    plugins: [
        new CleanWebpackPlugin(),
        new webpack.ProvidePlugin({
            $: 'jquery',
            jQuery: 'jquery'
        }),
        new HtmlWebpackPlugin({
            filename: 'index.html',
            template: 'index.html'
        }),
        ExtractApplicationCSS
    ]
}