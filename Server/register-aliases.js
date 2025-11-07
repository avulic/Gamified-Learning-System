// register-aliases.js
const moduleAlias = require('module-alias');
const path = require('path');

const isDev = process.env.NODE_ENV !== 'production';
const baseDir = isDev ? path.resolve(__dirname, 'src') : path.resolve(__dirname, 'dist');

moduleAlias.addAlias('@', baseDir);
