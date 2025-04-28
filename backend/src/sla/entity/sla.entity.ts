import { Client } from 'src/client/client.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('tipo_solicitud', { synchronize: false })
export class Sla {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  nombre: string;

  @Column({ type: 'int', unsigned: true, nullable: true })
  sla_hora?: number;

  @Column({ type: 'int', unsigned: true, nullable: true })
  sla_dias?: number;

  @Column({ type: 'int', unsigned: true })
  id_cliente: number;

  @ManyToOne(() => Client, (client) => client.id)
  @JoinColumn({ name: 'id_cliente' })
  cliente: Client;

  @Column({ default: true })
  activo: boolean;
}
