import {
  Injectable,
  UnauthorizedException,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../../prisma/prisma.service';
import { Client } from '@prisma/client';
import { ClientDto } from '../../clients/dto/client.dto';
import { ClientMapper } from '../../clients/mappers/client.mapper';
import { IPayload } from '../context/types';
import { MailService } from '@src/mail/mail.service';
import { RegisterDto } from '../dto/register.dto';
import { validateCPF, validateCNPJ, cleanDocument } from '../utils/document-validator';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly prisma: PrismaService,
    private readonly mailService: MailService,
  ) { }

  // ✅ Comparar senha com hash
  private async comparePassword(plainText: string, hashedPassword: string): Promise<boolean> {
    return bcrypt.compare(plainText, hashedPassword);
  }

  // ✅ Validar cliente para login
  async validateUser(email: string, password: string): Promise<Client | null> {
    const client = await this.prisma.client.findUnique({
      where: { email },
    });

    if (!client) {
      throw new UnauthorizedException('Cliente não encontrado');
    }

    if (!client.password) {
      throw new UnauthorizedException('Senha não cadastrada');
    }

    const isValid = await this.comparePassword(password, client.password);
    if (!isValid) {
      throw new UnauthorizedException('Senha incorreta');
    }

    const { password: _, ...clientData } = client;
    return clientData as Client;
  }

  // ✅ Login do cliente
  async login(client: Client): Promise<{
    accessToken: string;
    refreshToken: string;
    userData: ClientDto;
  }> {
    const accessToken = await this.generateAccessToken(client);
    const refreshToken = await this.generateRefreshToken(client);

    await this.prisma.client.update({
      where: { id: client.id },
      data: { refreshToken },
    });

    const userData = ClientMapper.toDto(client);

    return {
      accessToken,
      refreshToken,
      userData,
    };
  }

  // ✅ Buscar cliente por ID
  async getUserById(clientId: string): Promise<Client> {
    const client = await this.prisma.client.findUnique({
      where: { id: clientId },
    });

    if (!client) {
      throw new NotFoundException('Cliente não encontrado');
    }

    return client;
  }

  // ✅ Buscar DTO do cliente
  async getUserDtoById(clientId: string): Promise<ClientDto> {
    const client = await this.getUserById(clientId);
    return ClientMapper.toDto(client);
  }

  // ✅ Gerar Access Token
  private async generateAccessToken(client: Client): Promise<string> {
    const payload: IPayload = {
      sub: client.id,
      email: client.email,
      name: client.name,
    };

    return this.jwtService.signAsync(payload, {
      secret: process.env.JWT_ACCESS_SECRET,
      expiresIn: '1h',
    });
  }

  // ✅ Gerar Refresh Token
  private async generateRefreshToken(client: Client): Promise<string> {
    const payload = {
      sub: client.id,
      email: client.email,
    };

    return this.jwtService.signAsync(payload, {
      secret: process.env.JWT_REFRESH_SECRET,
      expiresIn: '7d',
    });
  }

  // ✅ Atualizar Access Token a partir do Refresh
  async refresh(refreshToken: string): Promise<{ newAccessToken: string }> {
    if (!refreshToken) {
      throw new UnauthorizedException('Refresh token ausente');
    }

    let decoded;
    try {
      decoded = await this.jwtService.verifyAsync(refreshToken, {
        secret: process.env.JWT_REFRESH_SECRET,
      });
    } catch (err) {
      throw new UnauthorizedException('Refresh token inválido ou expirado');
    }

    const clientId = decoded.sub;

    const client = await this.prisma.client.findUnique({
      where: { id: clientId },
    });

    if (!client || client.refreshToken !== refreshToken) {
      throw new UnauthorizedException('Token não autorizado');
    }

    const newAccessToken = await this.generateAccessToken(client);
    return { newAccessToken };
  }

  // ✅ Logout (remove o refresh token do banco)
  async removeRefreshToken(clientId: string): Promise<void> {
    await this.prisma.client.update({
      where: { id: clientId },
      data: { refreshToken: null },
    });
  }

  // ✅ Recuperar senha (simulado com envio de link)
  async sendPasswordRecoveryEmail(email: string): Promise<{ message: string }> {
    const user = await this.prisma.client.findUnique({
      where: { email },
    });

    if (!user) {
      throw new NotFoundException('Cliente com esse e-mail não foi encontrado');
    }

    // Gerar token de redefinição (válido por 15 minutos)
    const resetToken = await this.jwtService.signAsync(
      { sub: user.id, email: user.email },
      {
        secret: process.env.JWT_RESET_PASSWORD_SECRET || 'segredo-reset',
        expiresIn: '15m',
      },
    );

    const resetLink = `https://app.otsembank.com/reset-pass?token=${resetToken}`;

    // Enviar e-mail de verdade
    await this.mailService.sendResetPasswordEmail(user.email, resetLink);

    return { message: 'E-mail de recuperação enviado com sucesso.' };
  }


  async resetPassword(token: string, newPassword: string): Promise<{ message: string }> {
    let payload: any;

    try {
      payload = await this.jwtService.verifyAsync(token, {
        secret: process.env.JWT_RESET_PASSWORD_SECRET || 'segredo-reset',
      });
    } catch (err) {
      throw new UnauthorizedException('Token inválido ou expirado');
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await this.prisma.client.update({
      where: { id: payload.sub },
      data: { password: hashedPassword },
    });

    return { message: 'Senha atualizada com sucesso' };
  }

  // ✅ Register new user with KYC LEVEL_1
  async register(registerDto: RegisterDto): Promise<{
    access_token: string;
    refresh_token: string;
    user: ClientDto;
  }> {
    // 1. Validate CPF/CNPJ
    const cleanDoc = cleanDocument(registerDto.document);
    const isValidDocument =
      (registerDto.type === 'PF' && validateCPF(cleanDoc)) ||
      (registerDto.type === 'PJ' && validateCNPJ(cleanDoc));

    if (!isValidDocument) {
      throw new BadRequestException(
        registerDto.type === 'PF'
          ? 'CPF inválido'
          : 'CNPJ inválido'
      );
    }

    // 2. Check if email already exists
    const existingEmail = await this.prisma.client.findUnique({
      where: { email: registerDto.email },
    });

    if (existingEmail) {
      throw new ConflictException('Este e-mail já está cadastrado');
    }

    // 3. Check if document already exists
    const existingDoc = await this.prisma.client.findUnique({
      where: { document: cleanDoc },
    });

    if (existingDoc) {
      throw new ConflictException('Este CPF/CNPJ já está cadastrado');
    }

    // 4. Hash password
    const hashedPassword = await bcrypt.hash(registerDto.password, 10);

    // 5. Create client with LEVEL_1 KYC (automatic approval)
    const client = await this.prisma.client.create({
      data: {
        type: registerDto.type.toLowerCase() as 'pf' | 'pj',
        document: cleanDoc,
        name: registerDto.name,
        email: registerDto.email,
        password: hashedPassword,
        phone: '', // Phone is optional for registration
        kycLevel: 'LEVEL_1', // Automatically grant LEVEL_1
        kycStatus: 'APPROVED', // Auto-approve LEVEL_1
      },
    });

    // 6. Create BRL wallet
    await this.prisma.wallet.create({
      data: {
        ownerId: client.id,
        ownerType: 'CLIENT',
        asset: 'BRL',
        balance: 0,
      },
    });

    // 7. Generate tokens
    const accessToken = await this.generateAccessToken(client);
    const refreshToken = await this.generateRefreshToken(client);

    // 8. Store refresh token
    await this.prisma.client.update({
      where: { id: client.id },
      data: { refreshToken },
    });

    // 9. Return auth data
    const userData = ClientMapper.toDto(client);

    return {
      access_token: accessToken,
      refresh_token: refreshToken,
      user: userData,
    };
  }

}