import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('meses_facturacion')
export class MesesFacturacion {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 50, nullable: false, unique: true })
  mes: string;

  @Column({ type: 'int', nullable: false })
  orden_vista: number;

  @Column({ type: 'boolean', nullable: false , default: true })
  estado: boolean;
} 