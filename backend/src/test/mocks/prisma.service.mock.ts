// src/test/mocks/prisma.service.mock.ts
export class PrismaServiceMock {
  user = {
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
  };

  // adicione mais entidades se necessário
}