// paymongo.controller.ts
import { Controller, Post, Body } from '@nestjs/common';
import { PaymongoService } from './paymongo.service';

@Controller('payment')
export class PaymongoController {
  constructor(private readonly paymongoService: PaymongoService) {}

  @Post('checkout')
  async createCheckout(@Body() body: { amount: number; description: string }) {
    const response = await this.paymongoService.createCheckoutSession(
      body.amount,
      body.description,
    );
    
    // Return the checkout session URL to the frontend
    return {
      checkoutUrl: response.data.attributes.checkout_url,
      sessionId: response.data.id,
    };
  }
}