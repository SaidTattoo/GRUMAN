import { IsNotEmpty, IsString, IsOptional } from 'class-validator';

export class FinalizarServicioDto {
  @IsNotEmpty()
  @IsString()
  firma_cliente: string;

  @IsNotEmpty()
  repuestos: {
    [key: string]: {
      estado: string;
      comentario: string;
      fotos: string[];
      repuestos: Array<{
        cantidad: number;
        comentario: string;
        repuesto: {
          id: number;
          articulo: string;
          familia: string;
          marca: string;
        };
      }>;
    };
  };

  @IsOptional()
  @IsString()
  observaciones?: string;
}
