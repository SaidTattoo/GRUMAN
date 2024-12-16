import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Section } from './entities/section.entity';
import { Item } from './entities/item.entity';
import { SubItem } from './entities/sub-item.entity';
import { CreateItemDto } from './dto/create-item.dto';
import { CreateSectionDto } from './dto/create-section.dto';
import { CreateSubItemDto } from './dto/create-sub-item.dto';
import { UpdateSectionDto } from './dto/update-section.dto';
import { Client } from 'src/client/client.entity';


@Injectable()
export class InspectionService {
    constructor(
        @InjectRepository(Section)
        private sectionRepository: Repository<Section>,
        @InjectRepository(Item)
        private itemRepository: Repository<Item>,
        @InjectRepository(SubItem)
        private subItemRepository: Repository<SubItem>,
        @InjectRepository(Client)
        private clientRepository: Repository<Client>
    ) {}

    async createSection(createSectionDto: CreateSectionDto) {
        const section = this.sectionRepository.create(createSectionDto);
        return await this.sectionRepository.save(section);
    }

    async findAllSections() {
        return await this.sectionRepository.find({
            relations: ['items', 'items.subItems'],
            where: { disabled: false }
        });
    }

    async createItem(sectionId: number, createItemDto: CreateItemDto) {
        const section = await this.sectionRepository.findOne({
            where: { id: sectionId }
        });

        if (!section) {
            throw new NotFoundException(`Section with ID ${sectionId} not found`);
        }

        const item = this.itemRepository.create({
            ...createItemDto,
            section
        });

        return await this.itemRepository.save(item);
    }

    async createSubItem(sectionId: number, itemId: number, createSubItemDto: CreateSubItemDto) {
        const item = await this.itemRepository.findOne({
            where: { id: itemId },
            relations: ['section']
        });

        if (!item || item.section.id !== sectionId) {
            throw new NotFoundException(`Item not found or does not belong to section`);
        }

        const subItem = this.subItemRepository.create({
            ...createSubItemDto,
            item
        });

        return await this.subItemRepository.save(subItem);
    }

    async removeItem(sectionId: number, itemId: number) {
        await this.itemRepository.update(itemId, { disabled: true });
        
        // Obtener todos los clientes
        const clients = await this.clientRepository.find();
        
        // Actualizar la listaInspeccion de cada cliente
        for (const client of clients) {
            if (client.listaInspeccion && Array.isArray(client.listaInspeccion)) {
                client.listaInspeccion = client.listaInspeccion.map(section => ({
                    ...section,
                    items: section.items.filter(item => item.id !== itemId)
                }));
                await this.clientRepository.save(client);
            }
        }
    }

    async removeSubItem(sectionId: number, itemId: number, subItemId: number) {
        await this.subItemRepository.update(subItemId, { disabled: true });
        
        // Obtener todos los clientes
        const clients = await this.clientRepository.find();
        
        // Actualizar la listaInspeccion de cada cliente
        for (const client of clients) {
            if (client.listaInspeccion && Array.isArray(client.listaInspeccion)) {
                client.listaInspeccion = client.listaInspeccion.map(section => ({
                    ...section,
                    items: section.items.map(item => ({
                        ...item,
                        subItems: item.subItems.filter(subItem => subItem.id !== subItemId)
                    }))
                }));
                await this.clientRepository.save(client);
            }
        }
    }

    async updateSection(id: number, updateSectionDto: UpdateSectionDto) {
        const section = await this.sectionRepository.findOne({
            where: { id }
        });

        if (!section) {
            throw new NotFoundException(`Section with ID ${id} not found`);
        }

        await this.sectionRepository.update(id, updateSectionDto);
        return this.sectionRepository.findOne({
            where: { id },
            relations: ['items', 'items.subItems']
        });
    }

    async updateItem(sectionId: number, itemId: number, updateItemDto: CreateItemDto) {
        const item = await this.itemRepository.findOne({
            where: { id: itemId },
            relations: ['section']
        });

        if (!item || item.section.id !== sectionId) {
            throw new NotFoundException(`Item not found or does not belong to section`);
        }

        await this.itemRepository.update(itemId, updateItemDto);
        return this.itemRepository.findOne({
            where: { id: itemId },
            relations: ['subItems']
        });
    }

    async updateSubItem(sectionId: number, itemId: number, subItemId: number, updateSubItemDto: CreateSubItemDto) {
        const subItem = await this.subItemRepository.findOne({
            where: { id: subItemId },
            relations: ['item', 'item.section']
        });

        if (!subItem || subItem.item.id !== itemId || subItem.item.section.id !== sectionId) {
            throw new NotFoundException(`SubItem not found or does not belong to item/section`);
        }

        await this.subItemRepository.update(subItemId, updateSubItemDto);
        return this.subItemRepository.findOne({
            where: { id: subItemId }
        });
    }

    async removeSection(id: number) {
        await this.sectionRepository.update(id, { disabled: true });
        
        // Obtener todos los clientes
        const clients = await this.clientRepository.find();
        
        // Actualizar la listaInspeccion de cada cliente
        for (const client of clients) {
            if (client.listaInspeccion && Array.isArray(client.listaInspeccion)) {
                client.listaInspeccion = client.listaInspeccion.filter(
                    section => section.id !== id
                );
                await this.clientRepository.save(client);
            }
        }
    }
    
} 