import Product from "../models/product.model.js";
import cloudinary from "../lib/cloudinary.js";
import { redis } from "../lib/redis.js";

export const getAllProducts = async (req, res) => {
    try {
        const products = await Product.find({}); //find all products
        res.json({products});
    } catch (error) {
        console.log("Error in get all products controller", error.message);
        res.status(500).json({message: "Server error", error:error.message});
        
    }
};

export const getFeaturedProducts = async (req, res) => {
    try {
        let featuredProducts = await redis.get("featuredProducts"); //find all products
        if (featuredProducts) {
            return res.json(JSON.parse(featuredProducts));
        }
         //if not in redis, fetch from mongodb
        featuredProducts = await Product.find({isFeatured: true}).lean();

        if (!featuredProducts) {

            return res.status(404).json({message: "No featured products found"});

        }

        // store in redis for future quick access

        await redis.set("featuredProducts", JSON.stringify(featuredProducts));

    } catch (error) {
        console.log("Error in get all products controller", error.message);
        res.status(500).json({message: "Server error", error:error.message});
        
    }
};

export const createProduct = async (req, res) => {
    try {
        const {name, description, price, image,category, isFeatured} = req.body;

        let cloudinaryResponse = null

        if (image) {
            cloudinaryResponse = await cloudinary.uploader.upload(image,{folder:"products"});
        }

        const product = await Product.create({
            name,
            description,
            price,
            image: cloudinaryResponse?.secure_url ? cloudinaryResponse.secure_url : '',
            category,
            isFeatured
        });

        res.status(201).json({product});

    } catch (error) {
       console.log("Error in create product controller", error.message);
       res.status(500).json({message: "Server error", error:error.message}); 
    }
};