//obsługa ścieżek

import User from "../models/user.model.js";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();


// funkcja do wygenerowania tokenów
const generateTokens = (userId) => {
    const accessToken = jwt.sign({userId}, process.env.ACCESS_TOKEN_SECRET, {expiresIn: "15m"});
    const refreshToken = jwt.sign({userId}, process.env.REFRESH_TOKEN_SECRET, {expiresIn: "7d"});
    
    return {accessToken, refreshToken};
}

//sprawdzanie czy user istnieje, jeżeli istnieje wyświetl komunikat, jeżeli nie istniej stwórz nowego usera i wyświetl komunikat
//signup = zarejestruj się
export const signup = async (req,res) => {
    const {email,password,name} = req.body;
    try {
        const userExists = await User.findOne({email});

    if (userExists) {
        return res.status(400).json({message:"User already exists"});
    }
    const user = await User.create({email,password,name});

//authenticate
const { accessToken, refreshToken } = generateTokens(user._id);
// _id to identyfikator usera w bazie danych mongodb


    res.status(201).json({message:"User created successfully"});
    } catch (error) {
        res.status(500).json({message:error.message});
    }
};

export const login = async (req,res) => {
    res.send("Login");
};

export const logout = async (req,res) => {
    res.send("Logout");
};