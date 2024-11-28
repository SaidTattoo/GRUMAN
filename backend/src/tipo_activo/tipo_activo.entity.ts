import { ActivoFijoLocal } from 'src/activo-fijo-local/activo-fijo-local.entity';
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';

@Entity('tipo_activo')
export class TipoActivo {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @OneToMany(() => ActivoFijoLocal, activoFijoLocal => activoFijoLocal.tipoActivo)
  activoFijoLocales: ActivoFijoLocal[];
}
