// server/routes/account.js
const express = require("express");
const pool = require("../db");
const requireAuth = require("../middleware/requireAuth");

const router = express.Router();

router.delete("/", requireAuth, async (req, res) => {
  // The server re-checks the typed confirmation; it never trusts the UI alone
  if (req.body?.confirmation !== "delete-account") {
    return res.status(400).json({ error: "bad_request" });
  }

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

module.exports = router;