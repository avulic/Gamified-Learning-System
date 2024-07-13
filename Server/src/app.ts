import { Application } from "express";
import cors from "cors";
import express from "express";
import "express-async-errors";

import swaggerUi from "swagger-ui-express";
import specs from "./swagger";

import  errorHandler  from './middlewares/errorHandler.middleware'

import UserController from "./controllers/UserController";
import UserService from "./services/UserService";
import UserRoute from "./routes/UserRoutes";

import TaskController from "./controllers/AssignmentController";
import TaskService from "./services/AssignmentService";
import TaskRoute from "./routes/AssignmentRoute";
import AuthController from "./controllers/AuthController";
import AuthRoute from "./routes/AuthRoutes";

export function createApp(): Application {
    console.log("Initializing App...");
    const app = express();
    setConfig(app);
    setRoutes(app);
    console.log("App initialization complete");
    return app;
}

function setConfig(app: Application) {
    app.use(express.json({ limit: "50mb" }));
    app.use(express.urlencoded({ limit: "50mb", extended: true }));
    app.use(cors());
    app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));
    app.use(errorHandler);
}

function setRoutes(app: Application) {
    const userService = new UserService();
    const userController = new UserController(userService);
    const userRoute = new UserRoute(userController);
    app.use("/api", userRoute.router);

    const taskService = new TaskService();
    const taskController = new TaskController(taskService);
    const taskRoute = new TaskRoute(taskController);
    app.use("/api", taskRoute.router);


    const authController = new AuthController(userService);
    const authRoute = new AuthRoute(authController);
    app.use("/api", authRoute.router);
}
