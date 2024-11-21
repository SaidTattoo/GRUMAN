import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany } from 'typeorm';
import { Provincia } from './provincia.entity';
import { Locales } from '../../locales/locales.entity';

@Entity('comunas')
export class Comuna {
  @PrimaryGeneratedColumn()
  comuna_id: number;

  @Column()
  comuna_nombre: string;

  @Column()
  provincia_id: number;

  @ManyToOne(() => Provincia, provincia => provincia.comunas)
  provincia: Provincia;

  @OneToMany(() => Locales, local => local.comuna)
  locales: Locales[];
} 