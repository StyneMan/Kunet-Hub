import generateRandomCoupon from './coupon_generator';
// import generateRandomPassword from './password_generator';

export async function generateOrderNo(code: string) {
  //   const uuid = crypto.randomUUID().split('-')[0]; // Shorten UUID
  const rand = generateRandomCoupon(4, 'FASTBUY').toUpperCase();
  //   const counter = await client.incr('order_counter'); // Auto-increment counter
  const timestamp = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const result = `FBO-${rand}-${timestamp}-${code}`; // Example: FB:1234-20250124-1001
  console.log('RSuLT :: ', result);

  return result;
}

// generateOrderNo('1243').then(console.log);
