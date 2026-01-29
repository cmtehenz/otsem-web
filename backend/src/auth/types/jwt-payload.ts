// src/auth/types/jwt-payload.ts
export interface JwtPayload {
    sub: string; // ou 'number' se o ID do seu client for numérico
    email: string;
  }