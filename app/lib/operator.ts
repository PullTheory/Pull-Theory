const DEFAULT_OPERATOR_EMAIL = "nikoelasleigh@icloud.com";

export function isPullTheoryOperator(email?: string | null) {
  const expectedEmail = (process.env.PULL_THEORY_AUTHENTICATOR_EMAIL || DEFAULT_OPERATOR_EMAIL)
    .trim()
    .toLowerCase();
  return Boolean(email?.trim() && email.trim().toLowerCase() === expectedEmail);
}
