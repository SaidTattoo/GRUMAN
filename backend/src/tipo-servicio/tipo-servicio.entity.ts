import { SolicitarVisita } from 'src/solicitar-visita/solicitar-visita.entity';
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';

@Entity('tipo_servicio')
export class TipoServicio {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  nombre: string;


}