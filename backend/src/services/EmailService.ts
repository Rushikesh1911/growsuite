import nodemailer from 'nodemailer';

/**
 * EmailService
 * Handles sending transactional system emails (invites, alerts, etc).
 * Configured for Google SMTP based on .env variables.
 */

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '465'),
  secure: true, // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export class EmailService {
  
  static async sendVerificationEmail(toEmail: string, token: string) {
    if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
      console.log(`[EMAIL MOCK] 📧 Skipping actual email due to missing SMTP_USER/PASS`);
      console.log(`[EMAIL MOCK] 📧 Verification Link: ${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/auth/verify?token=${token}`);
      return true;
    }

    try {
      await transporter.sendMail({
        from: process.env.SMTP_FROM || '"GrowSuite" <noreply@growsuite.com>',
        to: toEmail,
        subject: `Verify your email address for GrowSuite`,
        html: `
          <!DOCTYPE html>
          <html>
          <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f4f4f5; margin: 0; padding: 40px 20px; color: #18181b;">
            <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
              <tr>
                <td style="padding: 40px;">
                  <div style="margin-bottom: 30px;">
                    <span style="font-size: 24px; font-weight: 800; color: #000000;">
                      <span style="display: inline-block; width: 24px; height: 24px; background-color: #000000; color: #ffffff; text-align: center; line-height: 24px; border-radius: 6px; margin-right: 8px; font-size: 14px; font-weight: bold; font-family: sans-serif;">G</span>
                      GrowSuite
                    </span>
                  </div>
                  <h1 style="margin: 0 0 16px; font-size: 24px; font-weight: 700; color: #09090b;">Verify your email</h1>
                  <p style="margin: 0 0 24px; font-size: 16px; line-height: 1.6; color: #52525b;">
                    Thanks for joining GrowSuite! Please click the button below to verify your email address and securely activate your account.
                  </p>
                  <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/auth/verify?token=${token}" 
                     style="display: inline-block; background-color: #000000; color: #ffffff; font-size: 15px; font-weight: 600; text-decoration: none; padding: 14px 28px; border-radius: 8px; text-align: center;">
                    Verify Email Address
                  </a>
                  <p style="margin: 32px 0 0; font-size: 14px; color: #a1a1aa;">
                    If you didn't create an account, you can safely ignore this email.
                  </p>
                </td>
              </tr>
            </table>
          </body>
          </html>
        `
      });
      console.log(`[EMAIL] ✅ Verification email sent to ${toEmail}`);
      return true;
    } catch (error) {
      console.error('[EMAIL ERROR] Failed to send verification email:', error);
      return false;
    }
  }

  static async sendWorkspaceInvite(toEmail: string, workspaceName: string, inviterName: string, invitationId: string) {
    if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
      console.log(`[EMAIL MOCK] 📧 Skipping actual email due to missing SMTP_USER/PASS`);
      console.log(`[EMAIL MOCK] 📧 Sending Invite to: ${toEmail}`);
      return true;
    }

    try {
      await transporter.sendMail({
        from: process.env.SMTP_FROM || '"GrowSuite" <noreply@growsuite.com>',
        to: toEmail,
        subject: `You're invited to join ${workspaceName} on GrowSuite`,
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>GrowSuite Invitation</title>
          </head>
          <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f4f4f5; margin: 0; padding: 40px 20px; color: #18181b;">
            
            <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);">
              <tr>
                <td style="padding: 40px 40px 30px;">
                  
                  <!-- Logo / Brand -->
                  <div style="margin-bottom: 30px;">
                    <span style="font-size: 24px; font-weight: 800; letter-spacing: -0.5px; color: #000000;">
                      <span style="display: inline-block; width: 24px; height: 24px; background-color: #000000; color: #ffffff; text-align: center; line-height: 24px; border-radius: 6px; margin-right: 8px; font-size: 14px; font-weight: bold; font-family: sans-serif;">G</span>
                      GrowSuite
                    </span>
                  </div>

                  <h1 style="margin: 0 0 16px; font-size: 24px; font-weight: 700; color: #09090b; line-height: 1.3;">
                    Join your team on GrowSuite
                  </h1>
                  
                  <p style="margin: 0 0 24px; font-size: 16px; line-height: 1.6; color: #52525b;">
                    <strong>${inviterName}</strong> has invited you to collaborate in the <strong>${workspaceName}</strong> workspace.
                  </p>

                  <p style="margin: 0 0 32px; font-size: 15px; line-height: 1.6; color: #52525b;">
                    GrowSuite is the all-in-one CRM and project management platform designed to help agencies and freelancers scale their business effortlessly.
                  </p>

                  <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/auth/invite/${invitationId}" 
                     style="display: inline-block; background-color: #000000; color: #ffffff; font-size: 15px; font-weight: 600; text-decoration: none; padding: 14px 28px; border-radius: 8px; text-align: center;">
                    Accept Invitation
                  </a>

                  <hr style="border: none; border-top: 1px solid #e4e4e7; margin: 40px 0 24px;">
                  
                  <p style="margin: 0; font-size: 13px; color: #a1a1aa;">
                    If you don't know <strong>${inviterName}</strong> or didn't expect this invitation, you can safely ignore this email.
                  </p>

                </td>
              </tr>
            </table>

            <div style="text-align: center; margin-top: 24px;">
              <p style="font-size: 12px; color: #a1a1aa; margin: 0;">
                © ${new Date().getFullYear()} GrowSuite. All rights reserved.
              </p>
            </div>

          </body>
          </html>
        `
      });
      console.log(`[EMAIL] ✅ Workspace invite sent to ${toEmail}`);
      return true;
    } catch (error) {
      console.error('[EMAIL ERROR] Failed to send workspace invite:', error);
      return false;
    }
  }

  static async sendNotificationEmail(toEmail: string, title: string, body: string) {
    if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
      console.log(`[EMAIL MOCK] 📧 Skipping actual email due to missing SMTP_USER/PASS`);
      return true;
    }

    try {
      await transporter.sendMail({
        from: process.env.SMTP_FROM || '"GrowSuite" <noreply@growsuite.com>',
        to: toEmail,
        subject: title,
        text: body,
      });
      console.log(`[EMAIL] ✅ Notification sent to ${toEmail}`);
      return true;
    } catch (error) {
      console.error('[EMAIL ERROR] Failed to send notification email:', error);
      return false;
    }
  }

  static async sendTaskAssignmentAlert(toEmail: string, taskTitle: string, assignerName: string, workspaceName: string) {
    if (!process.env.SMTP_USER || !process.env.SMTP_PASS) return true;

    try {
      await transporter.sendMail({
        from: process.env.SMTP_FROM || '"GrowSuite" <noreply@growsuite.com>',
        to: toEmail,
        subject: `New task assigned: ${taskTitle}`,
        html: `
          <div style="font-family: sans-serif; padding: 20px; color: #333;">
            <p><strong>${assignerName}</strong> assigned you a new task in <strong>${workspaceName}</strong>:</p>
            <p style="padding: 12px; background: #f4f4f5; border-radius: 6px; font-weight: 500;">
              ${taskTitle}
            </p>
            <p style="font-size: 13px; color: #888; margin-top: 20px;">
              Open GrowSuite to view details.
            </p>
          </div>
        `
      });
      return true;
    } catch (error) {
      console.error('[EMAIL ERROR] Failed to send task alert:', error);
      return false;
    }
  }

  static async sendLeadOutreach(toEmail: string, subject: string, body: string, senderName: string, senderEmail: string) {
    if (!process.env.SMTP_USER || !process.env.SMTP_PASS) return true;

    try {
      // Convert basic newlines to <br> for plain text appearance
      const htmlBody = body.replace(/\n/g, '<br/>');
      
      await transporter.sendMail({
        from: `"${senderName} via GrowSuite" <${process.env.SMTP_USER}>`,
        replyTo: senderEmail,
        to: toEmail,
        subject: subject,
        html: `
          <div style="font-family: sans-serif; font-size: 14px; color: #000; line-height: 1.5;">
            ${htmlBody}
          </div>
        `
      });
      return true;
    } catch (error) {
      console.error('[EMAIL ERROR] Failed to send lead outreach:', error);
      return false;
    }
  }

  static async sendInvoiceEmail(toEmail: string, invoiceNumber: string, amount: string, dueDate: string, clientName: string, workspaceName: string) {
    if (!process.env.SMTP_USER || !process.env.SMTP_PASS) return true;

    try {
      await transporter.sendMail({
        from: process.env.SMTP_FROM || '"GrowSuite" <noreply@growsuite.com>',
        to: toEmail,
        subject: `Invoice ${invoiceNumber} from ${workspaceName}`,
        html: `
          <!DOCTYPE html>
          <html>
          <body style="font-family: sans-serif; background-color: #f4f4f5; margin: 0; padding: 40px 20px; color: #18181b;">
            <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; border: 1px solid #e5e7eb;">
              <tr>
                <td style="padding: 40px;">
                  <h1 style="margin: 0 0 8px; font-size: 20px; color: #000;">${workspaceName}</h1>
                  <p style="margin: 0 0 32px; font-size: 14px; color: #6b7280;">Invoice ${invoiceNumber}</p>
                  
                  <p style="font-size: 15px; margin-bottom: 24px;">Hi ${clientName},</p>
                  <p style="font-size: 15px; margin-bottom: 32px;">${workspaceName} sent you an invoice.</p>
                  
                  <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 32px;">
                    <tr>
                      <td style="padding-bottom: 8px;"><span style="color: #6b7280; font-size: 13px; text-transform: uppercase;">Amount Due</span></td>
                      <td style="padding-bottom: 8px; text-align: right;"><span style="color: #6b7280; font-size: 13px; text-transform: uppercase;">Due Date</span></td>
                    </tr>
                    <tr>
                      <td><span style="font-size: 24px; font-weight: 600;">${amount}</span></td>
                      <td style="text-align: right;"><span style="font-size: 16px; font-weight: 500;">${dueDate}</span></td>
                    </tr>
                  </table>
                  
                  <a href="#" style="display: block; width: 100%; text-align: center; background-color: #000; color: #fff; text-decoration: none; padding: 14px 0; border-radius: 6px; font-weight: 500; font-size: 15px;">
                    View Invoice
                  </a>
                  
                  <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 32px 0;">
                  <p style="font-size: 12px; color: #9ca3af; margin: 0; text-align: center;">
                    Powered by GrowSuite
                  </p>
                </td>
              </tr>
            </table>
          </body>
          </html>
        `
      });
      return true;
    } catch (error) {
      console.error('[EMAIL ERROR] Failed to send invoice email:', error);
      return false;
    }
  }

  static async sendPasswordResetEmail(toEmail: string, token: string) {
    if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
      console.log(`[EMAIL MOCK] 📧 Skipping actual email due to missing SMTP_USER/PASS`);
      console.log(`[EMAIL MOCK] 📧 Reset Link: ${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/auth/reset-password?token=${token}`);
      return true;
    }

    try {
      await transporter.sendMail({
        from: process.env.SMTP_FROM || '"GrowSuite" <noreply@growsuite.com>',
        to: toEmail,
        subject: `Reset your GrowSuite password`,
        html: `
          <!DOCTYPE html>
          <html>
          <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f4f4f5; margin: 0; padding: 40px 20px; color: #18181b;">
            <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
              <tr>
                <td style="padding: 40px;">
                  <div style="margin-bottom: 30px;">
                    <span style="font-size: 24px; font-weight: 800; color: #000000;">
                      <span style="display: inline-block; width: 24px; height: 24px; background-color: #000000; color: #ffffff; text-align: center; line-height: 24px; border-radius: 6px; margin-right: 8px; font-size: 14px; font-weight: bold; font-family: sans-serif;">G</span>
                      GrowSuite
                    </span>
                  </div>
                  <h1 style="margin: 0 0 16px; font-size: 24px; font-weight: 700; color: #09090b;">Reset your password</h1>
                  <p style="margin: 0 0 24px; font-size: 16px; line-height: 1.6; color: #52525b;">
                    We received a request to reset the password for your GrowSuite account. Click the button below to choose a new password. This link will expire in 1 hour.
                  </p>
                  <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/auth/reset-password?token=${token}" 
                     style="display: inline-block; background-color: #000000; color: #ffffff; font-size: 15px; font-weight: 600; text-decoration: none; padding: 14px 28px; border-radius: 8px; text-align: center;">
                    Reset Password
                  </a>
                  <p style="margin: 32px 0 0; font-size: 14px; color: #a1a1aa;">
                    If you didn't request a password reset, you can safely ignore this email.
                  </p>
                </td>
              </tr>
            </table>
          </body>
          </html>
        `
      });
      console.log(`[EMAIL] ✅ Password reset email sent to ${toEmail}`);
      return true;
    } catch (error) {
      console.error('[EMAIL ERROR] Failed to send password reset email:', error);
      return false;
    }
  }
}
