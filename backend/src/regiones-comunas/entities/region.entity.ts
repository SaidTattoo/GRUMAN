import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Provincia } from './provincia.entity';
import { Locales } from '../../locales/locales.entity';

@Entity('regiones')
export class Region {
  @PrimaryGeneratedColumn()
  region_id: number;

  @Column()
  region_nombre: string;

  @Column()
  region_ordinal: string;

  @OneToMany(() => Provincia, provincia => provincia.region)
  provincias: Provincia[];

  @OneToMany(() => Locales, local => local.region)
  locales: Locales[];
} 