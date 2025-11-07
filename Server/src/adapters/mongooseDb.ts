import mongoose, { ConnectOptions } from "mongoose";
import { mongoConfig } from '../config/dbConfig';
import Role from "@/models/db/mongo/Role.db";
import { seed } from "@/scripts/seed_v2"

const mongooseDb = async () => {
    mongoose.set('strictQuery', false);

    try {
        await mongoose.connect(mongoConfig.url!, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            serverSelectionTimeoutMS: 500000,
            replicaSet: 'rs0',
            retryWrites: true,
            w: 'majority',
            readPreference: 'primary',
            maxPoolSize: 10,
            minPoolSize: 5
        } as ConnectOptions);

        // Verify replica set status
        const admin = mongoose.connection.db.admin();
        const status = await admin.replSetGetStatus();
        console.log("Replica set status:", status.ok === 1 ? "OK" : "Not OK");

        console.log("DB connection successful..");
        await initial();
    } catch (error) {
        console.error("DB connection failed:", error);
        process.exit(1);
    }
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