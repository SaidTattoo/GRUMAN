import { Documentos } from "../documentos/documentos.entity";
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";

@Entity('tipo_documento')
export class TipoDocumento {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  nombre: string;

  @Column({ default: false })
  disabled: boolean;

  @OneToMany(() => Documentos, documentos => documentos.tipoDocumento)
   documentos: Documentos[];
}
