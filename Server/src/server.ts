import "reflect-metadata";
require('module-alias/register');
require('../register-aliases');

import { Application } from "express";
import http from "http";
import logger from '@/utils/logger';
import ErrorHandler from "./utils/errorHandler";
import mongooseDb from "./adapters/mongooseDb";
import { createApp } from './app';
import { redisAdapter } from './adapters/redist';

import { apiConfig } from '@/config/apiConfig';

console.log("Server.ts is being executed");

let server: http.Server | null = null;
let isShuttingDown = false;

async function setMongoConfig() {
    try {
        await mongooseDb();
        logger.info('MongoDB connected successfully');
    } catch (error) {
        logger.error('MongoDB connection error:', error);
        throw error;
    }
}

function initializeServer(app: Application): void {
    if (server) return;

    console.log("Initializing server...");
    server = http.createServer(app);
    const port = apiConfig.PORT;

    server.listen(port, () => {
        console.log(`Server running on port ${port}`);
        logger.info(`Server running on port ${port}`);
    });
}

export default async function startServer() {
    if (server) {
        logger.warn('Server is already running.');
        return;
    }

    try {
        await setMongoConfig();

        const app = createApp();
        initializeServer(app);
        setupErrorHandlers();
    } catch (error) {
        logger.error('Failed to start server:', error);
        process.exit(1);
    }
}


const exitHandler = (options: { cleanup?: boolean; exit?: boolean } = {}): void => {
    if (options.cleanup) {
        logger.info('Cleaning up...');
        // Perform any cleanup operations here (e.g., closing database connections)
    }
    if (options.exit) {
        process.exit();
    }
};

const unexpectedErrorHandler = (error: Error): void => {
    logger.error('An unexpected error occurred:', error);
    ErrorHandler.handleError(error);
    if (!ErrorHandler.isTrustedError(error)) {
        process.exit(1);
    }
};

const setupErrorHandlers = (): void => {
    process.on('uncaughtException', unexpectedErrorHandler);
    process.on('unhandledRejection', (reason: Error) => {
        throw reason;
    });

    process.on('SIGTERM', () => {
        if (isShuttingDown) return;
        isShuttingDown = true;


        logger.info('SIGTERM received');
        if (server) {
            server.close(() => {
                logger.info('Server closed');
                exitHandler({ cleanup: true, exit: true });
            });
        } else {
            exitHandler({ cleanup: true, exit: true });
        }
    });

    process.on('SIGINT', () => {
        if (isShuttingDown) return;
        isShuttingDown = true;

        logger.info('SIGINT received');
        if (server) {
            server.close(() => {
                logger.info('Server closed');
                exitHandler({ cleanup: true, exit: true });
            });
        } else {
            exitHandler({ cleanup: true, exit: true });
        }
    });
};

// Only start server if this file is run directly (not imported)
if (require.main === module) {
    startServer().catch(err => {
        logger.error('Failed to start server:', err);
        process.exit(1);
    });
}