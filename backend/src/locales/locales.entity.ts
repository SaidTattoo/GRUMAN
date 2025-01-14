import { Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { SectorTrabajo } from '../sectores-trabajo/sectores-trabajo.entity';
import { Programacion } from '../programacion/programacion.entity';
import { Comuna } from '../regiones-comunas/entities/comuna.entity';
import { Client } from '../client/client.entity';
import { Region } from 'src/regiones-comunas/entities/region.entity';
import { Provincia } from 'src/regiones-comunas/entities/provincia.entity';
import { ActivoFijoLocal } from 'src/activo-fijo-local/activo-fijo-local.entity';

@Entity('locales')
export class Locales {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  direccion: string;

  @Column()
  nombre_local: string;

  @ManyToOne(() => Comuna, comuna => comuna.locales)
  comuna: Comuna;

 
  @ManyToOne(() => Region, region => region.locales)
  @JoinColumn({ name: 'regionId' })
  region: Region;

  @ManyToOne(() => Provincia, provincia => provincia.locales)
  @JoinColumn({ name: 'provinciaId' })
  provincia: Provincia;

  @Column({ nullable: true })
  zona: string;

  @Column()
  grupo: string;

  @Column({ nullable: true })
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
  @Column({   type: 'decimal', precision: 10, scale: 2, default: 0.0 })
  sobreprecio: number;

  @Column({  type: 'decimal', precision: 10, scale: 2, default: 0.0 })
  valorPorLocal: number;
  @ManyToOne(() => Client, (client) => client.locales, { eager: false })
  @JoinColumn({ name: 'clientId' }) // Asegúrate de que la columna en la base de datos sea 'clientId'
  client: Client; // Cambia el nombre de la relación para que sea 'client'

  @Column()
  numeroLocal: string;
  @OneToMany(() => SectorTrabajo, sectorTrabajo => sectorTrabajo.local)
  sectoresTrabajo: SectorTrabajo[];

  @OneToMany(() => Programacion, programacion => programacion.local)
  programaciones: Programacion[];
  @Column({ default: false })
  deleted: boolean;

  @OneToMany(() => ActivoFijoLocal, activoFijoLocal => activoFijoLocal.locales)
  activoFijoLocales: ActivoFijoLocal[];
}
