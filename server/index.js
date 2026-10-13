// server/index.js
const express = require("express");
const cors = require("cors");
require("dotenv").config();

if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) {
  throw new Error('JWT_SECRET missing or too short');
}

const authRoutes = require("./routes/auth");
const productRoutes = require("./routes/products");
const orderRoutes = require("./routes/orders");
const accountRoutes = require("./routes/account");
const helmet = require("helmet");

const app = express();
app.set("trust proxy", 1);
app.use(helmet()); 

const PORT = process.env.PORT || 4000;

const allowedOrigins = [
  process.env.FRONTEND_URL, // Railway url
  "http://localhost:5173", // Vite dev server
  "http://localhost", // Capacitor Android (older default)
  "https://localhost", // Capacitor Android (newer default)
  "capacitor://localhost", // Capacitor iOS
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      // Requests with no Origin header (curl, server-to-server) are allowed through
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      // Not on the list: respond without CORS headers so the browser blocks it
      return callback(null, false);
    },
  }),
);
app.use(express.json({ limit: "10kb" }));

app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/account", accountRoutes);

// Just to check if status is ok :D
app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
