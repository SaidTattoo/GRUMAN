import { TipoDocumento } from "../tipo-documento/tipo-documento.entity";
import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

@Entity('documentos')
export class Documentos {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  nombre: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  fecha: Date;

  @Column()
  path: string;

  @ManyToOne(() => TipoDocumento, tipoDocumento => tipoDocumento.documentos)
  @JoinColumn({ name: 'tipo_documento_id' })
  tipoDocumento: TipoDocumento;

  //puede que los documentos sean de vehiculos, usuarios, locales o empresas
  @Column()
  tipo: string;

  @Column({ default: true })
  activo: boolean;
}
