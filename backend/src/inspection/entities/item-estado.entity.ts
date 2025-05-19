import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { SolicitarVisita } from '../../solicitar-visita/solicitar-visita.entity';

@Entity('item_estado', { synchronize: false })
export class ItemEstado {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    itemId: number;

    @Column()
    solicitarVisitaId: number;

    @Column({ nullable: true })
    comentario: string;

    @Column()
    estado: string;

    @ManyToOne(() => SolicitarVisita, solicitarVisita => solicitarVisita.itemEstados)
    @JoinColumn({ name: 'solicitarVisitaId' })
    solicitarVisita: SolicitarVisita;

    @Column({ nullable: true })
    activo_fijo_id: string;
} 