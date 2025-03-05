import express from "express";
import pool from "../models/db.js";
import { getAllProducts } from "../models/product.js";

const router = express.Router();

// Route to get all products
router.get("/", async (req, res) => {
    try {
        const result = await pool.query("SELECT * FROM products");
        res.render("products", { 
            products: result.rows, 
            session: req.session // Pass session to EJS
        });
    } catch (error) {
        console.error("Error fetching products:", error);
        res.status(500).send("Server error");
    }
});


export default router;
