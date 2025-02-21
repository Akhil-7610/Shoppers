import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import userRoutes from "./routes/userRoutes.js";
import productRoutes from "./routes/productsRoutes.js";
import cartRoutes from "./routes/CartRoutes.js"

const app = express();
app.use(express.json());
app.use(cors());

dotenv.config();

const PORT = process.env.PORT || 3000;

// Connect to mongoDB
connectDB();

app.get("/", (req, res) => {
    res.send("Welcome to Shoppers API!");
});

// API Routes
app.use("/api/users", userRoutes);
app.use("/api/products", productRoutes)
app.use("/api/cart", cartRoutes)

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});


