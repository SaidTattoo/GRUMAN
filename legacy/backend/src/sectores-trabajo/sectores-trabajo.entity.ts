import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Locales } from '../locales/locales.entity';

@Entity('sector_trabajo')
export class SectorTrabajo {
  // otras propiedades

  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 255 })
  nombre: string;

  @Column({ type: 'boolean', default: false })
  deleted: boolean;

    @ManyToOne(() => Locales, local=> local.sectoresTrabajo)
    local: Locales;
}