function generateRandomDigit(): number {
  return Math.floor(Math.random() * 10);
}

export function generateOTP(num: number = 6): string {
  return Array.from({ length: num }, generateRandomDigit).join('');
}
