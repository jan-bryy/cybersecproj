// server/routes/account.js
const express = require("express");
const pool = require("../db");
const requireAuth = require("../middleware/requireAuth");
const { checkSecondFactor } = require("./twofa");

const router = express.Router();

router.delete("/", requireAuth, async (req, res) => {
  const { confirmation, code, recoveryCode } = req.body || {};

  // The server re-checks the typed confirmation; it never trusts the UI alone
  if (confirmation !== "delete-account") {
    return res.status(400).json({ error: "bad_request" });
  }

  // Second factor: a current authenticator code or a recovery code
  const value = String(recoveryCode || code || "").trim();
  if (!value) return res.status(400).json({ error: "code_required" });
  if (!recoveryCode && !/^\d{6}$/.test(value)) {
    return res.status(400).json({ error: "invalid_code" });
  }

  // Shares the attempt counter, lock and replay protection with login.
  // 400 (not 401) on a bad code: a 401 would make SessionWatcher log the user out.
  const check = await checkSecondFactor(
    req.user.id,
    recoveryCode ? { recoveryCode: value } : { code: value },
  ).catch(() => null);
  if (!check) return res.status(500).json({ error: "Server error" });
  if (check.error === "locked") return res.status(429).json({ error: "locked" });
  if (check.error) return res.status(400).json({ error: "invalid_code" });

  let client;
  try {
    client = await pool.connect();
    await client.query("BEGIN");

    await client.query(
      "DELETE FROM order_items WHERE order_id IN (SELECT id FROM orders WHERE user_id = $1)",
      [req.user.id]
    );
    await client.query("DELETE FROM orders WHERE user_id = $1", [req.user.id]);
    await client.query("DELETE FROM cart_items WHERE user_id = $1", [req.user.id]);
    await client.query("DELETE FROM recovery_codes WHERE user_id = $1", [req.user.id]);
    await client.query("DELETE FROM users WHERE id = $1", [req.user.id]);

    await client.query("COMMIT");
    res.json({ deleted: true });
  } catch (err) {
    if (client) await client.query("ROLLBACK").catch(() => {});
    console.error(err);
    res.status(500).json({ error: "Server error" });
  } finally {
    if (client) client.release();
  }
});

// GET /api/account/device-consent
// "granted" -> true; "declined" or never asked (NULL) -> false
router.get("/device-consent", requireAuth.allowUnenrolled, async (req, res) => {
  try {
    const { rows } = await pool.query(
      "SELECT device_check_consent FROM users WHERE id = $1",
      [req.user.id],
    );
    res.json({ granted: rows[0]?.device_check_consent === "granted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// PATCH /api/account/device-consent  { granted: boolean }
router.patch("/device-consent", requireAuth.allowUnenrolled, async (req, res) => {
  const { granted } = req.body || {};
  if (typeof granted !== "boolean") {
    return res.status(400).json({ error: "bad_request" });
  }

  try {
    await pool.query(
      `UPDATE users
          SET device_check_consent = $1,
              device_check_consent_at = now()
        WHERE id = $2`,
      [granted ? "granted" : "declined", req.user.id],
    );
    res.json({ granted });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;