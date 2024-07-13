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

import AssignmentController from "./controllers/AssignmentController";
import AssignmentService from "./services/AssignmentService";
import AssignmentRoute from "./routes/AssignmentRoute";
import AuthController from "./controllers/AuthController";
import AuthRoute from "./routes/AuthRoutes";
import CourseController from "./controllers/CourseController";
import CourseRoute from "./routes/CourseRoute";
import CourseService from "./services/CourseService";
import ModuleController from "./controllers/ModuleController";
import ModuleRoute from "./routes/ModuleRoute";
import ModuleService from "./services/ModuleService";

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

    const assignmentService = new AssignmentService();
    const assignmentController = new AssignmentController(assignmentService);
    const assignmentRoute = new AssignmentRoute(assignmentController);
    app.use("/api", assignmentRoute.router);

    const courseService = new CourseService();
    const courseController = new CourseController(courseService);
    const courseRoute = new CourseRoute(courseController);
    app.use("/api", courseRoute.router);

    const moduleService = new ModuleService();
    const moduleController = new ModuleController(moduleService);
    const moduleRoute = new ModuleRoute(moduleController);
    app.use("/api", moduleRoute.router);

    const authController = new AuthController(userService);
    const authRoute = new AuthRoute(authController);
    app.use("/api", authRoute.router);
}
