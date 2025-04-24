import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('reportes_activos', { synchronize: false })
export class ReportesActivos {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'codigo_equipo' })
  codigo_equipo: string;

  @Column({ name: 'local' })
  local: string;

  @Column({ name: 'equipo' })
  equipo: string;

  @Column({ name: 'tipo_equipo' })
  tipo_equipo: string;

  @Column({ name: 'marca' })
  marca: string;

  @Column({ name: 'potencia' })
  potencia: string;

  @Column({ name: 'refrigerante' })
  refrigerante: string;

  @Column({ name: 'on_off_inverter' })
  on_off_inverter: string;

  @Column({ name: 'suministra' })
  suministra: string;

  @Column({ name: 'estado_operativo' })
  estado_operativo: string;

  @Column({ name: 'ultima_ot' })
  ultima_ot: string;

  @Column({ name: 'observacion' })
  observacion: string;

  @Column({ name: 'fecha' })
  fecha: Date;
} 