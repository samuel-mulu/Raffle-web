export function maskPhoneNumber(phone: string) {
  const value = phone.trim();

  if (value.length <= 6) {
    return value;
  }

  const prefixLength = value.startsWith('+') ? 4 : 3;
  const suffixLength = 2;
  const visiblePrefix = value.slice(0, prefixLength);
  const visibleSuffix = value.slice(-suffixLength);
  const maskedLength = Math.max(4, value.length - prefixLength - suffixLength);

  return `${visiblePrefix}${'*'.repeat(maskedLength)}${visibleSuffix}`;
}
