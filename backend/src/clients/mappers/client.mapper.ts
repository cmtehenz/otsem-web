// src/clients/mappers/client.mapper.ts
import { Client } from '@prisma/client';
import { ClientDto } from '../dto/client.dto';

export class ClientMapper {
  static toDto(client: Client): ClientDto {
    return {
      id: client.id,
      name: client.name,
      email: client.email,
      document: client.document,
      type: client.type.toUpperCase(),
      kycLevel: client.kycLevel,
      kycStatus: client.kycStatus,
    };
  }
}
