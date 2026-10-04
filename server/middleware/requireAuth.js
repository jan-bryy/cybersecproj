// server/middleware/requireAuth.js
const jwt = require("jsonwebtoken");
const pool = require("../db");

if (!process.env.JWT_SECRET) {
  throw new Error("JWT_SECRET is not set");
}

module.exports = async (req, res, next) => {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;
  if (!token) return res.status(401).json({ error: "unauthorized" });

  let payload;
  try {
    payload = jwt.verify(token, process.env.JWT_SECRET, {
      algorithms: ["HS256"],
      maxAge: "7d", // match whatever login uses for expiresIn
    });
  } catch {
    return res.status(401).json({ error: "unauthorized" });
  }

  if (!payload || typeof payload.userId === "undefined") {
    return res.status(401).json({ error: "unauthorized" });
  }

  try {
    const { rows } = await pool.query(
      "SELECT id, email, status FROM users WHERE id = $1",
      [payload.userId]
    );
    const user = rows[0];

    if (!user || user.status !== "active") {
      return res.status(401).json({ error: "unauthorized" });
    }

    req.user = { id: user.id, email: user.email };
    next();
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};