// server/routes/auth.js
const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const rateLimit = require("express-rate-limit");
const pool = require("../db");

const COMMON = ["password", "12345678", "qwerty", "iloveyou", "admin123", "letmein", "welcome", "abc123", "vyshop"];

// Same rules as src/utils/passwordPolicy.ts on the frontend
function passwordIsValid(password, name, email) {
  if (typeof password !== "string") return false;
  if (password.length < 10 || Buffer.byteLength(password, "utf8") > 72) return false;
  if (!/[a-z]/.test(password) || !/[A-Z]/.test(password)) return false;
  if (!/\d/.test(password) || !/[^A-Za-z0-9]/.test(password)) return false;
  const lower = password.toLowerCase();
  const local = String(email).split("@")[0].toLowerCase();
  if (local.length >= 3 && lower.includes(local)) return false;
  if (String(name).toLowerCase().split(/\s+/).some((p) => p.length >= 3 && lower.includes(p))) return false;
  return !COMMON.some((c) => lower.includes(c));
}

// Compared against when the email doesn't exist, so timing stays similar
const DUMMY_HASH = bcrypt.hashSync("not-a-real-password", 10);

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5, // 5 failed attempts per IP per 15 minutes
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => res.status(429).json({ error: "locked" }),
  skipSuccessfulRequests: true
});

router.post("/login",
  (req, res, next) => {
    res.on("finish", () =>
      console.log("login", res.statusCode, "ip:", req.ip, "xff:", req.headers["x-forwarded-for"])
    );
    next();
  },
  loginLimiter,
  async (req, res) => {
  const { email, password } = req.body || {};

  if (typeof email !== "string" || typeof password !== "string") {
    return res.status(400).json({ error: "bad_request" });
  }

  try {
    const result = await pool.query(
      "SELECT id, email, name, password_hash, status, totp_enabled FROM users WHERE email = $1",
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

    if (user.totp_enabled) {
      const pendingToken = jwt.sign(
        { userId: user.id, purpose: "2fa" },
        process.env.JWT_SECRET,
        { algorithm: "HS256", expiresIn: "5m" }
      );
      return res.json({ result: "2fa_required", pendingToken });
    }

    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET,
      { algorithm: "HS256", expiresIn: "1h" },
    );

    res.json({
      token,
      user: { id: user.id, email: user.email, name: user.name, totpEnabled: false },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

const registerLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10, // 10 sign-up attempts per IP per 15 minutes
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => res.status(429).json({ error: "locked" }),
});

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

router.post("/register", registerLimiter, async (req, res) => {
  const { name, email, password } = req.body || {};

  if (
    typeof name !== "string" ||
    typeof email !== "string" ||
    typeof password !== "string"
  ) {
    return res.status(400).json({ error: "bad_request" });
  }

  const cleanName = name.trim();
  const cleanEmail = email.trim().toLowerCase(); // login lowercases too

  if (
    cleanName.length < 1 || cleanName.length > 50 ||
    cleanEmail.length > 254 || !EMAIL_RE.test(cleanEmail)
  ) {
    return res.status(400).json({ error: "bad_request" });
  }

  // Password policy (length, mix, no name/email, not common, 72-byte bcrypt cap)
  if (!passwordIsValid(password, cleanName, cleanEmail)) {
    return res.status(400).json({ error: "invalid" });
  }

  try {
    const existing = await pool.query(
      "SELECT 1 FROM users WHERE email = $1",
      [cleanEmail],
    );
    if (existing.rows.length > 0) {
      return res.status(409).json({ error: "email_taken" });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const result = await pool.query(
      `INSERT INTO users (email, name, password_hash, status)
       VALUES ($1, $2, $3, 'active')
       RETURNING id, email, name`,
      [cleanEmail, cleanName, passwordHash],
    );
    const user = result.rows[0];

    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET,
      { algorithm: "HS256", expiresIn: "1h" },
    );

    res.status(201).json({ token, user: { ...user, totpEnabled: false } });
  } catch (err) {
    if (err.code === "23505") {
      // unique violation (two sign-ups raced)
      return res.status(409).json({ error: "email_taken" });
    }
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;