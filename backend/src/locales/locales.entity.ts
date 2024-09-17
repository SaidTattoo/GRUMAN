import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity('locales')
export class Locales {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    direccion: string;

    @Column()
    comuna: string;

    @Column()
    region: string;

    @Column()
    zona: string;

    @Column()
    grupo: string;

    @Column()
    referencia: string;
    
    @Column()
    telefono: string;

    @Column()
    email_local: string;

    @Column()
    email_encargado: string;

    @Column()
    nombre_encargado: string;
    
    
}