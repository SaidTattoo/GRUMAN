import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { SolicitarVisita } from 'src/solicitar-visita/solicitar-visita.entity';

@Entity('item_fotos', { synchronize: false })
export class ItemFotos {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    itemId: number;

    @Column()
    solicitarVisitaId: number;

    @Column('text', {
        nullable: true,
        default: '[]',
        transformer: {
            to: (value: string[]) => {
                if (!value) return '[]';
                return JSON.stringify(value);
            },
            from: (value: string) => {
                if (!value) return [];
                // Si el valor comienza con http, es una URL simple
                if (value.startsWith('http')) {
                    return [value];
                }
                try {
                    return JSON.parse(value);
                } catch (e) {
                    console.warn('Error parsing fotos JSON:', e);
                    return [];
                }
            }
        }
    })
    fotos: string[];

    @CreateDateColumn()
    fechaAgregado: Date;

    @ManyToOne(() => SolicitarVisita, solicitud => solicitud.itemFotos)
    @JoinColumn({ name: 'solicitarVisitaId' })
    solicitarVisita: SolicitarVisita;
} 