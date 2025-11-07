// src/config/loggerConfig.ts

import winston from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';
import path from 'path';
import fs from 'fs';
import dotenv from 'dotenv';

dotenv.config();

// Ensure logs directory exists
const logsDir = path.join(process.cwd(), 'logs');
if (!fs.existsSync(logsDir)) {
    fs.mkdirSync(logsDir, { recursive: true });
}

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

// Console formatter with colors
const consoleFormatter = winston.format.combine(
    winston.format.colorize(),
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.splat(),
    winston.format.printf((info) => {
        const { timestamp, level, message, ...meta } = info;
        return `${timestamp} [${level}]: ${message} ${
            Object.keys(meta).length ? JSON.stringify(meta, null, 2) : ''
        }`;
    })
);

// File formatter for structured logging
const fileFormatter = winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.errors({ stack: true }),
    winston.format.splat(),
    winston.format.json(),
    winston.format.printf((info) => {
        const { timestamp, level, message, stack, code, status, ...meta } = info;
        
        // Create a structured log entry with type-safe conditional properties
        const logEntry: Record<string, any> = {
            timestamp,
            level,
            message: typeof message === 'string' ? message : JSON.stringify(message)
        };

        // Add optional properties only if they exist
        if (stack) logEntry.stack = stack;
        if (code) logEntry.code = code;
        if (status) logEntry.status = status;
        if (Object.keys(meta).length > 0) logEntry.meta = meta;

        // Special handling for error objects
        if (message instanceof Error) {
            logEntry.message = message.message;
            logEntry.stack = message.stack;
            logEntry.name = message.name;
        }

        return JSON.stringify(logEntry);
    })
);

const isDevEnvironment = (): boolean => {
    return process.env.NODE_ENV === 'development';
};

// Define file transports
const errorFileTransport = new DailyRotateFile({
    filename: path.join(logsDir, 'error-%DATE%.log'),
    datePattern: 'YYYY-MM-DD',
    level: 'error',
    maxSize: '20m',
    maxFiles: '14d',
    format: fileFormatter,
    zippedArchive: true
});

const combinedFileTransport = new DailyRotateFile({
    filename: path.join(logsDir, 'combined-%DATE%.log'),
    datePattern: 'YYYY-MM-DD',
    level: 'debug',
    maxSize: '20m',
    maxFiles: '14d',
    format: fileFormatter,
    zippedArchive: true
});

export const loggerConfig = {
    isDevEnvironment,
    customLevels,
    consoleFormatter,
    fileFormatter,
    logFile: path.join(logsDir, 'error.log'),
    fileTransports: {
        errorFileTransport,
        combinedFileTransport
    }
};