import express from "express";
import multer from "multer";
import cookieParser from "cookie-parser";
import "dotenv/config";
import cors from "cors";
import mongoose from "mongoose";
import connectDB from "./src/config/db.js";
import seedDefaultAdmin from "./src/config/defaultAdmin.js";
import authRoutes from "./src/routes/authRoutes.js";
import adminRoutes from "./src/routes/adminRoutes.js";
import productRoutes from "./src/routes/productRoutes.js";
import userRoutes from "./src/routes/userRoutes.js";
import orderRoutes from "./src/routes/orderRoutes.js";
import paymentRoutes from "./src/routes/paymentRoutes.js";
import campaignRoutes from "./src/routes/campaignRoutes.js";
import categoryRoutes from "./src/routes/categoryRoutes.js";
import contactRoutes from "./src/routes/contactRoutes.js";
import publicCouponRoutes from "./src/routes/publicCouponRoutes.js";
import path from "path";
import { fileURLToPath } from "url";

const app = express();
const currentFile = fileURLToPath(import.meta.url);
const currentDir = path.dirname(currentFile);

const frontendOrigin = process.env.FRONTEND_URL || "http://localhost:5173";

app.use(
  cors({
    origin: frontendOrigin,
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);

app.use(cookieParser());
app.use(express.json({ limit: "10mb" }));

// Handle malformed JSON payloads (body-parser syntax errors)
app.use((err, _req, res, next) => {
  if (err && err.type === "entity.parse.failed") {
    return res.status(400).json({ message: "Invalid JSON payload" });
  }

  if (err instanceof multer.MulterError) {
    return res.status(400).json({ message: err.message });
  }

  if (err && err.message === "Only image files are allowed") {
    return res.status(400).json({ message: err.message });
  }

  return next(err);
});

app.use("/uploads", express.static(path.join(currentDir, "uploads")));

app.get("/", (_req, res) => {
  res.json({ message: "HAIERAH backend is running" });
});

app.use("/api", (_req, res, next) => {
  if (mongoose.connection.readyState !== 1) {
    return res.status(503).json({
      message: "Database is unavailable. Please try again shortly.",
    });
  }

  return next();
});

// routes
app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/users", userRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/payment", paymentRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/campaigns", campaignRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/contact", contactRoutes);
app.use("/api/coupons", publicCouponRoutes);

const DEFAULT_PORT = Number(process.env.PORT || 5000);
const MAX_PORT_ATTEMPTS = 10;
const DB_RETRY_DELAY_MS = 5000;

const startServer = (port, attempt = 1) => {
  const server = app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
  });

  server.on("error", (error) => {
    if (error.code === "EADDRINUSE") {
      const nextPort = port + 1;
      if (attempt >= MAX_PORT_ATTEMPTS) {
        console.error(
          `Unable to find a free port after ${MAX_PORT_ATTEMPTS} attempts. Please set PORT in .env to a free port.`,
        );
        return;
      }

      console.warn(`Port ${port} is already in use. Retrying on ${nextPort}.`);
      startServer(nextPort, attempt + 1);
      return;
    }

    console.error(`Failed to start server on port ${port}:`, error.message);
  });
};

startServer(DEFAULT_PORT);

const initializeDatabase = async () => {
  while (true) {
    try {
      await connectDB();
      await seedDefaultAdmin();
      return;
    } catch (error) {
      console.error(
        `Database initialization failed. Retrying in ${DB_RETRY_DELAY_MS / 1000} seconds:`,
        error?.message || error,
      );
      await new Promise((resolve) => setTimeout(resolve, DB_RETRY_DELAY_MS));
    }
  }
};

void initializeDatabase();
