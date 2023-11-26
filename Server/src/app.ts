import { Application } from "express";
import cors from "cors";
import express from "express";
import "express-async-errors";

import swaggerUi from "swagger-ui-express";
import specs from "./swagger";

import { errorHandler } from './middlewares/errors'
import { authJwt } from "./middlewares/authJwt";
import { authorizeRole } from "./middlewares/authJwt";

import  UserController  from "./controllers/UserController";
import  UserService  from "./services/UserService";
import  UserRoute from "./routes/UserRoutes";

import  TaskController  from "./controllers/TaskController";
import  TaskService  from "./services/TaskService";
import  TaskRoute from "./routes/TaskRoutes";

import mongooseDb from "./adapters/mongooseDb";

class App {
  public app: Application;

  constructor() {
    this.app = express();
    this.setConfig();
    this.setMongoConfig();
    this.setRoutes();
  }

  private setConfig() {
    this.app.use(express.json({ limit: "50mb" }));
    this.app.use(express.urlencoded({ limit: "50mb", extended: true }));
    this.app.use(cors());
    
    // swager dokumentacija nema zaštitu
    this.app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));

    this.app.use(authJwt);
    //this.app.use(authorizeRole);
    this.app.use(errorHandler);
  }

  private setMongoConfig(){
    mongooseDb();
  }

  //TO-DO: dependency injection
  private setRoutes() {
    const userService = new UserService();
    const userController = new UserController(userService);
    const userRoute = new UserRoute(userController);

    this.app.use("/api", userRoute.router);

    const taskService = new TaskService();
    const taskController = new TaskController(taskService);
    const taskRoute = new TaskRoute(taskController);

    this.app.use("/api", taskRoute.router);
  }
}

export default new App().app;