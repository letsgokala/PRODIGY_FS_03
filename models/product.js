import pool from "./db.js";

// Fetch all products
export const getAllProducts = async () => {
    const result = await pool.query("SELECT * FROM products ORDER BY created_at DESC");
    return result.rows;
};
