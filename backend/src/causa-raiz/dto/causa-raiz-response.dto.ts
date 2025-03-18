import { ApiProperty } from '@nestjs/swagger';

export class CausaRaizResponseDto {
  @ApiProperty({
    description: 'ID único de la causa raíz',
    example: 1
  })
  id: number;

  @ApiProperty({
    description: 'Nombre de la causa raíz',
    example: 'Falla eléctrica'
  })
  nombre: string;
} 