// src/wallet/wallet.controller.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { WalletController } from './wallet.controller';
import { WalletService } from './wallet.service';

// ✅ Caminho corrigido para funcionar nos testes
jest.mock('../auth/guards/jwt-auth.guard', () => ({
  JwtAuthGuard: jest.fn(() => ({
    canActivate: jest.fn(() => true),
  })),
}));

describe('WalletController', () => {
  let controller: WalletController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [WalletController],
      providers: [
        {
          provide: WalletService,
          useValue: {
            createWallet: jest.fn(),
            getWallets: jest.fn(),
            updateBalance: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<WalletController>(WalletController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});