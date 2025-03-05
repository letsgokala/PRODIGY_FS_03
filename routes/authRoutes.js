import express from "express";
import bcrypt from "bcryptjs";
import pool from "../models/db.js";


const router = express.Router();

router.get("/register" , (req, res) => {
    res.render("register");
});
router.get("/login" , (req, res) => {
    res.render("login");
});

// User Registration
router.post("/register", async (req, res) => {
    const { username, email, password, role } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);

    try {
        const existingUser = await pool.query("SELECT * FROM users WHERE username = $1", [username]);
        if (existingUser.rows.length > 0) {
            res.render("register" , {error: "Username already exists!"})
        }

        await pool.query(
            "INSERT INTO users (username, email, password, role) VALUES ($1, $2, $3, $4)",
            [username, email, hashedPassword, role || "client"]
        );

        res.redirect("/login");
    } catch (error) {
        console.error("Error during registration:", error);
        res.status(500).send("Server error");
    }
});

// User Login
router.post("/login", async (req, res) => {
    const { username, password } = req.body;

    try {
        const result = await pool.query("SELECT * FROM users WHERE username = $1", [username]);

        if (result.rows.length === 0) {
            return res.render("login" , {error: "Invalid username"});
        }

        const user = result.rows[0];
        const validPassword = await bcrypt.compare(password, user.password);

        if (!validPassword) {
            return res.render("login" , {error: "Invalid password"});
        }

        req.session.userId = user.id;
        req.session.role = user.role;

        if (user.role === "admin") {
            res.redirect("/admin");
        } else {
            res.redirect("/products"); // Redirect non-admin users to the shop page
        }
    } catch (error) {
        console.error("Error logging in:", error);
        res.status(500).send("Server error");
    }
});


// User Logout
router.get("/logout", (req, res) => {
    req.session.destroy(() => {
        res.redirect("/login");
    });
});

export default router;
