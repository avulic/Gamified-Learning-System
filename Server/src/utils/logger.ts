// src/utils/logger.ts

import winston from 'winston';
import { loggerConfig } from '../config/loggerConfig';
import { injectable } from 'inversify';

@injectable()
class Logger {
    private static instance: Logger | null = null;
    private logger: winston.Logger;

    constructor() {
        if (!Logger.instance) {
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

            this.logger.info('Logger initialized');
            Logger.instance = this;
        } else {
            this.logger = Logger.instance.logger;
        }
    }

    public static getInstance(): Logger {
        if (!Logger.instance) {
            Logger.instance = new Logger();
        }
        return Logger.instance;
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

export default Logger;