import express from "express";
import pool from "../models/db.js";
import bcrypt from "bcryptjs";
import { isAuthenticated } from "../middleware/authMiddleware.js";

const router = express.Router();

// View Profile
router.get("/", async (req, res) => {
    try {
        const user = await pool.query(
            "SELECT username FROM users WHERE id = $1",
            [req.session.userId]
        );

        if (user.rows.length === 0) return res.redirect("/login");

        res.render("profile", { user: user.rows[0], message: null });
    } catch (error) {
        console.error("Error fetching profile:", error);
        res.status(500).send("Server error");
    }
});

// Update Profile (Username & Password)
router.post("/update", async (req, res) => {
    const { username, password } = req.body;

    try {
        // Fetch current user data
        const user = await pool.query("SELECT username FROM users WHERE id = $1", [req.session.userId]);

        if (user.rows.length === 0) return res.redirect("/login");

        let newUsername = user.rows[0].username;
        let newPassword = null;

        if (username.trim()) {
            newUsername = username;
        }

        if (password.trim()) {
            const salt = await bcrypt.genSalt(10);
            newPassword = await bcrypt.hash(password, salt);
        }

        // Update only the specified fields
        if (newPassword) {
            await pool.query("UPDATE users SET username = $1, password = $2 WHERE id = $3", [newUsername, newPassword, req.session.userId]);
        } else {
            await pool.query("UPDATE users SET username = $1 WHERE id = $2", [newUsername, req.session.userId]);
        }

        res.render("profile", { user: { username: newUsername }, message: "Profile updated successfully!", user: req.session.role });

    } catch (error) {
        console.error("Error updating profile:", error);
        res.status(500).send("Server error");
    }
});

export default router;
