import express from "express";
import session from "express-session";
import dotenv from "dotenv";
import pool from "./models/db.js";
import productRoutes from "./routes/productRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import cartRoutes from "./routes/cartRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import checkoutRoutes from "./routes/checkoutRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import profileRoutes from "./routes/profileRoutes.js";


dotenv.config();

const app = express();

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));
app.use(
    session({
        secret: "@Khalid700",
        resave: false,
        saveUninitialized: true,
    })
);
app.use((req, res, next) => {
    res.locals.session = req.session; // Makes session available in EJS
    next();
});

// Middleware to check if a user is logged in
const isAuthenticated = (req, res, next) => {
    if (!req.session.userId) {
        return res.redirect("/login");
    }
    next();
};

// Middleware to check if a user is an admin
const isAdmin = (req, res, next) => {
    if (!req.session.userId || req.session.role !== "admin") {
        return res.redirect("/");
    }
    next();
};

app.use((req, res, next) => {
    res.locals.user = req.session.user || null;
    next();
});
app.use("/products" , productRoutes);
app.use("/", authRoutes);
app.use("/cart" , cartRoutes);
app.use("/orders" , orderRoutes);
app.use("/checkout", checkoutRoutes);
app.use("/admin" , adminRoutes);
app.use("/profile", profileRoutes);

// Set EJS as view engine
app.set("view engine", "ejs");

// Routes (to be implemented later)
app.get("/", async (req, res) => {
    const result = await pool.query("SELECT * FROM products");
    res.render("products", { 
        products: result.rows, 
        session: req.session // Pass session to EJS
    });  // Homepage (to be created)
});
pool.connect()
    .then(() => console.log("Connected to Database"))
    .catch(err => console.error("Database connection error", err));


// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
