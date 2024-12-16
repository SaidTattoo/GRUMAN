import { IsOptional, IsArray, IsString, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateClientDto {
    @IsOptional()
    @IsString()
    nombre?: string;

    @IsOptional()
    @IsString()
    rut?: string;

    @IsOptional()
    @IsString()
    razonSocial?: string;

    @IsOptional()
    @IsArray()
    @Type(() => Number)
    tipoServicio?: any[];

    @IsOptional()
    @IsArray()
    listaInspeccion?: any[];
} 