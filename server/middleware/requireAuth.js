// server/middleware/requireAuth.js
const jwt = require("jsonwebtoken");
const pool = require("../db");

module.exports = async (req, res, next) => {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;
  if (!token) return res.status(401).json({ error: "unauthorized" });

  let payload;
  try {
    payload = jwt.verify(token, process.env.JWT_SECRET, { algorithms: ["HS256"] });
  } catch {
    return res.status(401).json({ error: "unauthorized" });
  }

  try {
    const { rows } = await pool.query(
      "SELECT id, email, status FROM users WHERE id = $1",
      [payload.userId]
    );
    const user = rows[0];

    // Deleted account, or suspended after the token was issued
    if (!user || user.status === "suspended") {
      return res.status(401).json({ error: "unauthorized" });
    }

    req.user = { id: user.id, email: user.email };
    next();
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};