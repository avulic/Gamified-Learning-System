import { Application } from "express";
import cors from "cors";
import express from "express";

import  UserController  from "./controllers/UserController";
import  UserService  from "./services/UserService";
import  UserRoute from "./routes/UserRoutes";

import mongooseDb from "./adapters/mongooseDb";

class App {
  public app: Application;

  constructor() {
    this.app = express();
    this.setConfig();
    this.setMongoConfig();
    this.setRoutes();
    //this.setErrorHandlingMiddleware();
  }

  private setConfig() {
    this.app.use(express.json({ limit: "50mb" }));
    this.app.use(express.urlencoded({ limit: "50mb", extended: true }));
    this.app.use(cors());
  }

  private setMongoConfig(){
    mongooseDb();
  }

  private setRoutes() {
    const userService = new UserService();
    const userController = new UserController(userService);
    const userRoute = new UserRoute(userController);

    this.app.use("/api", userRoute.router);
  }
}

export default new App().app;