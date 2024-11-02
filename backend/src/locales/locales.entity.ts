import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Cliente } from '../clientes/clientes.entity';

@Entity('locales')
export class Locales {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  direccion: string;

  @Column()
  comuna: string;

  @Column()
  region: string;

  @Column()
  provincia: string;

  @Column()
  zona: string;

  @Column()
  grupo: string;

  @Column()
  referencia: string;

  @Column()
  telefono: string;

  @Column()
  email_local: string;

  @Column()
  email_encargado: string;

  @Column()
  nombre_encargado: string;

  @Column({ type: 'decimal', precision: 10, scale: 8 })
  latitud: number;

  @Column({ type: 'decimal', precision: 10, scale: 8 })
  longitud: number;

  @ManyToOne(() => Cliente, (cliente) => cliente.locales)
  cliente: Cliente;

  @Column()
  numeroLocal: string;

  @Column({ default: false })
  deleted: boolean;
}
