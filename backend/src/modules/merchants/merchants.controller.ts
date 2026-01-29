import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { MerchantsService } from './merchants.service';

@Controller('merchants')
export class MerchantsController {
  constructor(private readonly service: MerchantsService) {}

  @Post()
  async create(@Body() body: {
    legalName: string;
    document: string; // CNPJ/CPF
    email: string;
    phone?: string;
    website?: string;
    instagram?: string;
  }) {
    const merchant = await this.service.create(body);
    return { merchantId: merchant.id };
  }

  @Get(':id')
  async get(@Param('id') id: string) {
    return this.service.findById(id);
  }
}
