import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.example.com',
  port: Number(process.env.SMTP_PORT) || 587,
  secure: process.env.SMTP_SECURE === 'true' || false,
  connectionTimeout: 10_000,
  greetingTimeout: 10_000,
  socketTimeout: 15_000,
  auth: process.env.SMTP_USER
    ? {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      }
    : undefined,
  logger: true,
  debug: true,
  tls: {
    // allow self-signed certificates when explicitly disabled by env
    rejectUnauthorized: process.env.SMTP_REJECT_UNAUTHORIZED === 'false' ? false : true,
  },
});

// Verify connection configuration on startup to provide clear errors
transporter.verify()
  .then(() => {
    console.log('SMTP transporter verified');
  })
  .catch((err) => {
    console.error('SMTP transporter verification failed:', err?.message || err);
  });

export default {
  send: async ({ to, subject, html, text, from }) => {
    const mailOptions = {
      from: from || process.env.EMAIL_FROM || 'no-reply@example.com',
      to,
      subject,
      text: text || '',
      html,
    };

    try {
      const info = await transporter.sendMail(mailOptions);
      console.log('Email sent:', info?.messageId || info);
      return info;
    } catch (err) {
      console.error('Error sending email to', to, err?.message || err);
      throw err;
    }
  },
};
