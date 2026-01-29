import { IsNumber, IsString } from 'class-validator';

export class CreateExchangeDto {
    @IsNumber()
    amount_brl!: number;

    @IsString()
    target_currency!: string;

    @IsNumber()
    target_amount!: number;

    @IsNumber()
    market_rate!: number;

    @IsNumber()
    used_rate!: number;
}