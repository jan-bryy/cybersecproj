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
    cleanEmail.length > 254 || !EMAIL_RE.test(cleanEmail) ||
    password.length < 8 ||
    Buffer.byteLength(password, "utf8") > 72 // bcrypt ignores anything past 72 bytes
  ) {
    return res.status(400).json({ error: "bad_request" });
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
      { expiresIn: "1h" },
    );

    res.status(201).json({ token, user });
  } catch (err) {
    if (err.code === "23505") {
      // unique violation (two sign-ups raced)
      return res.status(409).json({ error: "email_taken" });
    }
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});