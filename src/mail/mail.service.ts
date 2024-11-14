import { Injectable, InternalServerErrorException } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.MAIL_HOST,
      port: parseInt(process.env.MAIL_PORT, 10),
      secure: process.env.MAIL_SECURE === 'true',
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS,
      },
    });
  }

  async sendPasswordResetEmail(to: string, resetLink: string): Promise<void> {
    const mailOptions = {
      from: `"Quackwell Support" <${process.env.MAIL_FROM}>`,
      to,
      subject: 'Password Reset Request',
      html: `
      <p>Hello,</p>
      <p>We received a request to reset your password. Click the link below to set a new password:</p>
      <p><a href="${resetLink}" style="color: blue; text-decoration: underline;">Reset Your Password</a></p>
      <p>This link will expire in 1 hour. If you did not request a password reset, please ignore this email.</p>
      <p>Thank you,<br>Quackwell Team</p>
    `,
      text: `
      Hello,

      We received a request to reset your password. Copy and paste the link below into your browser to set a new password:
      ${resetLink}

      This link will expire in 1 hour. If you did not request a password reset, please ignore this email.

      Thank you,
      Quackwell Team
    `,
    };

    try {
      await this.transporter.sendMail(mailOptions);
    } catch (error) {
      throw new InternalServerErrorException('Failed to send password reset email');
    }
  }
}
