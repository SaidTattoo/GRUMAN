import { Entity, PrimaryGeneratedColumn, Column, ManyToMany } from 'typeorm';
import { Client } from '../client/client.entity';

@Entity('tipo_servicio')
export class TipoServicio {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  nombre: string;

  @Column({ type: 'text', nullable: true })
  descripcion: string;

  @Column({ default: true })
  activo: boolean;

  @Column({ default: false })
  deleted: boolean;

  @ManyToMany(() => Client, (cliente) => cliente.tipoServicio)
  clients: Client[];
}