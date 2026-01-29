import { IsNotEmpty, IsOptional } from 'class-validator';

export class CreateAddressDto {
  @IsNotEmpty()
  street: string = '';

  @IsNotEmpty()
  number: string = '';

  @IsOptional()
  complement?: string = '';

  @IsNotEmpty()
  neighborhood: string = '';

  @IsNotEmpty()
  city: string = '';

  @IsNotEmpty()
  state: string = '';

  @IsNotEmpty()
  zipcode: string = '';

  @IsNotEmpty()
  country: string = '';
}