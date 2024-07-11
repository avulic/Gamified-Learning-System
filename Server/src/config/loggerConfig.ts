// src/config/loggerConfig.ts

import winston from 'winston';
import dotenv from 'dotenv';

dotenv.config();

const isDevEnvironment = (): boolean => {
    return process.env.NODE_ENV === 'development';
};

const customLevels = {
    levels: {
        trace: 5,
        debug: 4,
        info: 3,
        warn: 2,
        error: 1,
        fatal: 0,
    },
    colors: {
        trace: 'white',
        debug: 'green',
        info: 'green',
        warn: 'yellow',
        error: 'red',
        fatal: 'red',
    },
};

const formatter = winston.format.combine(
    winston.format.colorize(),
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.splat(),
    winston.format.printf((info) => {
        const { timestamp, level, message, ...meta } = info;
        return `${timestamp} [${level}]: ${message} ${
            Object.keys(meta).length ? JSON.stringify(meta, null, 2) : ''
        }`;
    }),
);

export const loggerConfig = {
    isDevEnvironment,
    customLevels,
    formatter,
    logFile: 'logs/error.log',
};