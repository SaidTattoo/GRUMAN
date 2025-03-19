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
import { AddRepuestoDto } from './dto/add-repuesto.dto';
import { ItemRepuesto } from './entities/item-repuesto.entity';
import { Repuesto } from '../repuestos/repuestos.entity';


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
        private clientRepository: Repository<Client>,
        @InjectRepository(ItemRepuesto)
        private itemRepuestoRepository: Repository<ItemRepuesto>,
        @InjectRepository(Repuesto)
        private repuestoRepository: Repository<Repuesto>
    ) {}

    async createSection(createSectionDto: CreateSectionDto) {
        const section = this.sectionRepository.create(createSectionDto);
        return await this.sectionRepository.save(section);
    }

    async findAllSections() {
        return await this.sectionRepository
            .createQueryBuilder('section')
            .leftJoinAndSelect(
                'section.items', 
                'items', 
                'items.disabled = :itemDisabled',
                { itemDisabled: false }
            )
            .leftJoinAndSelect(
                'items.subItems', 
                'subItems', 
                'subItems.disabled = :subItemDisabled',
                { subItemDisabled: false }
            )
            .where('section.disabled = :disabled', { disabled: false })
            .orderBy('section.id', 'ASC')
            .addOrderBy('items.id', 'ASC')
            .addOrderBy('subItems.id', 'ASC')
            .getMany();
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

    async addRepuestoToItem(
        sectionId: number,
        itemId: number,
        addRepuestoDto: AddRepuestoDto
    ) {
        const item = await this.itemRepository.findOne({
            where: { id: itemId },
            relations: ['section']
        });

        if (!item || item.section.id !== sectionId) {
            throw new NotFoundException(`Item not found or does not belong to section`);
        }

        const repuesto = await this.repuestoRepository.findOne({
            where: { id: addRepuestoDto.repuestoId }
        });

        if (!repuesto) {
            throw new NotFoundException(`Repuesto not found`);
        }
        console.log('addRepuestoDto', addRepuestoDto);
        const itemRepuesto = this.itemRepuestoRepository.create({
            item,
            repuesto,
            comentario: addRepuestoDto.comentario,
            cantidad: addRepuestoDto.cantidad || 1,
            estado: addRepuestoDto.estado || 'Pendiente',
            fotos: addRepuestoDto.fotos || [],
            solicitarVisita: addRepuestoDto.solicitarVisitaId ? 
                { id: addRepuestoDto.solicitarVisitaId } : 
                null
        });

        return await this.itemRepuestoRepository.save(itemRepuesto);
    }

    async getRepuestosFromItem(sectionId: number, itemId: number) {
        const item = await this.itemRepository.findOne({
            where: { id: itemId },
            relations: ['section', 'itemRepuestos', 'itemRepuestos.repuesto']
        });

        if (!item || item.section.id !== sectionId) {
            throw new NotFoundException(`Item not found or does not belong to section`);
        }

        return item.itemRepuestos;
    }

    async removeRepuestoFromItem(
        sectionId: number,
        itemId: number,
        repuestoId: number
    ) {
        const itemRepuesto = await this.itemRepuestoRepository.findOne({
            where: {
                item: { id: itemId, section: { id: sectionId } },
                repuesto: { id: repuestoId }
            }
        });

        if (!itemRepuesto) {
            throw new NotFoundException(`Repuesto not found in item`);
        }

        await this.itemRepuestoRepository.remove(itemRepuesto);
    }

    async addMultipleRepuestosToSubItems(repuestosMap: { [key: string]: any[] }) {
        const savedRepuestos = [];
        
        for (const subItemId in repuestosMap) {
            const repuestos = repuestosMap[subItemId];
            const subItem = await this.subItemRepository.findOne({
                where: { id: parseInt(subItemId) },
                relations: ['item', 'item.section']
            });

            if (!subItem) {
                throw new NotFoundException(`SubItem with ID ${subItemId} not found`);
            }

            for (const repuestoData of repuestos) {
                const repuesto = await this.repuestoRepository.findOne({
                    where: { id: repuestoData.repuesto.id }
                });

                if (!repuesto) {
                    throw new NotFoundException(`Repuesto not found`);
                }

                const itemRepuesto = await this.itemRepuestoRepository.save({
                    itemId: parseInt(subItemId),
                    repuesto,
                    solicitarVisita: { id: repuestoData.solicitarVisitaId },
                    cantidad: repuestoData.cantidad,
                    comentario: repuestoData.comentario || '',
                    estado: repuestoData.estado || 'Pendiente',
                    fotos: repuestoData.fotos || [],
                    item: subItem.item
                });

                savedRepuestos.push(itemRepuesto);
            }
        }

        return savedRepuestos;
    }


 
    async insertRepuestoInItem(itemId: string, repuestoId: number, cantidad: number, comentario: string, solicitarVisitaId: number, estado?: string) {
        // Primero buscar el subItem para obtener su item padre
        const subItem = await this.subItemRepository.findOne({
            where: { id: parseInt(itemId) },
            relations: ['item']
        });

        if (!subItem) {
            throw new NotFoundException(`SubItem not found`);
        }

        const repuesto = await this.repuestoRepository.findOne({
            where: { id: repuestoId }
        });

        if (!repuesto) {
            throw new NotFoundException(`Repuesto not found`);
        }

        const itemRepuesto = this.itemRepuestoRepository.create({
            itemId:  parseInt(itemId), // Usar el ID del item padre
            repuesto,
            cantidad,
            solicitarVisita: { id: solicitarVisitaId },
            comentario,
            estado: estado || 'pendiente'
        });

        return await this.itemRepuestoRepository.save(itemRepuesto);
    }

    async deleteRepuestoFromItem(itemId: string) {
        const itemRepuesto = await this.itemRepuestoRepository.findOne({
            where: {
                id: parseInt(itemId),
            }
        });

        if (!itemRepuesto) {
            throw new NotFoundException(`Repuesto not found in item`);
        }

        await this.itemRepuestoRepository.remove(itemRepuesto);
        return { success: true };
    }

    async deleteItem(id: number) {
        const item = await this.itemRepository.findOne({ where: { id } });
        if (!item) {
            throw new NotFoundException(`Item with ID ${id} not found`);
        }
        return this.itemRepository.remove(item);
    }

    async findItemById(id: number) {
        return this.itemRepository.findOne({ where: { id } });
    }
} 