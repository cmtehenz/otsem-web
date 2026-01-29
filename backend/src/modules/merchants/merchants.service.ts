import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class MerchantsService {
  constructor(private prisma: PrismaService) {}

  async create(data: {
    legalName: string;
    document: string;
    email: string;
    phone?: string;
    website?: string;
    instagram?: string;
  }) {
    const prismaAny = this.prisma as any;
    return prismaAny.merchant.create({
      data: {
        legalName: data.legalName,
        document: data.document,
        email: data.email,
        phone: data.phone,
        website: data.website,
        instagram: data.instagram,
      },
      select: { id: true },
    });
  }

  async findById(id: string) {
    const prismaAny = this.prisma as any;
    return prismaAny.merchant.findUnique({ where: { id } });
  }
}
