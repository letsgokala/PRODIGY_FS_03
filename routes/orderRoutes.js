import express from "express";
import pool from "../models/db.js";
import { isAuthenticated } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", async (req, res) => {
    try {
        const orders = await pool.query(
            `SELECT id, total_price, status, created_at FROM orders WHERE user_id = $1 ORDER BY created_at DESC`,
            [req.session.userId]
        );

        res.render("orders", { orders: orders.rows });
    } catch (error) {
        console.error("Error fetching orders:", error);
        res.status(500).send("Server error");
    }
});
router.get("/:id", async (req, res) => {
    try {
        const orderId = req.params.id;
        const userId = req.session.userId;

        // Fetch order details with products
        const orderItems = await pool.query(
            `SELECT p.name, p.image, oi.quantity, p.price
             FROM order_items oi
             JOIN products p ON oi.product_id = p.id
             WHERE oi.order_id = $1`,
            [orderId]
        );

        res.json(orderItems.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Server error" });
    }
});



export default router;