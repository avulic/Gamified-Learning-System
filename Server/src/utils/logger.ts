// src/utils/logger.ts
import winston from 'winston';
import { loggerConfig } from '../config/loggerConfig';

class Logger {
    private logger: winston.Logger;

    private constructor() {
        const transports: winston.transport[] = [
            loggerConfig.fileTransports.errorFileTransport,
            loggerConfig.fileTransports.combinedFileTransport,
        ];

        if (loggerConfig.isDevEnvironment()) {
            transports.push(
                new winston.transports.Console({
                    format: loggerConfig.consoleFormatter,
                })
            );
        }

        this.logger = winston.createLogger({
            level: loggerConfig.isDevEnvironment() ? 'trace' : 'error',
            levels: loggerConfig.customLevels.levels,
            transports,
            exitOnError: false,
        });

        winston.addColors(loggerConfig.customLevels.colors);
        this.logger.info('Logger initialized');
    }

    private static instance: Logger | null = null;

    public static getInstance(): Logger {
        if (!Logger.instance) {
            Logger.instance = new Logger();
        }
        return Logger.instance;
    }

    // Methods
    info(msg: any, meta?: any) { this.logger.info(msg, meta); }
    error(msg: any, meta?: any) { this.logger.error(msg, meta); }
    warn(msg: any, meta?: any) { this.logger.warn(msg, meta); }
    debug(msg: any, meta?: any) { this.logger.debug(msg, meta); }
    trace(msg: any, meta?: any) { this.logger.log('trace', msg, meta); }
    fatal(msg: any, meta?: any) { this.logger.log('fatal', msg, meta); }
}

// Export the **instance**
const loggerInstance = Logger.getInstance();
export default loggerInstance;