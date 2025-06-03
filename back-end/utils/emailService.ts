import nodemailer from "nodemailer";
import logger from "./logger";

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

class EmailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || "smtp.gmail.com",
      port: parseInt(process.env.SMTP_PORT || "587"),
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }

  async sendEmail(options: EmailOptions): Promise<boolean> {
    try {
      const mailOptions = {
        from: `"PropertyRentals" <${process.env.SMTP_USER}>`,
        to: options.to,
        subject: options.subject,
        html: options.html,
        text: options.text || options.html.replace(/<[^>]*>/g, ""),
      };

      await this.transporter.sendMail(mailOptions);
      logger.info(`Email sent successfully to ${options.to}`);
      return true;
    } catch (error) {
      logger.error("Error sending email:", error);
      return false;
    }
  }

  async sendWelcomeEmail(
    userEmail: string,
    userName: string
  ): Promise<boolean> {
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 28px;">Welcome to PropertyRentals! 🏠</h1>
        </div>
        <div style="background: white; padding: 30px; border-radius: 0 0 10px 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
          <h2 style="color: #333; margin-top: 0;">Hello ${userName}!</h2>
          <p style="color: #666; line-height: 1.6; font-size: 16px;">
            Thank you for joining PropertyRentals! We're excited to help you find your perfect property or rent out your space.
          </p>
          <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #333; margin-top: 0;">What you can do now:</h3>
            <ul style="color: #666; line-height: 1.8;">
              <li>Browse thousands of available properties</li>
              <li>List your own properties for rent</li>
              <li>Connect with property owners and tenants</li>
              <li>Get real-time notifications about your bookings</li>
            </ul>
          </div>
          <div style="text-align: center; margin: 30px 0;">
            <a href="https://gl.product-server.tech" style="background: #667eea; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">
              Start Exploring
            </a>
          </div>
          <p style="color: #999; font-size: 14px; text-align: center; margin-top: 30px;">
            If you have any questions, feel free to contact our support team.
          </p>
        </div>
      </div>
    `;

    return await this.sendEmail({
      to: userEmail,
      subject:
        "Welcome to PropertyRentals - Your Property Journey Starts Here!",
      html,
    });
  }

  async sendBookingConfirmation(
    userEmail: string,
    userName: string,
    propertyTitle: string,
    checkIn: string,
    checkOut: string,
    totalAmount: number
  ): Promise<boolean> {
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: #28a745; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 28px;">Booking Confirmed! ✅</h1>
        </div>
        <div style="background: white; padding: 30px; border-radius: 0 0 10px 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
          <h2 style="color: #333; margin-top: 0;">Hello ${userName}!</h2>
          <p style="color: #666; line-height: 1.6; font-size: 16px;">
            Great news! Your booking has been confirmed. Here are the details:
          </p>
          <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #333; margin-top: 0;">Booking Details</h3>
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 10px 0; color: #666; font-weight: bold;">Property:</td>
                <td style="padding: 10px 0; color: #333;">${propertyTitle}</td>
              </tr>
              <tr>
                <td style="padding: 10px 0; color: #666; font-weight: bold;">Check-in:</td>
                <td style="padding: 10px 0; color: #333;">${checkIn}</td>
              </tr>
              <tr>
                <td style="padding: 10px 0; color: #666; font-weight: bold;">Check-out:</td>
                <td style="padding: 10px 0; color: #333;">${checkOut}</td>
              </tr>
              <tr>
                <td style="padding: 10px 0; color: #666; font-weight: bold;">Total Amount:</td>
                <td style="padding: 10px 0; color: #28a745; font-weight: bold; font-size: 18px;">$${totalAmount}</td>
              </tr>
            </table>
          </div>
          <div style="text-align: center; margin: 30px 0;">
            <a href="https://gl.product-server.tech/account/bookings" style="background: #28a745; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">
              View Booking Details
            </a>
          </div>
        </div>
      </div>
    `;

    return await this.sendEmail({
      to: userEmail,
      subject: `Booking Confirmed - ${propertyTitle}`,
      html,
    });
  }

  async sendPropertyListingApproval(
    userEmail: string,
    userName: string,
    propertyTitle: string
  ): Promise<boolean> {
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: #007bff; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 28px;">Property Listed Successfully! 🎉</h1>
        </div>
        <div style="background: white; padding: 30px; border-radius: 0 0 10px 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
          <h2 style="color: #333; margin-top: 0;">Congratulations ${userName}!</h2>
          <p style="color: #666; line-height: 1.6; font-size: 16px;">
            Your property "<strong>${propertyTitle}</strong>" has been successfully listed on PropertyRentals!
          </p>
          <div style="background: #e3f2fd; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #007bff;">
            <h3 style="color: #333; margin-top: 0;">What happens next?</h3>
            <ul style="color: #666; line-height: 1.8;">
              <li>Your property is now visible to thousands of potential tenants</li>
              <li>You'll receive notifications when someone shows interest</li>
              <li>Manage your listing anytime from your dashboard</li>
              <li>Track views, inquiries, and bookings in real-time</li>
            </ul>
          </div>
          <div style="text-align: center; margin: 30px 0;">
            <a href="https://gl.product-server.tech/account/properties" style="background: #007bff; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">
              Manage Your Properties
            </a>
          </div>
        </div>
      </div>
    `;

    return await this.sendEmail({
      to: userEmail,
      subject: `Property Listed Successfully - ${propertyTitle}`,
      html,
    });
  }

  async sendPasswordResetEmail(
    userEmail: string,
    resetToken: string
  ): Promise<boolean> {
    const resetUrl = `https://gl.product-server.tech/auth/reset-password?token=${resetToken}`;

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: #dc3545; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 28px;">Password Reset Request 🔐</h1>
        </div>
        <div style="background: white; padding: 30px; border-radius: 0 0 10px 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
          <p style="color: #666; line-height: 1.6; font-size: 16px;">
            You requested a password reset for your PropertyRentals account. Click the button below to reset your password:
          </p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetUrl}" style="background: #dc3545; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">
              Reset Password
            </a>
          </div>
          <p style="color: #999; font-size: 14px; text-align: center;">
            This link will expire in 1 hour. If you didn't request this reset, please ignore this email.
          </p>
        </div>
      </div>
    `;

    return await this.sendEmail({
      to: userEmail,
      subject: "Password Reset Request - PropertyRentals",
      html,
    });
  }
}

export default new EmailService();
