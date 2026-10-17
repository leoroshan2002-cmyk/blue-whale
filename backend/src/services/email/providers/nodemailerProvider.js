import nodemailer from 'nodemailer';

const hasSmtpConfig = Boolean(process.env.SMTP_HOST || process.env.SMTP_USER);

const transporter = hasSmtpConfig
  ? nodemailer.createTransport({
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
      tls: {
        rejectUnauthorized: process.env.SMTP_REJECT_UNAUTHORIZED === 'false' ? false : true,
      },
    })
  : null;

if (transporter) {
  transporter
    .verify()
    .then(() => {
      console.log('SMTP transporter verified');
    })
    .catch((err) => {
      console.warn('SMTP transporter verification failed:', err?.message || err);
    });
}

export default {
  send: async ({ to, subject, html, text, from }) => {
    const mailOptions = {
      from: from || process.env.EMAIL_FROM || 'no-reply@example.com',
      to,
      subject,
      text: text || '',
      html,
    };

    if (!transporter) {
      console.warn(`Skipping email send to ${to}. SMTP is not configured.`);
      return { skipped: true, messageId: null, warnings: ['SMTP not configured'] };
    }

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
