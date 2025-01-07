//obsługa ścieżek

import User from "../models/user.model.js";

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