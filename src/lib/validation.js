export const USERNAME_RE = /^[a-zA-Z0-9_]{3,30}$/;

export const USERNAME_INVALID_MESSAGE =
  "Username must be 3-30 characters (letters, numbers, underscore)";

export function isValidUsername(value) {
  return USERNAME_RE.test(String(value || "").trim());
}
