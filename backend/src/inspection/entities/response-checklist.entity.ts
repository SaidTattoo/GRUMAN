import { Entity, PrimaryGeneratedColumn, Column, JoinColumn, OneToOne, CreateDateColumn } from 'typeorm';
import { SolicitarVisita } from '../../solicitar-visita/solicitar-visita.entity';

@Entity('response_checklist', { synchronize: true })
export class ResponseChecklist {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'int', nullable: true })
    @OneToOne(() => SolicitarVisita, (solicitarVisita) => solicitarVisita.id)
    @JoinColumn({ name: 'solicitud_visita_id' })
    solicitud_visita_id: number;

    @Column({ type: 'boolean', nullable: false })
    is_climate: boolean;

    @Column({ type: 'longtext', nullable: true, default: null })
    climate_data: string;

    @Column({ 
        type: 'longtext',
        nullable: true,
    })
    data_normal: string;

    @Column({ type: 'longtext', nullable: true })
    signature: string

    @CreateDateColumn()
    createdAt: Date;
}