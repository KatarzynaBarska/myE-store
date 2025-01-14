//npm run dev - for development
// npm run start - for production

import express from "express";

//dotenv - extension for env file
import dotenv from "dotenv";
import cookieParser from "cookie-parser";


//safe routes
import authRoutes from "./routes/auth.route.js";

import { connectDB } from "./lib/db.js"

//function to start connecting with env file
dotenv.config();

//function app start
const app = express();

// environment variables: read port 5000 if env file undefined
const PORT = process.env.PORT || 5000;

app.use(express.json()); //very important thing, allows to read json req.body
app.use(cookieParser()); 

//path to singup: /api/auth/signup
app.use("/api/auth", authRoutes)

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);

connectDB()

});
