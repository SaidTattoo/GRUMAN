import { IsNotEmpty, IsNumber, IsOptional, IsBoolean, Min, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateClienteRepuestoDto {
    @ApiProperty({ description: 'ID del cliente' })
    @IsNotEmpty()
    @IsNumber()
    cliente_id: number;

    @ApiProperty({ description: 'ID del repuesto' })
    @IsNotEmpty()
    @IsNumber()
    repuesto_id: number;

    @ApiProperty({ description: 'Precio de venta del repuesto' })
    @IsNotEmpty()
    @IsNumber()
    @Min(0)
    precio_venta: number;

    @ApiProperty({ description: 'Precio de compra del repuesto' })
    @IsNotEmpty()
    @IsNumber()
    @Min(0)
    precio_compra: number;

    @ApiProperty({ description: 'Estado activo/inactivo del precio', default: true })
    @IsOptional()
    @IsBoolean()
    activo?: boolean;

    @ApiProperty({ description: 'Observaciones adicionales', required: false })
    @IsOptional()
    @IsString()
    observaciones?: string;
} 