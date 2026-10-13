const jwt = require("jsonwebtoken");
const pool = require("../db");

if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) {
  throw new Error("JWT_SECRET missing or too short");
}

const make = (allowUnenrolled) => async (req, res, next) => {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;
  if (!token) return res.status(401).json({ error: "unauthorized" });

  let payload;
  try {
    payload = jwt.verify(token, process.env.JWT_SECRET, { algorithms: ["HS256"] });
  } catch {
    return res.status(401).json({ error: "unauthorized" });
  }

  // pending-2FA tokens are only valid at /api/2fa/login-verify
  if (!payload || typeof payload.userId === "undefined" || payload.purpose) {
    return res.status(401).json({ error: "unauthorized" });
  }

  try {
    const { rows } = await pool.query(
      "SELECT id, email, status, totp_enabled FROM users WHERE id = $1",
      [payload.userId]
    );
    const user = rows[0];

    if (!user || user.status !== "active") {
      return res.status(401).json({ error: "unauthorized" });
    }
    if (!allowUnenrolled && !user.totp_enabled) {
      return res.status(403).json({ error: "2fa_setup_required" });
    }

    req.user = { id: user.id, email: user.email };
    next();
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};

module.exports = make(false);
module.exports.allowUnenrolled = make(true);