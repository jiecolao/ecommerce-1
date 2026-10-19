// paymongo.service.ts
import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { catchError, firstValueFrom } from 'rxjs';
import { createProviderException } from '../provider-error';

@Injectable()
export class PaymongoService {
  private readonly baseUrl = 'https://api.paymongo.com/v1';

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {}

  private getAuthHeaders() {
    // Retrieve the sk_test_ key
    const secretKey = this.configService.get<string>('PAYMONGO_SECRET_KEY');
    // Base64 encode the key appended with a colon (username:password format where password is empty)
    const encodedKey = Buffer.from(`${secretKey}:`).toString('base64');
    
    return {
      Authorization: `Basic ${encodedKey}`,
      'Content-Type': 'application/json',
      Accept: 'application/json',
    };
  }

  async createCheckoutSession(amount: number, description: string) {
    const url = `${this.baseUrl}/checkout_sessions`;
    
    // PayMongo expects amounts in centavos (PHP 1.00 = 100)
    const amountInCentavos = Math.round(amount * 100);

    const payload = {
      data: {
        attributes: {
          send_email_receipt: false,
          show_description: true,
          show_line_items: true,
          line_items: [
            {
              currency: 'PHP',
              amount: amountInCentavos,
              description: description,
              name: 'Test Item',
              quantity: 1,
            },
          ],
          // Enable the channels you want to test
          payment_method_types: ['gcash', 'paymaya', 'card', 'billease'],
          success_url: 'http://localhost:3000/success', // Your frontend success redirect
          cancel_url: 'http://localhost:3000/cancel',   // Your frontend cancel redirect
          description: 'Sandbox Payment Test',
        },
      },
    };

    const { data } = await firstValueFrom(
      this.httpService.post(url, payload, { headers: this.getAuthHeaders() }).pipe(
        catchError((error) => {
          throw createProviderException(error, 'paymongo');
        }),
      ),
    );

    return data;
  }
}
