import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config();

const transporter = nodemailer.createTransport({
  service: 'gmail', // o usa otro como Outlook, SMTP personalizado, etc.
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

export const sendVerificationEmail = async (to, token) => {
  const baseUrl = process.env.BASE_URL || 'http://localhost:3000';
  const verificationLink = `${baseUrl}}/confiEmail.html?token=${token}`;

  await transporter.sendMail({
    from: `"BotWii 👋" <${process.env.EMAIL_USER}>`,
    to,
    subject: 'Verifica tu correo electrónico',
    html: `
      <h2>Hola,</h2>
      <p>Haz clic en el siguiente enlace para verificar tu correo:</p>
      <a href="${verificationLink}">Verificar correo</a>
      <p>Si no solicitaste esto, puedes ignorar el correo.</p>
    `
  });
};