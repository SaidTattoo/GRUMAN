import { IsNotEmpty, IsString, Length } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateCausaRaizDto {
  @ApiProperty({
    description: 'Nombre de la causa raíz',
    example: 'Falla eléctrica',
    minLength: 1,
    maxLength: 255
  })
  @IsNotEmpty({ message: 'El nombre es obligatorio' })
  @IsString({ message: 'El nombre debe ser una cadena de texto' })
  @Length(1, 255, { message: 'El nombre debe tener entre 1 y 255 caracteres' })
  nombre: string;
}

export class UpdateCausaRaizDto {
  @ApiProperty({
    description: 'Nombre de la causa raíz',
    example: 'Falla eléctrica',
    minLength: 1,
    maxLength: 255
  })
  @IsNotEmpty({ message: 'El nombre es obligatorio' })
  @IsString({ message: 'El nombre debe ser una cadena de texto' })
  @Length(1, 255, { message: 'El nombre debe tener entre 1 y 255 caracteres' })
  nombre: string;
} 