import mongoose from "mongoose";
import { DB_NAME } from "../../constansts.js";

const connectDB = async () => {
    try{
       const  connectionInstance = await mongoose.connect(`${process.env.MONGODB_URI}`)
         console.log(`\n MongoDB connected !! DB host : ${connectionInstance} `)
    } catch(error){
        console.error("MongoDB connection error",error);   
        process.exit(1);// exit due to error
    }
}

export default connectDB;