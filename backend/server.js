//npm run dev - for development
// npm run start - for production

import express from "express";

//dotenv - extension for env file
import dotenv from "dotenv";


//safe routes
import authRoutes from "./routes/auth.route.js";

//function to start connecting with env file
dotenv.config();

//function app start
const app = express();

// environment variables: read port 5000 if env file undefined
const PORT = process.env.PORT || 5000;

//path to singup: /api/auth/signup
app.use("/api/auth", authRoutes)

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});