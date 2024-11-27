import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('tipo_servicio')
export class TipoServicio {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  nombre: string;
}