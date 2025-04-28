import { IsInt, IsString, IsOptional, IsBoolean } from 'class-validator';

export class SlaDto {
    @IsOptional()
    @IsInt()
    id?: number;

    @IsString()
    nombre: string;

    @IsOptional()
    @IsInt()
    sla_dias?: number | null = null;

    @IsOptional()
    @IsInt()
    sla_hora?: number | null = null;

    @IsInt()
    id_cliente: number;

    @IsOptional()
    @IsBoolean()
    activo?: boolean = true;
}