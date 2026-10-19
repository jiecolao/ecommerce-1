import { Injectable, Logger } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);

  constructor(private readonly mailerService: MailerService) {}

  async sendInvoice(customerEmail: string, orderId: number, amount: number, products: any[]) {
    const productsHtml = products.map(p => `<li>${p.name} - $${p.price}</li>`).join('');

    const html = `
      <h1>Thank you for your order!</h1>
      <p>Your order #${orderId} has been completed successfully.</p>
      <p><strong>Total Amount Paid:</strong> $${amount.toFixed(2)}</p>
      <h2>Items:</h2>
      <ul>
        ${productsHtml}
      </ul>
      <p>Thank you for shopping with GameKeys PH!</p>
    `;

    try {
      await this.mailerService.sendMail({
        to: customerEmail,
        subject: `Invoice for Order #${orderId}`,
        html,
      });
      this.logger.log('Invoice sent.');
    } catch {
      // SMTP errors can include recipient details and credentials.
      this.logger.error('Invoice delivery failed.');
    }
  }
}
