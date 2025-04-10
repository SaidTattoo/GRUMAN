import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Repuesto } from '../../repuestos/repuestos.entity';
import { SolicitarVisita } from '../../solicitar-visita/solicitar-visita.entity';

@Entity('item_repuestos')
export class ItemRepuesto {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    itemId: number;

    @Column()
    repuestoId?: number;

    @Column()
    cantidad: number;

    @Column({ nullable: true })
    comentario: string;

    @Column()
    solicitarVisitaId: number;

    @Column({ default: 'pendiente' })
    estado: string;

    @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
    precio_venta: number;

    @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
    precio_compra: number;

    @ManyToOne(() => Repuesto, { eager: true })
    @JoinColumn({ name: 'repuestoId' })
    repuesto: Repuesto;

    @ManyToOne(() => SolicitarVisita)
    @JoinColumn({ name: 'solicitarVisitaId' })
    solicitarVisita: SolicitarVisita;
} 