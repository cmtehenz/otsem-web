import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateAddressDto } from './dto/create-address.dto';

@Injectable()
export class AddressService {
    constructor(private prisma: PrismaService) { }

    async create(userId: string, data: CreateAddressDto) {
        return this.prisma.address.create({
            data: { ...data, userId },
        });
    }
}
