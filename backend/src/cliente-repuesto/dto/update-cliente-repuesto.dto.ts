import { PartialType } from '@nestjs/swagger';
import { CreateClienteRepuestoDto } from './create-cliente-repuesto.dto';
import { IsNumber, IsOptional, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateClienteRepuestoDto extends PartialType(CreateClienteRepuestoDto) {
    @ApiProperty({ description: 'Precio de venta del repuesto' })
    @IsNumber()
    @Min(0)
    precio_venta: number;

    @ApiProperty({ description: 'Precio de compra del repuesto' })
    @IsNumber()
    @Min(0)
    precio_compra: number;

    @ApiProperty({ description: 'Estado activo/inactivo del precio', required: false })
    @IsOptional()
    activo?: boolean;
} 