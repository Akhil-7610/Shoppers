import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import userRoutes from "./routes/userRoutes.js";
import productRoutes from "./routes/productsRoutes.js";
import cartRoutes from "./routes/CartRoutes.js"
import checkoutRoutes from "./routes/checkoutRoutes.js"
import orderRoutes from "./routes/orderRoutes.js"
import uploadRoutes from "./routes/uploadRoutes.js"
import subscriberRoutes from "./routes/subscriberRoutes.js"
import adminRoutes from "./routes/adminRoutes.js"
import productAdminRoutes from "./routes/productAdminRoutes.js"
import adminOrderRoutes from "./routes/adminOrderRoutes.js"

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
app.use("/api/checkout", checkoutRoutes)
app.use("/api/orders", orderRoutes)
app.use("/api/upload", uploadRoutes)
app.use("/api", subscriberRoutes)

// Admin
app.use("/api/admin/users", adminRoutes)
app.use("/api/admin/products", productAdminRoutes)
app.use("/api/admin/orders", adminOrderRoutes)

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});


