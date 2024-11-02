import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Provincia } from './provincia.entity';

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
} 