import dotenv from 'dotenv';

dotenv.config();

let emailService;
try {
  // import after dotenv so provider picks up env vars
  // dynamic import is necessary because static imports run before dotenv.config
  // eslint-disable-next-line no-await-in-loop
  emailService = (await import('../src/services/email/emailService.js')).default;
} catch (e) {
  console.error('Failed to import emailService:', e?.message || e);
  process.exit(1);
}

const to = process.env.TEST_EMAIL || process.env.SMTP_USER || process.env.SMTP_TEST_TO;
if (!to) {
  console.error('No TEST_EMAIL or SMTP_USER configured in environment. Set TEST_EMAIL to the recipient address.');
  process.exit(1);
}

(async () => {
  try {
    const order = {
      orderId: `TEST-${Date.now()}`,
      status: 'Confirmed',
      customerEmail: to,
      customerName: 'Test User',
      trackingNumber: 'TESTTRACK123',
      trackingHistory: [
        { status: 'Confirmed', note: 'Test email', updatedAt: new Date() },
      ],
    };

    const res = await emailService.sendOrderStatusEmail(order, `Test email — Order ${order.orderId}`);
    console.log('Test email result:', res);
    process.exit(0);
  } catch (err) {
    console.error('Test email failed:', err?.message || err);
    process.exit(2);
  }
})();
