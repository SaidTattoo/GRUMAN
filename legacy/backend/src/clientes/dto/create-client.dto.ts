import { IsString, IsNumber, IsOptional, IsDecimal } from 'class-validator';

export class CreateClientDto {
  @IsString()
  name: string;

  @IsString()
  company: string;

  @IsString()
  phone: string;

  @IsString()
  rut: string;

  @IsString()
  razonSocial: string;

  @IsOptional()
  @IsString()
  logo?: string;

  @IsDecimal({ decimal_digits: '2' })
  sobreprecio: number;

  @IsDecimal({ decimal_digits: '2' })
  valorPorLocal: number;
}