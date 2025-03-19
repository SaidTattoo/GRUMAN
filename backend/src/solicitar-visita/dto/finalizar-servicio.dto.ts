import { IsNotEmpty, IsString, IsOptional, IsArray, ValidateNested, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';
import { EstadoOperativoEquipo } from '../../activo-fijo-repuestos/entities/activo-fijo-repuestos.entity';

export class DetalleRepuestoDto {
  @IsNotEmpty()
  cantidad: number;

  @IsOptional()
  @IsString()
  comentario?: string;

  @IsOptional()
  @IsString()
  estado?: string;

  @IsOptional()
  precio_unitario?: number;

  @IsNotEmpty()
  repuesto: {
    id: number;
    articulo: string;
    familia: string;
    marca: string;
  };
}

export class ActivoFijoRepuestoDto {
  @IsNotEmpty()
  activoFijoId: number;

  @IsEnum(EstadoOperativoEquipo)
  estadoOperativo: EstadoOperativoEquipo;

  @IsOptional()
  @IsString()
  observacionesEstado?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => DetalleRepuestoDto)
  repuestos: any[];
}

export class FinalizarServicioDto {
  @IsNotEmpty()
  @IsString()
  firma_cliente: string;

  @IsNotEmpty()
  repuestos: {
    [key: string]: {
      estado: 'conforme' | 'no_conforme' | 'no_aplica';
      comentario?: string;
      fotos?: string[];
      repuestos?: Array<{
        cantidad: number;
        comentario?: string;
        estado?: string;
        precio_unitario?: number;
        repuesto: {
          id: number;
          articulo: string;
          familia: string;
          marca: string;
        }
      }>;
    };
  };

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ActivoFijoRepuestoDto)
  activoFijoRepuestos?: any[];

  @IsOptional()
  @IsString()
  observaciones?: string;
}
