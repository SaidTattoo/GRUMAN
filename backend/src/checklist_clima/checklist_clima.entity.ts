import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { SolicitarVisita } from '../solicitar-visita/solicitar-visita.entity';
import { ActivoFijoLocal } from '../activo-fijo-local/activo-fijo-local.entity';

export enum EstadoItem {
  REALIZADO = 'realizado',
  PENDIENTE = 'pendiente',
  NO_APLICA = 'no_aplica'
}

@Entity()
export class ChecklistClima {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => SolicitarVisita, solicitud => solicitud.checklistsClima)
  solicitud: SolicitarVisita;

  @Column()
  solicitudId: number;

  @ManyToOne(() => ActivoFijoLocal, activoFijo => activoFijo.checklistsClima)
  activoFijo: ActivoFijoLocal;

  @Column()
  activoFijoId: number;

  @Column({ type: 'float', nullable: true })
  medicion_SetPoint: number | null;

  @Column({ type: 'float', nullable: true })
  medicion_TempInjeccionFrio: number | null;

  @Column({ type: 'float', nullable: true })
  medicion_TempInjeccionCalor: number | null;

  @Column({ type: 'float', nullable: true })
  medicion_TempAmbiente: number | null;

  @Column({ type: 'float', nullable: true })
  medicion_TempRetorno: number | null;

  @Column({ type: 'float', nullable: true })
  medicion_TempExterior: number | null;

  @Column({ nullable: true })
  medicion_SetPoint_observacion: string;

  @Column({ nullable: true })
  medicion_TempInjeccionFrio_observacion: string;

  @Column({ nullable: true })
  medicion_TempInjeccionCalor_observacion: string;

  @Column({ nullable: true })
  medicion_TempAmbiente_observacion: string;

  @Column({ nullable: true })
  medicion_TempRetorno_observacion: string;

  @Column({ nullable: true })
  medicion_TempExterior_observacion: string;
  
  @Column({ nullable: true })
  consumoCompresor_R: string;

  @Column({ nullable: true })
  consumoCompresor_S: string;

  @Column({ nullable: true })
  consumoCompresor_T: string;

  @Column({ nullable: true })
  consumoCompresor_N: string;

  @Column({ nullable: true })
  tension_R_S: string;

  @Column({ nullable: true })
  tension_S_T: string;

  @Column({ nullable: true })
  tension_T_R: string;

  @Column({ nullable: true })
  tension_T_N: string;

  @Column({ nullable: true })
  consumo_total_R: string;

  @Column({ nullable: true })
  consumo_total_S: string;

  @Column({ nullable: true })
  consumo_total_T: string;

  @Column({ nullable: true })
  consumo_total_N: string;

  @Column({ nullable: true })
  presiones_alta: string;

  @Column({ nullable: true })
  presiones_baja: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
} 