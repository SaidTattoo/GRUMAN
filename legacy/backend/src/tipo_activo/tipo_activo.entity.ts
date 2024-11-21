import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('tipo_activo')
export class TipoActivo {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;
}
