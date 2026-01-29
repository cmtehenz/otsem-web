import {
  IsEmail,
  IsNotEmpty,
  IsEnum,
  Length,
  Matches,
  IsOptional,
} from 'class-validator';

export class RegisterDto {
  @IsEnum(['PF', 'PJ'], { message: 'Type must be "PF" or "PJ"' })
  type: 'PF' | 'PJ' = 'PF';

  @IsNotEmpty({ message: 'Document (CPF/CNPJ) is required' })
  @Matches(/^(\d{11}|\d{14})$/, {
    message: 'Document must contain 11 (CPF) or 14 (CNPJ) numeric digits',
  })
  document: string = '';

  @IsNotEmpty({ message: 'Name is required' })
  name: string = '';

  @IsEmail({}, { message: 'Invalid email' })
  email: string = '';

  @IsNotEmpty({ message: 'Password is required' })
  @Length(8, 100, { message: 'Password must be between 8 and 100 characters' })
  password: string = '';

  @IsOptional()
  affiliateCode?: string;
}
