import {
    IsInt,
    IsOptional,
    IsString,
    IsArray,
    IsDateString,
    IsNotEmpty,
    ValidateIf,
  } from 'class-validator';
  
  export class CreateSolicitarVisitaDto {
    @IsInt()
    @IsNotEmpty({ message: 'El campo userId es obligatorio y debe ser un número.' })
    userId: number;
  
    @IsInt()
    @IsNotEmpty({ message: 'El campo tipoServicioId es obligatorio y debe ser un número.' })
    tipoServicioId: number;
  
    @IsInt()
    @IsNotEmpty({ message: 'El campo localId es obligatorio y debe ser un número.' })
    localId: number;
  
    @IsInt()
    @ValidateIf((o) => o.sectorTrabajoId !== null)
    @IsOptional()
    sectorTrabajoId?: number;
  
    @IsInt({ message: 'El campo clientId debe ser un número entero.' })
    @IsNotEmpty({ message: 'El campo clientId es obligatorio.' })
    clientId: number;
  
    @IsString()
    @IsOptional()
    especialidad?: string;
  
    @IsString()
    @IsOptional()
    ticketGruman?: string;
  
    @IsString()
    @IsOptional()
    observaciones?: string;
  
    @IsArray()
    @IsOptional()
    imagenes?: string[];
  
    @IsDateString({}, { message: 'El campo fechaIngreso debe ser una fecha válida en formato ISO 8601.' })
    @IsNotEmpty({ message: 'El campo fechaIngreso es obligatorio.' })
    fechaIngreso: string;
  
    @IsString()
    @IsOptional()
    status?: string;
  
    @IsInt()
    @IsOptional()
    aprobada_por_id?: number;
  
    @IsInt()
    @IsOptional()
    tecnico_asignado_id?: number;
  }
  