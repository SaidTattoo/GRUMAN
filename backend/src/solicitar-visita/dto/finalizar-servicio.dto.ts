import { IsNotEmpty, IsString, IsOptional } from 'class-validator';

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
  @IsString()
  observaciones?: string;
}
