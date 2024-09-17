import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Locales } from './locales.entity';

@Injectable()
export class LocalesService {
    constructor(
        @InjectRepository(Locales)
        private readonly localesRepository: Repository<Locales>,
    ) {}

    async findAll(): Promise<Locales[]> {
        return this.localesRepository.find();
    }

    async findOne(id: number): Promise<Locales | undefined> {
        return this.localesRepository.findOne({ where: { id } });
    }

    async create(local: Locales): Promise<Locales> {
        return this.localesRepository.save(local);
    }

}
