import { Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Locales } from '../locales/locales.entity';
import { SolicitarVisita } from 'src/solicitar-visita/solicitar-visita.entity';

@Entity('sector_trabajo')
export class SectorTrabajo {
  // otras propiedades

  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 255 })
  nombre: string;

  @Column({ type: 'boolean', default: false })
  deleted: boolean;

  @ManyToOne(() => Locales, (local) => local.sectoresTrabajo, { eager: false })
  @JoinColumn({ name: 'localId' }) // Vincula con la columna localId en la base de datos
  local: Locales;


} 