// import { Injectable, UnauthorizedException } from '@nestjs/common';
// import { JwtService } from '@nestjs/jwt';
// import { PrismaService } from 'src/prisma/prisma.service';
// import * as bcrypt from 'bcrypt';

// @Injectable()
// export class AuthService {
//   constructor(
//     private readonly jwtService: JwtService,
//     private readonly prisma: PrismaService,
//   ) {}

//   async validateUser(email: string, password: string) {
//     const user = await this.prisma.client.findUnique({ where: { email } });

//     if (!user) {
//       throw new UnauthorizedException('Usuário não encontrado');
//     }

//     const passwordValid = await bcrypt.compare(password, user.password);

//     if (!passwordValid) {
//       throw new UnauthorizedException('Senha inválida');
//     }

//     // Não retornar senha
//     const { password: _, ...userWithoutPassword } = user;
//     return userWithoutPassword;
//   }

//   async login(user: any) {
//     const payload = { sub: user.id, email: user.email, document: user.document };
//     return {
//       accessToken: this.jwtService.sign(payload),
//     };
//   }

//   async logout() {
//     // Aqui você pode implementar lógica de blacklist de token, se necessário
//     return { message: 'Logout realizado com sucesso' };
//   }
// }