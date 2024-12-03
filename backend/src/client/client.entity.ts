import { Programacion } from '../programacion/programacion.entity';
import { User } from '../users/users.entity';
import { Column, Entity, OneToMany, PrimaryGeneratedColumn, ManyToMany, ManyToOne, JoinColumn } from 'typeorm';
import { Locales } from '../locales/locales.entity';
import { ActivoFijoLocal } from '../activo-fijo-local/activo-fijo-local.entity';



@Entity('client')
export class Client {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  nombre: string;

  @Column()
  rut: string;

  @Column()
  razonSocial: string;

  @Column({ type: 'text', nullable: true })
  logo: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0.0 })
  sobreprecio: number;

  @Column()
  valorPorLocal: number;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  fechaAlta: Date;

  @Column({ default: true })
  activo: boolean;

  @ManyToMany(() => User, user => user.clients)
  users: User[];

    @ManyToOne(() => Locales, (local) => local.sectoresTrabajo)
  @JoinColumn({ name: 'localId' })
  locales: Locales[];

   @OneToMany(() => Programacion, programacion => programacion.client)
  programaciones: Programacion[];  

  @OneToMany(() => ActivoFijoLocal, activoFijoLocal => activoFijoLocal.client)
  activoFijoLocales: ActivoFijoLocal[];

  @Column({ default: false })
  deleted: boolean;
}
