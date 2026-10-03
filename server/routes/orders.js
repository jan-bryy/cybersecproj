const express = require("express");
const pool = require("../db");
const requireAuth = require("../middleware/requireAuth");

const router = express.Router();

const SHIPPING_FEE = 32;
const PAYMENT_METHODS = ["cod"];

class HttpError extends Error {
  constructor(status, code) {
    super(code);
    this.status = status;
    this.code = code;
  }
}

router.post("/", requireAuth, async (req, res) => {
  const { items, paymentMethod } = req.body || {};

  if (!Array.isArray(items) || items.length === 0 || items.length > 50) {
    return res.status(400).json({ error: "bad_request" });
  }
  if (!PAYMENT_METHODS.includes(paymentMethod)) {
    return res.status(400).json({ error: "bad_request" });
  }

  // Merge duplicates and validate; prices are NOT taken from the client
  const qtyById = new Map();
  for (const item of items) {
    const id = Number(item?.id);
    const qty = Number(item?.quantity);
    if (
      !Number.isInteger(id) || id < 1 ||
      !Number.isInteger(qty) || qty < 1 || qty > 99
    ) {
      return res.status(400).json({ error: "bad_request" });
    }
    qtyById.set(id, (qtyById.get(id) || 0) + qty);
  }

  let client;
  try {
    client = await pool.connect();
    await client.query("BEGIN");

    const { rows: products } = await client.query(
      "SELECT id, price FROM products WHERE id = ANY($1::int[])",
      [[...qtyById.keys()]]
    );
    if (products.length !== qtyById.size) {
      throw new HttpError(400, "unavailable");
    }

    const lines = products.map((p) => ({
      productId: p.id,
      price: Number(p.price),
      quantity: qtyById.get(p.id),
    }));

    const subtotal = lines.reduce((sum, l) => sum + l.price * l.quantity, 0);
    const total = Math.round((subtotal + SHIPPING_FEE) * 100) / 100;

    const orderResult = await client.query(
      "INSERT INTO orders (user_id, total_amount) VALUES ($1, $2) RETURNING id",
      [req.user.id, total]
    );
    const orderId = orderResult.rows[0].id;

    for (const l of lines) {
      await client.query(
        `INSERT INTO order_items (order_id, product_id, quantity, price_at_purchase)
         VALUES ($1, $2, $3, $4)`,
        [orderId, l.productId, l.quantity, l.price]
      );
    }

    await client.query("COMMIT");
    res.status(201).json({ orderId, total });
  } catch (err) {
    if (client) await client.query("ROLLBACK").catch(() => {});
    if (err instanceof HttpError) {
      return res.status(err.status).json({ error: err.code });
    }
    console.error(err);
    res.status(500).json({ error: "Server error" });
  } finally {
    if (client) client.release();
  }
});

module.exports = router;