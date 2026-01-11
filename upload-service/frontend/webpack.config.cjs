const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const { container } = require('webpack');
const ModuleFederationPlugin = container.ModuleFederationPlugin;
const deps = require('./package.json').dependencies;

const isProduction = process.env.NODE_ENV === 'production';

module.exports = () => ({
    entry: './src/main.tsx',
    mode: isProduction ? 'production' : 'development',
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: isProduction ? 'js/[name].[contenthash:8].js' : 'js/[name].js',
        publicPath: 'auto',
        clean: true,
    },
    resolve: {
        extensions: ['.ts', '.tsx', '.js', '.jsx', '.json'],
        alias: {
            '@': path.resolve(__dirname, 'src'),
        },
    },
    devtool: isProduction ? 'source-map' : 'cheap-module-source-map',
    cache: {
        type: 'filesystem',
        buildDependencies: {
            config: [__filename],
        },
    },
    module: {
        rules: [
            {
                test: /\.(ts|tsx)$/,
                exclude: /node_modules/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        cacheDirectory: true,
                        cacheCompression: false,
                        presets: [
                            '@babel/preset-env',
                            ['@babel/preset-react', { runtime: 'automatic' }],
                            '@babel/preset-typescript',
                        ],
                    },
                },
            },
            {
                test: /\.(js|jsx)$/,
                exclude: /node_modules/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        cacheDirectory: true,
                        cacheCompression: false,
                    },
                },
            },
            {
                test: /\.css$/i,
                use: [
                    'style-loader',
                    'css-loader',
                    {
                        loader: 'postcss-loader',
                        options: {
                            postcssOptions: {
                                plugins: [
                                    '@tailwindcss/postcss',
                                ],
                            },
                        },
                    },
                ],
            },
            {
                test: /\.svg$/i,
                type: 'asset/resource',
                generator: {
                    filename: 'static/media/[name].[contenthash:8][ext]'
                }
            },
            {
                test: /\.(png|jpe?g|gif|ico)$/i,
                type: 'asset/resource',
                generator: {
                    filename: 'static/media/[name].[contenthash:8][ext]'
                }
            },
        ],
    },
    plugins: [
        new HtmlWebpackPlugin({
            template: './public/index.html',
            favicon: './public/vite.svg',
            inject: true,
            minify: isProduction
                ? {
                    removeComments: true,
                    collapseWhitespace: true,
                    removeRedundantAttributes: true,
                    useShortDoctype: true,
                    removeEmptyAttributes: true,
                    removeStyleLinkTypeAttributes: true,
                }
                : false,
        }),
        new ModuleFederationPlugin({
            name: 'upload_service_frontend',
            filename: 'remoteEntry.js',
            exposes: {
                // TODO: Configure your exposed modules here. Don't use the main.tsx file, we need the top "export default" component.
                './App': './src/App.tsx',
            },
            shared: {
                react: {
                    singleton: true,
                    requiredVersion: deps.react,
                    eager: false,
                },
                'react-dom': {
                    singleton: true,
                    requiredVersion: deps['react-dom'],
                    eager: false,
                },
                'react-router-dom': {
                    singleton: true,
                    requiredVersion: deps['react-router-dom'],
                    eager: false,
                },
            },
        }),
    ],
    devServer: {
        static: {
            directory: path.join(__dirname, 'public'),
            watch: true,
        },
        historyApiFallback: true,
        compress: true,
        //Adjust the port number as needed
        port: 8111,
        open: true,
        hot: true,
        client: {
            overlay: true,
        },
    },
    performance: {
        hints: isProduction ? 'warning' : false,
    },
});