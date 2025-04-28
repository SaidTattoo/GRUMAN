import { TipoActivo } from '../tipo_activo/tipo_activo.entity';
import { Client } from '../client/client.entity';
import { Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Locales } from '../locales/locales.entity';
import { ChecklistClima } from '../checklist_clima/checklist_clima.entity';
import { SolicitarVisita } from '../solicitar-visita/solicitar-visita.entity';

@Entity('activo_fijo_local')
export class ActivoFijoLocal {

    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => Client, client => client.activoFijoLocales)
    client: Client;

    @ManyToOne(() => TipoActivo, tipoActivo => tipoActivo.activoFijoLocales)
    tipoActivo: TipoActivo;

    @ManyToOne(() => Locales, locales => locales.activoFijoLocales)
    locales: Locales;

    @OneToMany(() => ChecklistClima, checklist => checklist.activoFijo)
    checklistsClima: ChecklistClima[];

    @Column()
    tipo_equipo: string;

    @Column()
    marca: string;

    @Column()
    potencia_equipo: string;

    @Column()
    refrigerante: string;

    @Column()
    on_off_inverter: string;

    @Column()
    suministra: string;

    @Column()
    codigo_activo: string;

    @OneToMany(() => SolicitarVisita, solicitud => solicitud.activoFijo)
    solicitudesVisita: SolicitarVisita[];
}
