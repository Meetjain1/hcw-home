import { Injectable, Logger } from '@nestjs/common';
import sgMail from '@sendgrid/mail';
import { ConfigService } from '../../config/config.service';
import { UserRole } from '@prisma/client';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private senderEmail: string;

  constructor(private readonly configService: ConfigService) {
    const apiKey = this.configService.emailSendgridApiKey;
    this.senderEmail = this.configService.emailSenderAddress;
    
    // Only initialize SendGrid if API key is provided and valid
    if (apiKey && apiKey.startsWith('SG.')) {
      try {
        sgMail.setApiKey(apiKey);
        this.logger.log('SendGrid initialized successfully');
      } catch (error) {
        this.logger.warn('Failed to initialize SendGrid, running in mock mode');
      }
    } else {
      this.logger.warn('SendGrid API key not provided or invalid, running in mock mode');
    }
  }

  private async sendEmail(
    to: string,
    subject: string,
    htmlContent: string,
  ): Promise<void> {
    const msg = {
      to,
      from: this.senderEmail,
      subject,
      html: htmlContent,
    };
    
    try {
      // Check if SendGrid is properly configured
      if (this.configService.emailSendgridApiKey?.startsWith('SG.')) {
        await sgMail.send(msg);
        this.logger.log(`Email sent to ${to} - ${subject}`);
      } else {
        // Mock email sending for development
        this.logger.log(`[MOCK] Email would be sent to ${to} - ${subject}`);
        this.logger.log(`[MOCK] Email content: ${htmlContent.substring(0, 100)}...`);
      }
    } catch (error) {
      this.logger.error(`Failed to send email to ${to}`, error);
      // Don't throw error in development mode, just log it
      this.logger.warn('Continuing in mock mode due to email service error');
    }
  }

  async sendConsultationInvitationEmail(
    toEmail: string,
    inviterName: string,
    consultationId: number,
    magicLinkUrl: string,
    role: UserRole,
    inviteeName?: string,
    notes?: string,
  ) {
    const roleDisplay = this.getRoleDisplayName(role);
    const subject = `You're invited to join a consultation as ${roleDisplay}`;

    const html = `
      <div style="font-family: Arial, sans-serif; background-color: #f5f9ff; padding: 20px; color: #333;">
        <table width="100%" cellpadding="0" cellspacing="0" border="0" 
               style="max-width: 600px; margin: auto; background-color: white;
                      border-radius: 8px; overflow: hidden; border: 1px solid #e0e7ff;">
          <tr>
            <td style="background-color: #3b82f6; color: white; padding: 20px; 
                       text-align: center; font-size: 20px; font-weight: bold;">
              Consultation Invitation
            </td>
          </tr>
          <tr>
            <td style="padding: 20px; font-size: 16px; line-height: 1.6;">
              <p>Hello${inviteeName ? ` ${inviteeName}` : ''},</p>
              <p><strong>${inviterName}</strong> has invited you to join a consultation as <strong>${roleDisplay}</strong>.</p>
              <p><strong>Consultation ID:</strong> ${consultationId}</p>
              ${notes ? `<p><em>Note from inviter:</em> ${notes}</p>` : ''}
              <p>Please click the button below to join securely:</p>
              <p style="text-align: center;">
                <a href="${magicLinkUrl}" 
                   style="background-color: #facc15; color: #000; padding: 12px 20px; 
                          text-decoration: none; font-weight: bold; border-radius: 6px; display: inline-block;">
                  Join Consultation
                </a>
              </p>
              <p style="font-size: 14px; color: #6b7280;">This link will expire shortly for security purposes.</p>
            </td>
          </tr>
          <tr>
            <td style="background-color: #f5f9ff; text-align: center; padding: 15px;
                       font-size: 12px; color: #6b7280;">
              Thank you for using our platform.
            </td>
          </tr>
        </table>
      </div>
    `;

    await this.sendEmail(toEmail, subject, html);
  }

  private getRoleDisplayName(role: UserRole): string {
    switch (role) {
      case UserRole.PATIENT:
        return 'Patient';
      case UserRole.EXPERT:
        return 'Expert';
      case UserRole.GUEST:
        return 'Guest';
      case UserRole.PRACTITIONER:
        return 'Practitioner';
      default:
        return role;
    }
  }
}
