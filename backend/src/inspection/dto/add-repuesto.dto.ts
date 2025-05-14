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

  @IsOptional()
  @IsString()
  estado?: string;

  @IsOptional()
  @IsString({ each: true })
  fotos?: string[];

  @IsOptional()
  @IsNumber()
  clienteId?: number;
} 