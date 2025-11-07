import typescript from '@rollup/plugin-typescript';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import json from '@rollup/plugin-json';
import terser from '@rollup/plugin-terser';
import autoExternal from 'rollup-plugin-auto-external';
import alias from '@rollup/plugin-alias';
import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const isProduction = process.env.NODE_ENV === 'production';

export default {
    input: 'src/server.ts',
    output: {
        dir: 'dist',
        format: 'esm',
        sourcemap: !isProduction,
        preserveModules: true,
        preserveModulesRoot: 'src',
        entryFileNames: '[name].js',
        chunkFileNames: '[name]-[hash].js',
        hoistTransitiveImports: false,
        exports: 'named'
    },
    plugins: [
        autoExternal({
            builtins: true,
            dependencies: true,
            peerDependencies: true,
        }),
        alias({
            entries: [
                {
                    find: '@',
                    replacement: path.resolve(__dirname, 'src')
                }
            ],
            customResolver: nodeResolve({
                extensions: ['.ts', '.js', '.json'],
                preferBuiltins: true
            })
        }),
        nodeResolve({
            extensions: ['.ts', '.js', '.json'],
            preferBuiltins: true,
            moduleDirectories: ['node_modules', 'src']
        }),
        commonjs({
            include: /node_modules/,
            extensions: ['.js', '.ts'],
            ignoreDynamicRequires: true,
            requireReturnsDefault: 'auto',
            transformMixedEsModules: true
        }),
        json(),
        typescript({
            tsconfig: './tsconfig.json',
            sourceMap: !isProduction,
            declarationDir: 'dist/types',
        })
    ],
    external: [
        /node_modules/,
        'reflect-metadata',
        /@avulic\/.*/
    ]
}