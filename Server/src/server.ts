// server.ts
import { Application } from "express";
import http from "http";
import { logger } from './utils/logger';
import ErrorHandler from "./utils/errorHandler";
import mongooseDb from "./adapters/mongooseDb";
import { createApp } from './app';

console.log("Server.ts is being executed");

let server: http.Server;

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
    console.log("Initializing server...");
    server = http.createServer(app);
    const port = process.env.PORT || 3000;
    server.listen(port, () => {
        console.log(`Server running on port ${port}`);
        logger.info(`Server running on port ${port}`);
    });
}

async function startServer() {
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


console.log("Server.ts has been fully loaded");
startServer();