import {
  Controller,
  Post,
  Get,
  Req,
  UseGuards,
  HttpCode,
  UnauthorizedException,
  Headers,
  Body,
} from '@nestjs/common';
import { RateLimit } from 'nestjs-rate-limiter';
import { Request } from 'express';
import { AuthService } from './services/auth.service';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { ClientDto } from '../clients/dto/client.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { RegisterDto } from './dto/register.dto';
import { Client } from '@prisma/client';
import { ForgotPasswordDto } from './dto/forgot-password.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) { }

  // 🚀 LOGIN ------------------------------------------------------
  @Post('login')
  @UseGuards(LocalAuthGuard)
  @HttpCode(200)
  async login(
    @Req() req: Request & { user: Client },
  ): Promise<{
    accessToken: string;
    refreshToken: string;
    user: ClientDto;
  }> {
    const { accessToken, refreshToken, userData } = await this.authService.login(req.user);
    return {
      accessToken,
      refreshToken,
      user: userData,
    };
  }

  // 🚀 LOGOUT -----------------------------------------------------
  @Post('logout')
  @UseGuards(JwtAuthGuard)
  @HttpCode(200)
  async logout(@Req() req: Request & { user: { sub: string } }): Promise<{ message: string }> {
    const userId = req.user?.sub;
    if (!userId) {
      throw new UnauthorizedException('Usuário não autorizado');
    }

    await this.authService.removeRefreshToken(userId);
    return { message: 'Logout efetuado com sucesso!' };
  }

  // 🚀 ME ---------------------------------------------------------
  @Get('me')
  @UseGuards(JwtAuthGuard)
  @HttpCode(200)
  async me(@Req() req: Request & { user: { sub: string } }): Promise<{ user: ClientDto }> {
    const userId = req.user?.sub;
    if (!userId) {
      throw new UnauthorizedException('Não autorizado');
    }

    const userData = await this.authService.getUserDtoById(userId);
    return { user: userData };
  }

  // 🚀 REFRESH TOKEN ----------------------------------------------
  @Post('refresh')
  @RateLimit({ points: 5, duration: 60 })
  @HttpCode(200)
  async refreshToken(
    @Headers('authorization') authorization: string,
  ): Promise<{ accessToken: string }> {
    if (!authorization?.startsWith('Bearer ')) {
      throw new UnauthorizedException('Token ausente');
    }

    const refreshToken = authorization.replace('Bearer ', '');
    const { newAccessToken } = await this.authService.refresh(refreshToken);

    return { accessToken: newAccessToken };
  }

  // 🚀 ESQUECI MINHA SENHA ----------------------------------------
  @Post('forgot-password')
  @HttpCode(200)
  async forgotPassword(@Body() forgotPasswordDto: ForgotPasswordDto) {
    return this.authService.sendPasswordRecoveryEmail(forgotPasswordDto.email);
  }

  @Post('reset-password')
  async resetPassword(@Body() body: ResetPasswordDto) {
    return this.authService.resetPassword(body.token, body.newPassword);
  }

  // 🚀 REGISTER ---------------------------------------------------
  @Post('register')
  @HttpCode(201)
  async register(@Body() registerDto: RegisterDto): Promise<{
    access_token: string;
    refresh_token: string;
    user: ClientDto;
  }> {
    return this.authService.register(registerDto);
  }
}