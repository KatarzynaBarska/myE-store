//obsługa ścieżek
import { redis } from "../lib/redis.js";
import User from "../models/user.model.js";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";


dotenv.config();

//IMPLEMENTACJA FUNKCJI: GENEROWANIA TOKENÓW,ZAPISYWANIA REFRESH TOKEN W REDIS,
//ZAPISYWANIA CIASTECZEK 
// funkcja do wygenerowania, tworzenia tokenów
const generateTokens = (userId) => {
    //payload
    const accessToken = jwt.sign({userId}, process.env.ACCESS_TOKEN_SECRET, {expiresIn: "15m"});
    const refreshToken = jwt.sign({userId}, process.env.REFRESH_TOKEN_SECRET, {expiresIn: "7d"});
    
    return {accessToken, refreshToken};
};

//funkcja do zapisania utworzonych refreshtokenów w bazie danych Redis
const storeRefreshToken = async (userId, refreshToken) => {
    await redis.set(`refreshToken:${userId}`, refreshToken, "EX", 7 * 24 * 60 * 60); // 7 dni
}

//funkcja do zapisania Cookies

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

//OBSŁUGA ŚCIEŻEK
//sprawdzanie czy user istnieje, jeżeli istnieje wyświetl komunikat, jeżeli nie istniej stwórz nowego usera i wyświetl komunikat

//SIGNUP
export const signup = async (req,res) => {
    // destrukturyzacja objektu
    const {email,password,name} = req.body;
    try {
        //sprawdzenie czy user istnieje
        const userExists = await User.findOne({email});

    if (userExists) {
        return res.status(400).json({message:"User already exists"});
    }
    //jeśli user nie istnieje, stworz nowego
    const user = await User.create({email,password,name});

//ATRHENTICATION TOKENS

const { accessToken, refreshToken } = generateTokens(user._id);
// _id to identyfikator usera w bazie danych mongodb
// Destrukturyzacja obiektu i wyciągnięcie z niego accessToken i refreshToken
await storeRefreshToken(user._id, refreshToken);

//funkcja do zapisywanie Cookies
setCookies(res, accessToken, refreshToken);

    res.status(201).json({
        
            _id:user._id,
            name:user.name,
            email:user.email,
            role:user.role
        });
    } catch (error) {
        console.log("Error in signup controller", error.message);
        res.status(500).json({message:error.message});
    }
};


//LOGIN
export const login = async (req,res) => {
    try {
        const {email,password} = req.body;
        const user = await User.findOne({email});

        if(user && (await user.comparePassword(password))) {
            const {accessToken, refreshToken} = generateTokens(user._id);
            await storeRefreshToken(user._id, refreshToken);
            setCookies(res, accessToken, refreshToken);

            res.json({
                
                    _id:user._id,
                    name:user.name,
                    email:user.email,
                    role:user.role});
        }
    } catch (error) {
        console.log("Error in login controller", error.message);
        
        res.status(500).json({message:error.message});
        
    }
};


//LOGOUT
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
        console.log("Error in logout controller", error.message);
        res.status(500).json({message: "Server error", error:error.message});
    }
};

//this will refresh the access token
export const refreshToken = async (req, res) => {
try {
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) {
        return res.status(401).json({message: "No refresh token provided."});
    }

    const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
    const storedToken = await redis.get(`refreshToken:${decoded.userId}`);

    if (storedToken !== refreshToken) {
        return res.status(401).json({message: "Invalid refresh token."});
    }

    jwt.sign({userId: decoded.userId}, process.env.ACCESS_TOKEN_SECRET, {expiresIn: "15m"});
    res.cookie("accessToken", accessToken, {
        httpOnly: true, // prevent  XSS attacks
        secure:process.env.NODE_ENV !== "development", // only works in production
        sameSite: "strict", // prevent SCRF attack, cross-site request forgery
        maxAge: 15 * 60 * 1000, // 15 minutes
    });
    res.json({message: "Access token refreshed."});

}
    catch (error) {
    console.log("Error in refresh token controller", error.message);
    res.status(500).json({message: "Server error", error:error.message});
}
};

export const getProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select("-password");
        res.json(user);
    } catch (error) {
        console.log("Error in get profile controller", error.message);
        res.status(500).json({message: "Server error", error:error.message});
    }
};