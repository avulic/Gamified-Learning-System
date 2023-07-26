import mongoose, { ConnectOptions } from "mongoose";
import { mongoConfig } from '../config/dbConfig';



const mongooseDb = () => {
    mongoose.set('strictQuery',false);
    
    mongoose.connect(mongoConfig.url!, <ConnectOptions>{
        useNewUrlParser: true,
        useUnifiedTopology: true,
    })   
    .then(() => 
        console.log("DB connection succesfull..")
    ) 
    .catch(error => {
        console.log("DB connection failed");
        console.log(error);
        process.exit(1)
    })

}


export default mongooseDb;