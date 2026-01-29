// src/clients/dto/create-client.dto.ts
import {
  IsEmail,
  IsNotEmpty,
  IsEnum,
  IsOptional,
  Matches,
  Length,
} from 'class-validator';

export class CreateClientDto {
  @IsEnum(['pf', 'pj'], { message: 'Tipo deve ser "pf" ou "pj"' })
  type: 'pf' | 'pj' = 'pf';

  @IsNotEmpty({ message: 'Nome é obrigatório' })
  name: string = '';

  @IsNotEmpty({ message: 'CPF ou CNPJ é obrigatório' })
  @Matches(/^(\d{11}|\d{14})$/, {
    message: 'O documento deve conter 11 (CPF) ou 14 (CNPJ) dígitos numéricos',
  })
  document: string = '';

  @IsEmail({}, { message: 'Email inválido' })
  email: string = '';

  @IsNotEmpty({ message: 'Telefone é obrigatório' })
  @Length(10, 15, { message: 'Telefone deve ter entre 10 e 15 dígitos' })
  phone: string = '';

  @Length(6, 15, { message: 'Senha deve ter entre 6 e 15 dígitos' })
  password: string = '';

  @IsOptional()
  file?: any;
}
