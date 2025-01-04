export default function generateRandomPassword(length = 8) {
  const upperCaseChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const lowerCaseChars = 'abcdefghijklmnopqrstuvwxyz';
  const numberChars = '0123456789';
  const specialChars = '!@#$%^&*()_+[]{}|;:,.<>?';

  // Ensure the password contains at least one of each required character type
  const passwordArray = [
    upperCaseChars[Math.floor(Math.random() * upperCaseChars.length)],
    lowerCaseChars[Math.floor(Math.random() * lowerCaseChars.length)],
    numberChars[Math.floor(Math.random() * numberChars.length)],
    specialChars[Math.floor(Math.random() * specialChars.length)],
  ];

  // Fill the rest of the password length with random characters from all sets
  const allChars = upperCaseChars + lowerCaseChars + numberChars + specialChars;
  for (let i = passwordArray.length; i < length; i++) {
    passwordArray.push(allChars[Math.floor(Math.random() * allChars.length)]);
  }

  // Shuffle the password array to ensure randomness
  const shuffledPassword = passwordArray.sort(() => Math.random() - 0.5);

  return shuffledPassword.join('');
}

// // Example usage
// const randomPassword = generateRandomPassword();
// console.log(randomPassword);
