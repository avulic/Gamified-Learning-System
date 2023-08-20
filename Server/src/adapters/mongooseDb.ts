import mongoose, { ConnectOptions } from "mongoose";
import { mongoConfig } from '../config/dbConfig';
import Role from "../models/Role";

const mongooseDb = () => {
    mongoose.set('strictQuery', false);

    mongoose.connect(mongoConfig.url!, <ConnectOptions>{
        useNewUrlParser: true,
        useUnifiedTopology: true,
    })
    .then(() =>{
        console.log("DB connection succesfull..");
        initial();
    })
    .catch(error => {
        console.log("DB connection failed");
        console.log(error);
        process.exit(1)
    })

}

async function initial() {
    try {
        const count = await Role.estimatedDocumentCount();
        if (count === 0) {
            await Role.create({ name: "user" });
            await Role.create({ name: "moderator" });
            await Role.create({ name: "admin" });
            console.log("Roles collection initialized.");
        }
    } catch (err) {
        console.log("Error initializing roles collection:", err);
    }
}



export default mongooseDb;