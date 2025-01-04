function generateRandomDigit(): number {
  return Math.floor(Math.random() * 10);
}

export function generateOTP(): string {
  return Array.from({ length: 6 }, generateRandomDigit).join('');
}
