import { Programacion } from '../programacion/programacion.entity';
import {
  BeforeInsert,
  BeforeUpdate,
  Column,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
export class Vehiculo {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  movil: string;

  @Column()
  patente: string;

  @Column()
  marca: string;

  @Column()
  modelo: string;

  @Column('text', { nullable: true })
  documentacion: string;

  @BeforeInsert()
  @BeforeUpdate()
  serializeDocumentacion() {
    if (this.documentacion === null) {
      this.documentacion = JSON.stringify({
        revision_tecnica: null,
        gases: null,
        permiso_circulacion: null,
        seguro_obligatorio: null,
      });
    } else if (typeof this.documentacion !== 'string') {
      this.documentacion = JSON.stringify(this.documentacion);
    }
  }

  deserializeDocumentacion() {
    if (typeof this.documentacion === 'string') {
      this.documentacion = JSON.parse(this.documentacion);
    }
  }

  @Column({ default: true })
  activo: boolean;

  @Column()
  anio: number;

  @OneToMany(() => Programacion, programacion => programacion.vehiculo)
  programaciones: Programacion[];
}
