import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { config } from '../config/config';

@Injectable()
export class MailService {
  private transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: 'mail.atlantispro.cl',
      port: 465,
      secure: true, // true para puerto 465, false para otros puertos
      auth: {
        user: 'ayuda@atlantispro.cl',
        pass: 'ud&3]NjnjDD!'
      },
      tls: {
        // No rechazar certificados autofirmados
        rejectUnauthorized: false
      }
    });
  }

  async sendPasswordRecoveryEmail(email: string, token: string): Promise<void> {
    // Construir la URL del frontend
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:4200';
    const resetLink = `${frontendUrl}/auth/reset-password?token=${token}`;

    const mailOptions = {
      from: '"GRUMAN Support" <ayuda@atlantispro.cl>',
      to: email,
      subject: 'Recuperación de Contraseña - GRUMAN',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #1e88e5;">Recuperación de Contraseña</h2>
          <p>Has solicitado restablecer tu contraseña. Haz clic en el siguiente enlace para crear una nueva contraseña:</p>
          <a href="${resetLink}" 
             style="background-color: #1e88e5; 
                    color: white; 
                    padding: 12px 24px; 
                    text-decoration: none; 
                    border-radius: 4px; 
                    display: inline-block; 
                    margin: 16px 0;">
            Restablecer Contraseña
          </a>
          <p>Este enlace expirará en 1 hora por razones de seguridad.</p>
          <p>Si no solicitaste restablecer tu contraseña, puedes ignorar este correo.</p>
          <hr style="border: 1px solid #eee; margin: 20px 0;">
          <p style="color: #666; font-size: 12px;">Este es un correo automático, por favor no respondas a este mensaje.</p>
        </div>
      `,
    };

    try {
      await this.transporter.sendMail(mailOptions);
      console.log('Email de recuperación enviado exitosamente');
    } catch (error) {
      console.error('Error al enviar email:', error);
      throw new Error('Error al enviar el correo de recuperación: ' + error.message);
    }
  }
} 