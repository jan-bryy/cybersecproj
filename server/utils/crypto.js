const crypto = require("crypto");

const key = Buffer.from(process.env.TOTP_ENC_KEY || "", "hex");
if (key.length !== 32) throw new Error("TOTP_ENC_KEY must be 32 bytes (64 hex chars)");

exports.encrypt = (text) => {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv("aes-256-gcm", key, iv);
  const enc = Buffer.concat([cipher.update(text, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return [iv, tag, enc].map((b) => b.toString("hex")).join(":");
};

exports.decrypt = (payload) => {
  const [iv, tag, enc] = payload.split(":").map((h) => Buffer.from(h, "hex"));
  const decipher = crypto.createDecipheriv("aes-256-gcm", key, iv);
  decipher.setAuthTag(tag);
  return Buffer.concat([decipher.update(enc), decipher.final()]).toString("utf8");
};