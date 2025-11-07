const path = require('path');
const nodeExternals = require('webpack-node-externals');
const TsconfigPathsPlugin = require('tsconfig-paths-webpack-plugin');

const isProduction = process.env.NODE_ENV === 'production';

module.exports = {
    entry: ['reflect-metadata', './src/server.ts'],
    target: 'node',
    mode: isProduction ? 'production' : 'development',
    devtool: 'source-map',

    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: 'server.js',
        clean: true,
        module: true,
        chunkFormat: 'module',
        library: {
            type: 'module'
        }
    },

    resolve: {
        extensions: ['.ts', '.js', '.mjs', '.json'],
        plugins: [
            new TsconfigPathsPlugin({
                configFile: './tsconfig.json',
                extensions: ['.ts', '.js', '.mjs', '.json']
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
                            const automapperTransformer = require('automapper-classes/transformer-plugin').default;
                            return {
                                before: [
                                    automapperTransformer(program, {
                                        modelFileNameSuffix: [
                                            ".entity.ts",
                                            ".db.ts",
                                            ".dto.ts"
                                        ]
                                    }).before
                                ]
                            };
                        }
                    }
                }
            }
        ]
    },

    externalsPresets: { node: true },

    externals: [nodeExternals({
        importType: 'module',
        allowlist: [
            'reflect-metadata',
            'inversify',
            /^@faker-js/,
            'class-transformer',
            'class-validator'
        ]
    })],

    experiments: {
        outputModule: true,
        topLevelAwait: true
    }
};