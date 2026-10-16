const COMMON = [
  "password", "12345678", "qwerty", "iloveyou", "admin123",
  "letmein", "welcome", "abc123", "vyshop",
];

export interface PasswordRule {
  id: string;
  label: string;
  ok: boolean;
}

export function checkPassword(password: string, name: string, email: string): PasswordRule[] {
  const lower = password.toLowerCase();
  const emailLocal = email.split("@")[0].toLowerCase();
  const nameParts = name.toLowerCase().split(/\s+/).filter((p) => p.length >= 3);
  const personal =
    (emailLocal.length >= 3 && lower.includes(emailLocal)) ||
    nameParts.some((p) => lower.includes(p));

  return [
    { id: "length", label: "At least 10 characters", ok: password.length >= 10 },
    { id: "case", label: "Upper and lowercase letters", ok: /[a-z]/.test(password) && /[A-Z]/.test(password) },
    { id: "number", label: "At least one number", ok: /\d/.test(password) },
    { id: "symbol", label: "At least one symbol", ok: /[^A-Za-z0-9]/.test(password) },
    { id: "personal", label: "Doesn't contain your name or email", ok: !personal },
    { id: "common", label: "Not a common password", ok: !COMMON.some((c) => lower.includes(c)) },
  ];
}