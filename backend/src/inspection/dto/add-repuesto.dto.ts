import { IsNotEmpty, IsNumber, IsString, IsOptional, Min } from 'class-validator';

export class AddRepuestoDto {
  @IsNotEmpty()
  @IsNumber()
  repuestoId: number;

  @IsOptional()
  @IsString()
  comentario?: string;

  @IsNumber()
  @Min(1)
  @IsOptional()
  cantidad?: number;
  

  @IsNotEmpty()
  @IsNumber()
  solicitarVisitaId: number;
} 