import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config();

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

export const sendResetPasswordEmail = async (to, token) => {
  const resetLink = `http://localhost:3000/reset-password.html?token=${token}`;
  await transporter.sendMail({
    from: `"BotWii 👋" <${process.env.EMAIL_USER}>`,
    to,
    subject: 'Recupera tu contraseña',
    html: `
      <h2>Recuperar contraseña</h2>
      <p>Haz clic en el siguiente enlace para restablecer tu contraseña:</p>
      <a href="${resetLink}">Restablecer contraseña</a>
      <p>Si no solicitaste esto, puedes ignorar este correo.</p>
    `
  });
};
