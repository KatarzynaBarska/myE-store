import express from "express";
import { createProduct,getAllProducts, getFeaturedProducts } from "../controllers/product.controller.js";
import { adminRoute, protectRoute } from "../middleware/auth.middleware.js";

const router = express.Router();

//safe route for admin
router.get("/", protectRoute, adminRoute, getAllProducts);

// route for users to get featured products
router.get("/featured", getFeaturedProducts);

//route for admin to add new product, protect route
router.post("/", protectRoute, adminRoute, createProduct);



export default router;
