import "reflect-metadata";
import { Application } from "express";
import cors from "cors";
import express from "express";
import "express-async-errors";

import swaggerUi from "swagger-ui-express";
import specs from "./swagger";

import  errorHandler  from './middlewares/errorHandler.middleware'
import { container } from './config/inversify.config';
import { TYPES } from '@/types';

import UserController from "./controllers/UserController";
import UserService from "./services/UserService";
import UserRoute from "./routes/UserRoutes";

import AssignmentController from "./controllers/AssignmentController";

import AssignmentRoute from "./routes/AssignmentRoutes";
import AuthController from "./controllers/AuthController";
import AuthRoute from "./routes/AuthRoutes";
import CourseController from "./controllers/CourseController";
import CourseRoute from "./routes/CourseRoute";

import ModuleController from "./controllers/ModuleController";
import ModuleRoute from "./routes/ModuleRoute";
import { ProgressController } from "./controllers/ProgressController";
import ProgressRoute from "./routes/ProgressRoutes";




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
    const userController = container.get<UserController>(TYPES.UserController);
    const userRoute = new UserRoute(userController);
    app.use("/api", userRoute.router);

    const assignmentController = container.get<AssignmentController>(TYPES.AssignmentController);
    const assignmentRoute = new AssignmentRoute(assignmentController);
    app.use("/api", assignmentRoute.router);

    const courseController = container.get<CourseController>(TYPES.CourseController);
    const courseRoute = new CourseRoute(courseController);
    app.use("/api", courseRoute.router);

    const moduleController = container.get<ModuleController>(TYPES.ModuleController);
    const moduleRoute = new ModuleRoute(moduleController);
    app.use("/api", moduleRoute.router);

    const progressController = container.get<ProgressController>(TYPES.ProgressController);
    const progressRoute = new ProgressRoute(progressController);
    app.use("/api/progress", progressRoute.router);


    const authController = container.get<AuthController>(TYPES.AuthController);
    const authRoute = new AuthRoute(authController);
    app.use("/api", authRoute.router);
}
