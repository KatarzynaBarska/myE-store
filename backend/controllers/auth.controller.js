//obsługa ścieżek
import { redis } from "../lib/redis.js";
import User from "../models/user.model.js";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";


dotenv.config();


// funkcja do wygenerowania, utorzenia tokenów
const generateTokens = (userId) => {
    //payload
    const accessToken = jwt.sign({userId}, process.env.ACCESS_TOKEN_SECRET, {expiresIn: "15m"});
    const refreshToken = jwt.sign({userId}, process.env.REFRESH_TOKEN_SECRET, {expiresIn: "7d"});
    
    return {accessToken, refreshToken};
};

//funkcja do zapisania utworzonych tokenów w bazie danych Redis
const storeRefreshToken = async (userId, refreshToken) => {
    await redis.set(`refreshToken:${userId}`, refreshToken, "EX", 7 * 24 * 60 * 60); // 7 dni
}

//funkcja do zapisania Cookies - deklaracja

const setCookies = (res, accessToken, refreshToken) => {
    res.cookie("accessToken", accessToken, {
        httpOnly: true, // prevent  XSS attacks
        secure:process.env.NODE_ENV !== "development", // only works in production
        sameSite: "strict", // prevent SCRF attack, cross-site request forgery
        maxAge: 15 * 60 * 1000, // 15 minutes
    })
    res.cookie("refreshToken", refreshToken, {
        httpOnly: true, // prevent  XSS attacks
        secure:process.env.NODE_ENV !== "development", // only works in production
        sameSite: "strict", // prevent SCRF attack, cross-site request forgery
        maxAge: 7 *15 * 60 * 1000, // 7 days
    })
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

//ATRHENTICATION TOKENS

const { accessToken, refreshToken } = generateTokens(user._id);
// _id to identyfikator usera w bazie danych mongodb
// Destrukturyzacja obiektu i wyciągnięcie z niego accessToken i refreshToken
await storeRefreshToken(user._id, refreshToken);

//funkcja do zapisywanie Cookies
setCookies(res, accessToken, refreshToken);

    res.status(201).json({
        user: {
            _id:user._id,
            name:user.name,
            email:user.email,
            role:user.role
        }, message:"User created successfully"});
    } catch (error) {
        res.status(500).json({message:error.message});
    }
};

export const login = async (req,res) => {
    res.send("Login");
};

export const logout = async (req,res) => {
    try {
        const refreshToken = req.cookies.refreshToken;
        if (refreshToken) {
            const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
            await redis.del(`refreshToken:${decoded.userId}`);
        }

        res.clearCookie("accessToken");
        res.clearCookie("refreshToken");
        res.status(200).json({message:"Logout successful"});
    } catch (error) {
        res.status(500).json({message: "Server error", error:error.message});
    }
};