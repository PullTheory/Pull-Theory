export function normalizeCardNumber(value: string) {
  const trimmed = value.trim();
  return /^\d{1,2}$/.test(trimmed) ? trimmed.padStart(3, "0") : trimmed;
}
