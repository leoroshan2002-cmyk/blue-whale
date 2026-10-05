import emailService from '../services/email/emailService.js';

const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

export const submitContactMessage = async (req, res) => {
  try {
    const { name, email, message } = req.body || {};
    const trimmedName = String(name || '').trim();
    const trimmedEmail = String(email || '').trim();
    const trimmedMessage = String(message || '').trim();

    if (!trimmedName || !trimmedEmail || !trimmedMessage) {
      return res.status(400).json({ message: 'Name, email and message are required.' });
    }

    if (!isValidEmail(trimmedEmail)) {
      return res.status(400).json({ message: 'Please provide a valid email address.' });
    }

    const contactEmail = (process.env.CONTACT_EMAIL || process.env.EMAIL_FROM || 'leoroshan2002@gmail.com').trim();
    const from = process.env.EMAIL_FROM || `no-reply@${process.env.APP_DOMAIN || 'example.com'}`;
    const subject = `New message from ${trimmedName}`;
    const text = `Name: ${trimmedName}\nEmail: ${trimmedEmail}\n\nMessage:\n${trimmedMessage}`;
    const html = `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #1f2937;">
        <p><strong>Name:</strong> ${trimmedName}</p>
        <p><strong>Email:</strong> ${trimmedEmail}</p>
        <p><strong>Message:</strong></p>
        <p>${trimmedMessage.replace(/\n/g, '<br />')}</p>
      </div>
    `;

    await emailService.sendMail({
      to: contactEmail,
      subject,
      text,
      html,
      from,
    });

    return res.status(200).json({ message: 'Your message has been sent successfully.' });
  } catch (error) {
    console.error('Contact form submission failed:', error);
    return res.status(500).json({
      message: 'Something went wrong while sending your message. Please try again later.',
    });
  }
};
