import mongoose, { ConnectOptions } from "mongoose";
import { mongoConfig } from '../config/dbConfig';
import Role from "@/models/db/mongo/Role";
import {seed} from "@/scripts/seed_v2"

const mongooseDb = async () => {
    mongoose.set('strictQuery', false);

    await mongoose.connect(mongoConfig.url!, <ConnectOptions>{
        useNewUrlParser: true,
        useUnifiedTopology: true,
        serverSelectionTimeoutMS: 50000,
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
            seed()
        }
    } catch (err) {
        console.log("Error initializing roles collection:", err);
    }
}



export default mongooseDb;