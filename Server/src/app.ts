import { Application } from "express";
import { PokemonController } from "./Controllers/PokemonController";
import { PokemonService } from "./Services/PokemonService";
import bodyParser from "body-parser";
import cors from "cors";
import express from "express";

class App {
  public app: express.Application;

  constructor() {
    this.app = express();
    this.setConfig();
    //this.setMongoConfig();
    this.setControllers();
    //this.setErrorHandlingMiddleware();
  }

  private setConfig() {
    this.app.use(bodyParser.json({ limit: "50mb" }));
    this.app.use(bodyParser.urlencoded({ limit: "50mb", extended: true }));
    this.app.use(cors());
  }

  private setControllers() {
    const pokemonController = new PokemonController(new PokemonService());
    this.app.use("/pokemon", pokemonController.router);
  }

  
}

export default new App().app;