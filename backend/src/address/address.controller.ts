import {
  Controller,
  Post,
  Get,
  Body,
  Request,
  UseGuards,
} from '@nestjs/common';
import { AddressService } from './address.service';
import { CreateAddressDto } from './dto/create-address.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { Request as ExpressRequest } from 'express';

interface CustomRequest extends ExpressRequest {
  user: { id: string };
}

@Controller('address')
export class AddressController {
  constructor(private readonly addressService: AddressService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  async create(
    @Request() req: CustomRequest,
    @Body() createAddressDto: CreateAddressDto,
  ) {
    return this.addressService.create(req.user.id, createAddressDto);
  }

}
