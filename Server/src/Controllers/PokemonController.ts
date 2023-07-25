import { Request, Response, Router } from 'express';
import { PokemonService } from "../Services/PokemonService";

export class PokemonController {
    public router = Router();

    constructor(private pokemonService: PokemonService) {
        this.setRoutes();
    }

    public setRoutes() {
        this.router.route("/").get(this.hello);

        this.router.route("/all").get(this.all);

        //this.router.route("/").post(this.add);

        //this.router.route("/:id").delete(this.delete).put(this.update);
    }
    private hello = (_: Request, res: Response) => {
        const welcomeMessage = this.pokemonService.getWelcomeMessage();
        res.send(welcomeMessage);
    };

    private findAll = async (_: Request, res: Response) => {
        //const pokemon = await this.pokemonService.find();
        //res.send(pokemon);
    };

    private all = async (req: Request, res: Response) => {
        //const addPokemonResult = await this.pokemonService.add(req.body);
        res.json([
            {
                id: "1",
                title: "JavaScript",
                description: "Javascript is used by programmers across the world to create dynamic and interactive web content like applications and browsers.",
                published: "JavaScript was invented by Brendan Eich in 1995",
            }])
    };
}
