import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

@Entity('causas_raiz')
export class CausaRaiz {
  @ApiProperty({
    description: 'ID único de la causa raíz',
    example: 1
  })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({
    description: 'Nombre de la causa raíz',
    example: 'Falla eléctrica'
  })
  @Column({ type: 'varchar', length: 255, unique: true })
  nombre: string;
} 