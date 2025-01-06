import { Programacion } from 'src/programacion/programacion.entity';
import { Client } from '../client/client.entity';
import { Especialidad } from '../especialidad/especialidad.entity';
import {
    Column,
    CreateDateColumn,
    Entity,
    JoinTable,
    ManyToMany,
    OneToMany,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
} from 'typeorm';

@Entity('user')
export class User {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: string;

    @Column({ unique: true })
    email: string;

    @Column()
    password: string;

    @Column()
    rut: string;

    @ManyToMany(() => Client, client => client.users)
    @JoinTable()
    clients: Client[];

    @Column({
        type: 'enum',
        enum: ['user', 'reporter', 'admin', 'superadmin', 'tecnico'],
        default: 'user',
    })
    profile: string;

    @ManyToMany(() => Especialidad)
    @JoinTable({
        name: 'user_especialidades',
        joinColumn: {
            name: 'user_id',
            referencedColumnName: 'id'
        },
        inverseJoinColumn: {
            name: 'especialidad_id',
            referencedColumnName: 'id'
        }
    })
    especialidades: Especialidad[];


    @OneToMany(() => Programacion, programacion => programacion.user)
    programaciones: Programacion[];

    @CreateDateColumn({ type: 'timestamp' })
    createdAt: Date;

    @UpdateDateColumn({ type: 'timestamp' })
    updatedAt: Date;
}
  