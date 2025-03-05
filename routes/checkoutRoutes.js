import express from "express";
import pool from "../models/db.js";
import { isAuthenticated } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", async (req, res) => {
    try {
        const cartItems = await pool.query(
            `SELECT cart.product_id, products.name, products.price, cart.quantity
             FROM cart
             JOIN products ON cart.product_id = products.id
             WHERE cart.user_id = $1`, [req.session.userId]
        );

        const totalPrice = cartItems.rows.reduce((sum, item) => sum + item.price * item.quantity, 0);
        res.render("checkout", { cartItems: cartItems.rows, totalPrice });
    } catch (error) {
        console.error("Error loading checkout page:", error);
        res.status(500).send("Server error");
    }
});

router.post("/", async (req, res) => {
    try {
        const cartItems = await pool.query(
            `SELECT product_id, quantity, products.price
             FROM cart JOIN products ON cart.product_id = products.id
             WHERE cart.user_id = $1`, [req.session.userId]
        );

        if (cartItems.rows.length === 0) {
            return res.redirect("/cart");
        }

        const totalPrice = cartItems.rows.reduce((sum, item) => sum + item.price * item.quantity, 0);

        const orderResult = await pool.query(
            "INSERT INTO orders (user_id, total_price) VALUES ($1, $2) RETURNING id",
            [req.session.userId, totalPrice]
        );

        const orderId = orderResult.rows[0].id;

        for (const item of cartItems.rows) {
            await pool.query(
                "INSERT INTO order_items (order_id, product_id, quantity, price) VALUES ($1, $2, $3, $4)",
                [orderId, item.product_id, item.quantity, item.price]
            );
        }

        await pool.query("DELETE FROM cart WHERE user_id = $1", [req.session.userId]);

        res.redirect("/orders");
    } catch (error) {
        console.error("Error processing checkout:", error);
        res.status(500).send("Server error");
    }
});

export default router;