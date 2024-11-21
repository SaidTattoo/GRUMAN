import { Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Cliente } from '../clientes/clientes.entity';
import { SectorTrabajo } from '../sectores-trabajo/sectores-trabajo.entity';
import { Programacion } from '../programacion/programacion.entity';
import { Comuna } from '../regiones-comunas/entities/comuna.entity';

@Entity('locales')
export class Locales {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  direccion: string;

  @ManyToOne(() => Comuna, comuna => comuna.locales)
  comuna: Comuna;

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
  @OneToMany(() => SectorTrabajo, sectorTrabajo => sectorTrabajo.local)
  sectoresTrabajo: SectorTrabajo[];

  @OneToMany(() => Programacion, programacion => programacion.local)
  programaciones: Programacion[];
  @Column({ default: false })
  deleted: boolean;
}
