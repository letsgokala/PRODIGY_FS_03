import express from "express";
import pool from "../models/db.js";
import multer from "multer";
import path from "path";
import { ensureAdmin } from "../middleware/authMiddleware.js";

const router = express.Router();

// ============================
// 📌 Setup Image Upload
// ============================

const storage = multer.diskStorage({
  destination: "./public/uploads/",
  filename: (req, file, cb) => {
    cb(null, file.fieldname + "-" + Date.now() + path.extname(file.originalname));
  },
});
const upload = multer({ storage });

// ============================
// 🚀 Admin Dashboard
// ============================

// 1️⃣ Admin Dashboard
router.get("/", async (req, res) => {
    try {
        // Ensure user is logged in
        if (!req.session.userId) {
            return res.redirect("/login");
        }

        // Get total orders
        const totalOrdersResult = await pool.query("SELECT COUNT(*) AS count FROM orders");
        const totalOrders = totalOrdersResult.rows[0].count;

        // Get pending orders (case-insensitive)
        const pendingOrdersResult = await pool.query("SELECT COUNT(*) AS count FROM orders WHERE LOWER(status) = 'pending'");
        const pendingOrders = pendingOrdersResult.rows[0].count;

        // Get total products added by this admin
        const adminProductsResult = await pool.query("SELECT * FROM products WHERE admin_id = $1", [req.session.userId]);
        const adminProducts = adminProductsResult.rows.length;

        // Render the admin dashboard with correct data
        res.render("adminDashboard", { totalOrders, pendingOrders, adminProducts });

    } catch (error) {
        console.error("Error loading admin dashboard:", error);
        res.status(500).send("Error loading admin dashboard");
    }
});

  

// ============================
// 🚀 Manage Products (CRUD)
// ============================

// 2️⃣ View All Products
router.get("/products", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM products ORDER BY id DESC");
    res.render("adminProducts", { products: result.rows });
  } catch (error) {
    console.error(error);
    res.send("Error loading products");
  }
});

// 3️⃣ Add Product (GET)
router.get("/products/add", (req, res) => {
  res.render("addProduct");
});

// 4️⃣ Add Product (POST)
router.post("/products/add", upload.single("image"), async (req, res) => {
  const { name, description, price, category } = req.body;
  const image = req.file ? `/uploads/${req.file.filename}` : null;

  try {
    await pool.query(
      "INSERT INTO products (name, description, price, category, image, admin_id) VALUES ($1, $2, $3, $4, $5, $6)",
      [name, description, price, category, image, req.session.userId]
    );
    res.redirect("/admin/products");
  } catch (error) {
    console.error(error);
    res.send("Error adding product");
  }
});

// 5️⃣ Edit Product (GET)
router.get("/products/edit/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const product = await pool.query("SELECT * FROM products WHERE id = $1", [id]);
    res.render("editProduct", { product: product.rows[0] });
  } catch (error) {
    console.error(error);
    res.send("Error loading product for edit");
  }
});

// 6️⃣ Edit Product (POST)
router.post("/products/edit/:id", upload.single("image"), async (req, res) => {
  const { id } = req.params;
  const { name, description, price, category } = req.body;
  const image = req.file ? `/uploads/${req.file.filename}` : null;

  try {
    if (image) {
      await pool.query(
        "UPDATE products SET name = $1, description = $2, price = $3, category = $4, image = $5 WHERE id = $6",
        [name, description, price, category, image, id]
      );
    } else {
      await pool.query(
        "UPDATE products SET name = $1, description = $2, price = $3, category = $4 WHERE id = $5",
        [name, description, price, category, id]
      );
    }
    res.redirect("/admin/products");
  } catch (error) {
    console.error(error);
    res.send("Error updating product");
  }
});

// 7️⃣ Delete Product
router.post("/products/delete/:id", async (req, res) => {
  const { id } = req.params;

  try {
    await pool.query("DELETE FROM products WHERE id = $1", [id]);
    res.redirect("/admin/products");
  } catch (error) {
    console.error(error);
    res.send("Error deleting product");
  }
});

// ============================
// 🚀 Manage Orders
// ============================

// 8️⃣ View All Orders
router.get("/orders", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM orders ORDER BY created_at DESC");
    res.render("adminOrders", { orders: result.rows });
  } catch (error) {
    console.error(error);
    res.send("Error loading orders");
  }
});

// 9️⃣ View Order Details
// router.get("/orders/view/:id", async (req, res) => {
//   const { id } = req.params;
//   try {
//     const order = await pool.query("SELECT * FROM orders WHERE id = $1", [id]);
//     const orderItems = await pool.query("SELECT * FROM order_items WHERE order_id = $1", [id]);
//     res.render("orderDetails", { order: order.rows[0], items: orderItems.rows });
//   } catch (error) {
//     console.error(error);
//     res.send("Error loading order details");
//   }
// });

// 🔟 Update Order Status
router.post("/orders/update/:id", async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  try {
    await pool.query("UPDATE orders SET status = $1 WHERE id = $2", [status, id]);
    res.redirect("/admin/orders");
  } catch (error) {
    console.error(error);
    res.send("Error updating order status");
  }
});

export default router;
