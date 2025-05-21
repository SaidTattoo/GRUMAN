import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { SolicitarVisita } from '../../solicitar-visita/solicitar-visita.entity';
import { DetalleRepuestoActivoFijo } from './detalle-repuesto-activo-fijo.entity';
import { ActivoFijoLocal } from 'src/activo-fijo-local/activo-fijo-local.entity';


export enum EstadoOperativoEquipo {
    FUNCIONANDO = 'funcionando',
    DETENIDO = 'detenido',
    FUNCIONANDO_CON_OBSERVACIONES = 'funcionando_con_observaciones'
}

@Entity('activo_fijo_repuestos')
export class ActivoFijoRepuestos {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => SolicitarVisita)
    @JoinColumn({ name: 'solicitud_visita_id' })
    solicitarVisita: SolicitarVisita;

    @ManyToOne(() => ActivoFijoLocal)
    @JoinColumn({ name: 'activo_fijo_id' })
    activoFijo: ActivoFijoLocal;

    @Column({
        type: 'enum',
        enum: EstadoOperativoEquipo,
        default: EstadoOperativoEquipo.FUNCIONANDO
    })
    estadoOperativo: EstadoOperativoEquipo;

    @Column({ type: 'text', nullable: true })
    observacionesEstado: string;

    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    fechaRevision: Date;

    @Column({type: 'int', nullable: true})
    solicitud_visita_id: number;

    @Column({type: 'int', nullable: true})
    activo_fijo_id: number;

    @OneToMany(() => DetalleRepuestoActivoFijo, detalle => detalle.activoFijoRepuestos, {
        cascade: true,
        eager: true
    })
    detallesRepuestos: DetalleRepuestoActivoFijo[];
} 