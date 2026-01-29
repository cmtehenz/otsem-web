import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateClientDto } from './dto/create-client.dto';
import { UpdateClientDto } from './dto/update-client.dto';
import * as bcrypt from 'bcryptjs';
import { MultiWalletService } from '@src/wallet/multi-wallet.service';


@Injectable()
export class ClientsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly walletService: MultiWalletService,
  ) { }



  async create(createClientDto: CreateClientDto, file?: Express.Multer.File) {
    const hashedPassword = await this.hashPassword(createClientDto.password);

    // 1. Gera as carteiras multi-chain
    const carteiras = await this.walletService.gerarCarteiras();

    const existing = await this.prisma.client.findUnique({
      where: { document: createClientDto.document },
    });

    if (existing) {
      throw new Error('Já existe um cliente com esse documento.');
    }

    // 2. Cria o cliente no banco
    const client = await this.prisma.client.create({
      data: {
        name: createClientDto.name,
        type: createClientDto.type,
        email: createClientDto.email,
        password: hashedPassword,
        document: createClientDto.document,
        phone: createClientDto.phone,
        fileName: file?.originalname || null,
        filePath: file?.path || null,
      },
    });

    // 3. Cria carteira BRL
    await this.prisma.wallet.create({
      data: {
        ownerId: client.id,
        ownerType: 'CLIENT',
        asset: 'BRL',
        balance: 0,
      },
    });

    // 4. Cria as wallets cripto (um registro por rede/ativo)
    await Promise.all([
      this.prisma.wallet.create({
        data: {
          ownerId: client.id,
          ownerType: 'CLIENT',
          asset: 'ETH',
          address: carteiras.ethereum.address,
          balance: 0,
        },
      }),
      this.prisma.wallet.create({
        data: {
          ownerId: client.id,
          ownerType: 'CLIENT',
          asset: 'BTC',
          address: carteiras.bitcoin.address,
          balance: 0,
        },
      }),
      this.prisma.wallet.create({
        data: {
          ownerId: client.id,
          ownerType: 'CLIENT',
          asset: 'TRX',
          address: carteiras.tron.address,
          balance: 0,
        },
      }),
      this.prisma.wallet.create({
        data: {
          ownerId: client.id,
          ownerType: 'CLIENT',
          asset: 'SOL',
          address: carteiras.solana.address,
          balance: 0,
        },
      }),
    ]);

    // 5. Retorna client e frases/chaves para o frontend exibir e orientar o usuário
    return {
      client,
      // IMPORTANTE: Mostre para o usuário SALVAR essas frases/chaves, não são retornadas novamente!
      fraseEthereum: carteiras.ethereum.phrase,
      fraseBitcoin: carteiras.bitcoin.mnemonic,
      chaveTron: carteiras.tron.privateKey,
      chaveSolana: carteiras.solana.privateKey,
    };
  }





  findAll() {
    return this.prisma.client.findMany();
  }

  findOne(id: string) {
    return this.prisma.client.findUnique({ where: { id } });
  }

  async update(clientId: string, data: UpdateClientDto) {

    return this.prisma.client.update({
      where: { id: clientId },
      data,
    });
  }




  remove(id: string) {
    return this.prisma.client.delete({ where: { id } });
  }

  async hashPassword(password: string): Promise<string> {
    const saltRounds = 10;
    return bcrypt.hash(password, saltRounds);
  }
}
