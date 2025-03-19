import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { ActivoFijoRepuestos } from './activo-fijo-repuestos.entity';
import { Repuesto } from '../../repuestos/repuestos.entity';

@Entity('detalle_repuesto_activo_fijo')
export class DetalleRepuestoActivoFijo {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => ActivoFijoRepuestos)
    @JoinColumn({ name: 'activo_fijo_repuestos_id' })
    activoFijoRepuestos: ActivoFijoRepuestos;

    @ManyToOne(() => Repuesto)
    @JoinColumn({ name: 'repuesto_id' })
    repuesto: Repuesto;

    @Column({ type: 'int' })
    cantidad: number;

    @Column({ type: 'text', nullable: true })
    comentario: string;

    @Column({ default: 'pendiente' })
    estado: string;

    @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
    precio_unitario: number;
} 