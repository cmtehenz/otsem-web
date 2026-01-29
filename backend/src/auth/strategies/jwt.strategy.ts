// src/auth/strategies/jwt.strategy.ts
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { IPayload } from '../context/types';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(), // ✅ Apenas Authorization: Bearer
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_ACCESS_SECRET || 'algumsegredoforteparaoaccesstoken',
    });
  }

  async validate(payload: IPayload) {
    console.log('🔍 [JwtStrategy] Recebido payload:', payload);

    if (!payload?.sub) {
      console.error('❌ [JwtStrategy] Payload inválido:', payload);
      throw new UnauthorizedException('Token inválido ou expirado');
    }

    return {
      sub: payload.sub,
      email: payload.email,
      name: payload.name,
    };
  }

}
