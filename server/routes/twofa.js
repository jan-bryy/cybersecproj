const express = require("express");
const crypto = require("crypto");
const rateLimit = require("express-rate-limit");
const { authenticator } = require("otplib");
const QRCode = require("qrcode");
const pool = require("../db");
const requireAuth = require("../middleware/requireAuth");
const jwt = require("jsonwebtoken");
const { encrypt, decrypt } = require("../utils/crypto");

const router = express.Router();
authenticator.options = { window: 1 }; // allow 30s clock drift either way

const setupLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 10,
  keyGenerator: (req) => String(req.user.id), // per account, not per IP
  standardHeaders: true,
  legacyHeaders: false,
});

const makeRecoveryCodes = () =>
  Array.from({ length: 10 }, () => {
    const raw = crypto.randomBytes(5).toString("hex"); // 10 chars
    return `${raw.slice(0, 5)}-${raw.slice(5)}`;
  });

const hashCode = (code) =>
  crypto.createHash("sha256").update(code.replace("-", "").toLowerCase()).digest("hex");

// Step 1: create a secret and return the QR
router.post("/setup", requireAuth.allowUnenrolled, setupLimiter, async (req, res) => {
  try {
    const { rows } = await pool.query(
      "SELECT email, totp_enabled FROM users WHERE id = $1",
      [req.user.id]
    );
    if (rows[0].totp_enabled) return res.status(409).json({ error: "already_enabled" });

    const secret = authenticator.generateSecret();
    await pool.query("UPDATE users SET totp_secret = $1 WHERE id = $2", [
      encrypt(secret),
      req.user.id,
    ]);

    const otpauth = authenticator.keyuri(rows[0].email, "Shopapp", secret);
    const qr = await QRCode.toDataURL(otpauth);
    res.json({ qr, manualKey: secret });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// Step 2: confirm the first code, turn 2FA on, hand out recovery codes once
router.post("/verify-setup", requireAuth.allowUnenrolled, setupLimiter, async (req, res) => {
  try {
    const code = String(req.body.code || "").trim();
    const { rows } = await pool.query(
      "SELECT totp_secret, totp_enabled FROM users WHERE id = $1",
      [req.user.id]
    );
    const user = rows[0];
    if (user.totp_enabled) return res.status(409).json({ error: "already_enabled" });
    if (!user.totp_secret) return res.status(400).json({ error: "no_setup_started" });

    if (!authenticator.check(code, decrypt(user.totp_secret))) {
      return res.status(400).json({ error: "invalid_code" });
    }

    const codes = makeRecoveryCodes();
    const client = await pool.connect();
    try {
      await client.query("BEGIN");
      await client.query("UPDATE users SET totp_enabled = true WHERE id = $1", [req.user.id]);
      await client.query("DELETE FROM recovery_codes WHERE user_id = $1", [req.user.id]);
      for (const c of codes) {
        await client.query(
          "INSERT INTO recovery_codes (user_id, code_hash) VALUES ($1, $2)",
          [req.user.id, hashCode(c)]
        );
      }
      await client.query("COMMIT");
    } catch (e) {
      await client.query("ROLLBACK");
      throw e;
    } finally {
      client.release();
    }

    res.json({ recoveryCodes: codes }); // shown once, never retrievable again
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

const MAX_ATTEMPTS = 5;

router.post("/login-verify", async (req, res) => {
  try {
    const { pendingToken, code, recoveryCode } = req.body || {};
    if (!pendingToken || (!code && !recoveryCode)) {
      return res.status(400).json({ error: "missing_fields" });
    }

    let payload;
    try {
      payload = jwt.verify(pendingToken, process.env.JWT_SECRET, { algorithms: ["HS256"] });
    } catch {
      return res.status(401).json({ error: "pending_expired" });
    }
    if (payload.purpose !== "2fa") return res.status(401).json({ error: "pending_expired" });
    const userId = payload.userId;

    // Count the attempt BEFORE checking the code. Atomic, and skipped while locked.
    const { rows } = await pool.query(
      `UPDATE users SET totp_failed_attempts = totp_failed_attempts + 1
       WHERE id = $1 AND status = 'active' AND totp_enabled = true
         AND (totp_locked_until IS NULL OR totp_locked_until <= now())
       RETURNING email, name, totp_secret, totp_last_step, totp_failed_attempts, totp_lock_count`,
      [userId]
    );

    if (!rows[0]) {
      const { rows: u } = await pool.query(
        "SELECT totp_locked_until FROM users WHERE id = $1",
        [userId]
      );
      if (u[0] && u[0].totp_locked_until && new Date(u[0].totp_locked_until) > new Date()) {
        return res.status(429).json({ error: "locked", lockedUntil: u[0].totp_locked_until });
      }
      return res.status(401).json({ error: "unauthorized" });
    }
    const user = rows[0];

    // Too many attempts: lock, doubling each time (15m, 30m, 1h ... max 24h)
    if (user.totp_failed_attempts > MAX_ATTEMPTS) {
      const minutes = Math.min(15 * 2 ** user.totp_lock_count, 1440);
      const { rows: l } = await pool.query(
        `UPDATE users SET totp_locked_until = now() + ($2 || ' minutes')::interval,
           totp_failed_attempts = 0, totp_lock_count = totp_lock_count + 1
         WHERE id = $1 AND (totp_locked_until IS NULL OR totp_locked_until <= now())
         RETURNING totp_locked_until`,
        [userId, String(minutes)]
      );
      if (!l[0]) return res.status(429).json({ error: "locked" });
      return res.status(429).json({ error: "locked", lockedUntil: l[0].totp_locked_until });
    }

    let ok = false;
    let matchedStep = null;

    if (code) {
      const delta = authenticator.checkDelta(String(code).trim(), decrypt(user.totp_secret));
      if (delta !== null) {
        matchedStep = Math.floor(Date.now() / 1000 / 30) + delta;
        // replay protection: a code can only be used once
        ok = user.totp_last_step === null || matchedStep > Number(user.totp_last_step);
      }
    } else {
      // single-use recovery code, claimed atomically
      const r = await pool.query(
        `UPDATE recovery_codes SET used_at = now()
         WHERE user_id = $1 AND code_hash = $2 AND used_at IS NULL RETURNING id`,
        [userId, hashCode(String(recoveryCode).trim())]
      );
      ok = r.rowCount === 1;
    }

    if (!ok) return res.status(401).json({ error: "invalid_code" });

    await pool.query(
      `UPDATE users SET totp_failed_attempts = 0, totp_lock_count = 0, totp_locked_until = NULL,
         totp_last_step = GREATEST(COALESCE(totp_last_step, 0), $2)
       WHERE id = $1`,
      [userId, matchedStep ?? 0]
    );

    const token = jwt.sign(
      { userId, email: user.email },
      process.env.JWT_SECRET,
      { algorithm: "HS256", expiresIn: "1h" }
    );
    res.json({ token, user: { id: userId, email: user.email, name: user.name, totpEnabled: true } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;