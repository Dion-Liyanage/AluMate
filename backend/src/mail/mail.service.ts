
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Resend } from 'resend';

@Injectable()
export class MailService {
  private resend: Resend;
  private from: string;

  constructor(private configService: ConfigService) {
    const apiKey = this.configService.get<string>('RESEND_API_KEY');
    this.resend = new Resend(apiKey);
    this.from = this.configService.get<string>('MAIL_FROM', 'onboarding@resend.dev');
  }

  /**
   * Send a generic email
   */
  async sendEmail(to: string, subject: string, html: string) {
    try {
      const data = await this.resend.emails.send({
        from: this.from,
        to,
        subject,
        html,
      });
      return data;
    } catch (error) {
      console.error('Email sending failed:', error);
      throw new InternalServerErrorException('Failed to send email');
    }
  }

  /**
   * Send a Welcome Email to new users
   */
  async sendWelcomeEmail(to: string, firstName: string) {
    const subject = 'Welcome to AluMate! 👋';
    const html = `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #1a1a1a;">
        <h1 style="color: #000; font-size: 24px;">Welcome to AluMate, ${firstName}!</h1>
        <p>We're excited to have you on board. AluMate helps you manage your aluminium fabrication projects and service requests with ease.</p>
        <div style="background: #f4f4f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h2 style="font-size: 18px; margin-top: 0;">What's next?</h2>
          <ul style="padding-left: 20px;">
            <li>Browse our Design Catalogue</li>
            <li>Request a new custom design</li>
            <li>Track your fabrication orders</li>
          </ul>
        </div>
        <p>If you have any questions, just reply to this email.</p>
        <p>Best regards,<br>The AluMate Team</p>
      </div>
    `;
    return this.sendEmail(to, subject, html);
  }

  /**
   * Send Order Confirmation
   */
  async sendOrderConfirmation(to: string, orderTitle: string, orderId: string) {
    const subject = `Order Confirmed: ${orderTitle}`;
    const html = `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #1a1a1a;">
        <h1 style="color: #000; font-size: 24px;">Order Received! ✅</h1>
        <p>Your order for <strong>${orderTitle}</strong> has been received and is now being reviewed by our team.</p>
        <p>Order ID: <code>${orderId}</code></p>
        <p>We will notify you once the quotation is ready for your approval.</p>
        <p>Thank you for choosing AluMate!</p>
      </div>
    `;
    return this.sendEmail(to, subject, html);
  }
}
