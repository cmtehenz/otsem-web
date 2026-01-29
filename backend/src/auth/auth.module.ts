// src/auth/auth.module.ts
import { forwardRef, Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthController } from './auth.controller';
import { AuthService } from './services/auth.service';
import { PasswordService } from './services/password.service';
import { JwtStrategy } from './strategies/jwt.strategy';
import { LocalStrategy } from './strategies/local.strategy';
import { PrismaService } from 'src/prisma/prisma.service';
import { ClientsModule } from 'src/clients/clients.module';
import { MailService } from '@src/mail/mail.service';


@Module({
  imports: [
    forwardRef(() => ClientsModule),
    PassportModule,
    JwtModule.register({
      secret: process.env.JWT_ACCESS_SECRET || 'algumsegredoforteparaoaccesstoken',
      signOptions: { expiresIn: '1h' },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, PasswordService, LocalStrategy, JwtStrategy, PrismaService, MailService ],
  exports: [AuthService, PasswordService, JwtModule],
})
export class AuthModule { }