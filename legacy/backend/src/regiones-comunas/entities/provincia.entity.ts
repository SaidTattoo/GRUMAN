import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany } from 'typeorm';
import { Region } from './region.entity';
import { Comuna } from './comuna.entity';


@Entity('provincias')
export class Provincia {
  @PrimaryGeneratedColumn()
  provincia_id: number;

  @Column()
  provincia_nombre: string;

  @Column()
  region_id: number;

  @ManyToOne(() => Region, region => region.provincias)
  region: Region;

  @OneToMany(() => Comuna, comuna => comuna.provincia)
  comunas: Comuna[];
} 