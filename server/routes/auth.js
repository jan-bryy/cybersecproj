// server/routes/auth.js
const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const rateLimit = require("express-rate-limit");
const pool = require("../db");

// Compared against when the email doesn't exist, so timing stays similar
const DUMMY_HASH = bcrypt.hashSync("not-a-real-password", 10);

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10, // 10 attempts per IP per 15 minutes
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => res.status(429).json({ error: "locked" }),
});

router.post("/login", loginLimiter, async (req, res) => {
  const { email, password } = req.body || {};

  if (typeof email !== "string" || typeof password !== "string") {
    return res.status(400).json({ error: "bad_request" });
  }

  try {
    const result = await pool.query(
      "SELECT id, email, name, password_hash, status FROM users WHERE email = $1",
      [email.trim().toLowerCase()],
    );
    const user = result.rows[0];

    const passwordMatches = await bcrypt.compare(
      password,
      user ? user.password_hash : DUMMY_HASH,
    );

    if (!user || !passwordMatches) {
      return res.status(401).json({ error: "invalid" });
    }

    // Only revealed after the password is proven correct
    if (user.status === "suspended") {
      return res.status(403).json({ error: "suspended" });
    }

    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "1h" },
    );

    res.json({
      token,
      user: { id: user.id, email: user.email, name: user.name },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
