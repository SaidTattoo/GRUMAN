import { Column, Entity, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { SolicitarVisita } from '../solicitar-visita/solicitar-visita.entity';

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
  @Column({ 
    type: 'varchar', 
    length: 255, 
    unique: true,
    comment: 'Nombre descriptivo de la causa raíz de la falla'
  })
  nombre: string;

  @OneToMany(() => SolicitarVisita, solicitud => solicitud.causaRaiz)
  solicitudes: SolicitarVisita[];
} 