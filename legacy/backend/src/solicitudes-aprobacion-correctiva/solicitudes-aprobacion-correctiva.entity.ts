import { User } from "../tecnicos/tecnico.entity";
import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";

@Entity('solicitudes_aprobacion_correctiva')
export class SolicitudesAprobacionCorrectiva {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => User)
    @JoinColumn({ name: 'inspectorId' })
    inspectorId: User;

    @Column()
    numeroLocal: number;

    @Column()
    especialidad: number;

    @Column()
    criticidad: number; 

    @Column()
    costoEstimado: number;

    @Column()
    observaciones: string;

    @Column()
    afecta: number;

    @Column()
    tiempoEstimado: number;

    @Column()
    file: string;
    

}