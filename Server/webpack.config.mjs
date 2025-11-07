const path = require('path');
const nodeExternals = require('webpack-node-externals');
const TsconfigPathsPlugin = require('tsconfig-paths-webpack-plugin');

const automapperTransformer = require('automapper-classes/transformer-plugin').default;

const pluginOptions = {
    modelFileNameSuffix: [
        ".entity.ts",
        ".db.ts",
        ".dto.ts"
    ]
};

const isProduction = process.env.NODE_ENV === 'production';

module.exports = {
    entry: './src/server.ts',
    target: 'node',
    mode: isProduction ? 'production' : 'development',
    devtool: 'source-map',

    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: 'server.js',
        clean: true
    },

    resolve: {
        extensions: ['.ts', '.js'],
        plugins: [
            new TsconfigPathsPlugin({
                configFile: './tsconfig.json'
            })
        ],
        alias: {
            '@': path.resolve(__dirname, 'src')
        }
    },

    module: {
        rules: [
            {
                test: /\.tsx?$/,
                exclude: /node_modules/,
                use: {
                    loader: 'ts-loader',
                    options: {
                        transpileOnly: !isProduction,
                        configFile: path.resolve(__dirname, 'tsconfig.json'),
                        getCustomTransformers: (program) => {
                            const transformer = automapperTransformer(program, pluginOptions);
                            return {
                                before: [transformer.before]
                            };
                        }
                    }
                }
            }
        ]
    },

    externals: [nodeExternals()],

    experiments: {
        topLevelAwait: true
    },

    optimization: {
        minimize: isProduction
    }
};