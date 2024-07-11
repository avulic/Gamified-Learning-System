// src/utils/logger.ts

import winston from 'winston';
import { loggerConfig } from '../config/loggerConfig';

class Logger {
    private logger: winston.Logger;

    constructor() {
        const prodTransport = new winston.transports.File({
            filename: loggerConfig.logFile,
            level: 'error',
        });
        const transport = new winston.transports.Console({
            format: loggerConfig.formatter,
        });
        this.logger = winston.createLogger({
            level: loggerConfig.isDevEnvironment() ? 'trace' : 'error',
            levels: loggerConfig.customLevels.levels,
            transports: [loggerConfig.isDevEnvironment() ? transport : prodTransport],
        });
        winston.addColors(loggerConfig.customLevels.colors);
    }

    trace(msg: any, meta?: any) {
        this.logger.log('trace', msg, meta);
    }

    debug(msg: any, meta?: any) {
        this.logger.debug(msg, meta);
    }

    info(msg: any, meta?: any) {
        this.logger.info(msg, meta);
    }

    warn(msg: any, meta?: any) {
        this.logger.warn(msg, meta);
    }

    error(msg: any, meta?: any) {
        this.logger.error(msg, meta);
    }

    fatal(msg: any, meta?: any) {
        this.logger.log('fatal', msg, meta);
    }
}

export const logger = new Logger();
logger.info('Logger initialized');