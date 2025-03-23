import { Programacion } from 'src/programacion/programacion.entity';
import { Client } from '../client/client.entity';
import { Especialidad } from '../especialidad/especialidad.entity';
import { OrdenServicio } from '../orden-servicio/orden-servicio.entity';
import { UserVehiculo } from '../user-vehiculo/user-vehiculo.entity';
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

    @Column({ default:'', nullable: true })
    lastName: string;

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

    @OneToMany(() => OrdenServicio, ordenServicio => ordenServicio.tecnico)
    ordenesServicioTecnico: OrdenServicio[];

    @OneToMany(() => OrdenServicio, ordenServicio => ordenServicio.usuarioRechazo)
    ordenesServicioRechazadas: OrdenServicio[];

    @OneToMany(() => OrdenServicio, ordenServicio => ordenServicio.usuarioAprobacion)
    ordenesServicioAprobadas: OrdenServicio[];

    @OneToMany(() => UserVehiculo, userVehiculo => userVehiculo.user)
    vehiculoAsignaciones: UserVehiculo[];

    @CreateDateColumn({ type: 'timestamp' })
    createdAt: Date;

    @UpdateDateColumn({ type: 'timestamp' })
    updatedAt: Date;

    @Column({ default: false })
    dev_mode: boolean;
    @Column({ default: false })
    disabled: boolean;
}
  