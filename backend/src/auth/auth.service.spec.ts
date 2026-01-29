import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './services/auth.service';
import { PasswordService } from './services/password.service';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        PasswordService,
        JwtService,
        {
          provide: PrismaService,
          useValue: {}, // mock básico do Prisma
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});