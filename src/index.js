// require('dotenv').config({path:'./env})
import dotenv from 'dotenv';
import connectDB from './db/index.js';
import { app } from './app.js';
dotenv.config({
    path:'./.env'
})


connectDB()
.then(
    ()=>{
    app.listen(process.env.PORT || 8000 ,()=>{
        console.log(`Server is running on port ${process.env.PORT}`)
    })
})
.catch((err)=>{
    console.log("MongoDB connection failed !!!", err);
})












// import mongoose from 'mongoose';
// import express from 'express';
// import { DB_NAME} from '../constansts.js'
// const app = express();

// ;(async ()=>{
//    try{ 
//     await mongoose.connnect(`${process.env.MONGODB_URI}/${DB_NAME}`)
//     app.on("error",(error)=>{
//         console.error("Error connecting to MongoDB:", error);
//         throw error;
//     })

//     app.listen(process.env.PORT || 3000,()=>{
//         console.log(`App is listening on port ${process.env.PORT}`);
//     })
//     }catch (error){
//         console.error("Failed to connect to MongoDB:", error);
//     }
// }

// )()