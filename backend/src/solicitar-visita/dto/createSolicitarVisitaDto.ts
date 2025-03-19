import {
    IsInt,
    IsOptional,
    IsString,
    IsArray,
    IsDateString,
    IsNotEmpty,
    ValidateIf,
  } from 'class-validator';
  import { ApiProperty } from '@nestjs/swagger';
  
  export class CreateSolicitarVisitaDto {
    @ApiProperty({
      description: 'ID del usuario que crea la solicitud',
      example: 1
    })
    @IsInt()
    @IsNotEmpty({ message: 'El campo userId es obligatorio y debe ser un número.' })
    userId: number;
  
    @ApiProperty({
      description: 'ID del tipo de servicio',
      example: 1
    })
    @IsInt()
    @IsNotEmpty({ message: 'El campo tipoServicioId es obligatorio y debe ser un número.' })
    tipoServicioId: number;
  
    @ApiProperty({
      description: 'ID del local',
      example: 1
    })
    @IsInt()
    @IsNotEmpty({ message: 'El campo localId es obligatorio y debe ser un número.' })
    localId: number;
  
    @ApiProperty({
      description: 'ID del sector de trabajo',
      example: 1,
      required: false
    })
    @IsInt()
    @ValidateIf((o) => o.sectorTrabajoId !== null)
    @IsOptional()
    sectorTrabajoId?: number;
  
    @ApiProperty({
      description: 'ID del cliente',
      example: 1
    })
    @IsInt({ message: 'El campo clientId debe ser un número entero.' })
    @IsNotEmpty({ message: 'El campo clientId es obligatorio.' })
    clientId: number;
  
    @ApiProperty({
      description: 'ID de la causa raíz de la falla',
      example: 1,
      required: false
    })
    @IsInt({ message: 'El campo causaRaizId debe ser un número entero.' })
    @IsOptional()
    causaRaizId?: number;
  
    @ApiProperty({
      description: 'Especialidad requerida',
      example: 'Electricidad',
      required: false
    })
    @IsString()
    @IsOptional()
    especialidad?: string;
  
    @ApiProperty({
      description: 'Número de ticket de Gruman',
      example: 'TK-123',
      required: false
    })
    @IsString()
    @IsOptional()
    ticketGruman?: string;
  
    @ApiProperty({
      description: 'Observaciones adicionales',
      example: 'Se requiere atención urgente',
      required: false
    })
    @IsString()
    @IsOptional()
    observaciones?: string;
  
    @ApiProperty({
      description: 'URLs de las imágenes adjuntas',
      example: ['http://example.com/image1.jpg'],
      required: false,
      type: [String]
    })
    @IsArray()
    @IsOptional()
    imagenes?: string[];
  
    @ApiProperty({
      description: 'Fecha de ingreso de la solicitud',
      example: '2024-03-11T20:25:44.000Z'
    })
    @IsDateString({}, { message: 'El campo fechaIngreso debe ser una fecha válida en formato ISO 8601.' })
    @IsNotEmpty({ message: 'El campo fechaIngreso es obligatorio.' })
    fechaIngreso: string;
  
    @ApiProperty({
      description: 'Estado de la solicitud',
      example: 'pendiente',
      required: false
    })
    @IsString()
    @IsOptional()
    status?: string;
  
    @ApiProperty({
      description: 'ID del usuario que aprueba la solicitud',
      example: 1,
      required: false
    })
    @IsInt()
    @IsOptional()
    aprobada_por_id?: number;
  
    @ApiProperty({
      description: 'ID del técnico asignado',
      example: 1,
      required: false
    })
    @IsInt()
    @IsOptional()
    tecnico_asignado_id?: number;
  }
  