import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Locales } from '../locales/locales.entity';
import { Programacion } from '../programacion/programacion.entity';

@Entity('clientes')
export class Cliente {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  nombre: string;

  @Column()
  rut: string;

  @Column()
  razonSocial: string;

  @Column({ type: 'text', nullable: true })
  logo: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0.0 })
  sobreprecio: number;

  @Column()
  valorPorLocal: number;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  fechaAlta: Date;

  @Column({ default: true })
  activo: boolean;

  @OneToMany(() => Locales, (local) => local.cliente)
  locales: Locales[];
  
  @OneToMany(() => Programacion, programacion => programacion.cliente)
  programaciones: Programacion[];
}
