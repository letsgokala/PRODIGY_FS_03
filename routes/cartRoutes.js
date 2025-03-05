import express from "express";
import pool from "../models/db.js";
import { isAuthenticated } from "../middleware/authMiddleware.js";

const router = express.Router();

// Add a product to the cart
router.post("/add", async (req, res) => {
    const { product_id } = req.body;
    const user_id = req.session.userId;

    try {
        const result = await pool.query(
            "SELECT * FROM cart WHERE user_id = $1 AND product_id = $2",
            [user_id, product_id]
        );

        if (result.rows.length > 0) {
            await pool.query(
                "UPDATE cart SET quantity = quantity + 1 WHERE user_id = $1 AND product_id = $2",
                [user_id, product_id]
            );
        } else {
            await pool.query(
                "INSERT INTO cart (user_id, product_id, quantity) VALUES ($1, $2, 1)",
                [user_id, product_id]
            );
        }

        res.redirect("/products");
    } catch (error) {
        console.error("Error adding to cart:", error);
        res.status(500).send("Server error");
    }
});

// View cart items
router.get("/", async (req, res) => {
    const user_id = req.session.userId;

    try {
        const result = await pool.query(
            `SELECT cart.id, cart.product_id, products.name, products.price, cart.quantity , products.image
            FROM cart
            JOIN products ON cart.product_id = products.id
            WHERE cart.user_id = $1`,
            [user_id]
        );
        console.log("Cart Items Sent to EJS:", result.rows); // Debugging log

        res.render("cart", { cartItems: result.rows });
    } catch (error) {
        console.error("Error fetching cart items:", error);
        res.status(500).send("Server error");
    }
});

router.post("/update", async (req, res) => {
    let { product_id, action } = req.body;
    console.log("Received product_id:", product_id);
    console.log("Received action:", action);
    // Ensure product_id is a valid integer
    if (!product_id || isNaN(product_id)) {
        return res.status(400).send("Invalid product ID");
    }

    product_id = parseInt(product_id); // Convert to integer

    try {
        if (action === "increase") {
            await pool.query(
                "UPDATE cart SET quantity = quantity + 1 WHERE user_id = $1 AND product_id = $2",
                [req.session.userId, product_id]
            );
        } else if (action === "decrease") {
            const result = await pool.query(
                "SELECT quantity FROM cart WHERE user_id = $1 AND product_id = $2",
                [req.session.userId, product_id]
            );

            if (result.rows.length > 0 && result.rows[0].quantity > 1) {
                await pool.query(
                    "UPDATE cart SET quantity = quantity - 1 WHERE user_id = $1 AND product_id = $2",
                    [req.session.userId, product_id]
                );
            }
        }

        res.redirect("/cart");
    } catch (error) {
        console.error("Error updating cart quantity:", error);
        res.status(500).send("Server error");
    }
});


// Remove an item from the cart
router.post("/remove", async (req, res) => {
    const user_id = req.session.userId;
    const { product_id } = req.body;

    try {
        await pool.query(
            "DELETE FROM cart WHERE user_id = $1 AND product_id = $2",
            [user_id, product_id]
        );
        res.redirect("/cart");
    } catch (error) {
        console.error("Error removing item from cart:", error);
        res.status(500).send("Server error");
    }
});


export default router;
