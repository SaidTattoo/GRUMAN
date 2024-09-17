import { Column, Entity, PrimaryGeneratedColumn, ManyToMany } from "typeorm";
import { User } from '../users/user.entity';

@Entity('companies')
export class Company {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: string;

    

    @Column()
    address: string;

    @ManyToMany(() => User, user => user.companies)
    users: User[];
}