import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Repuesto } from './repuestos.entity';

@Injectable()
export class RepuestosService {
  constructor(
    @InjectRepository(Repuesto)
    private readonly repuestosRepository: Repository<Repuesto>,
  ) {}

  async findAll(): Promise<Repuesto[]> {
    return this.repuestosRepository.find();
  }

  async findOne(id: number): Promise<Repuesto | null> {
    return this.repuestosRepository.findOneBy({ id });
  }
  async create(repuesto: Repuesto): Promise<Repuesto> {
    // Validación de entrada
    
    // Definir constante de la tasa de IVA
    const IVA_RATE = 0.19;
  
    // Calcular el Valor Neto basado en el Precio Bruto
    const precioBruto = 19000; // Precio esperado sin sobreprecio
    const valorNeto = this.calcularValorNeto(precioBruto, IVA_RATE);
  
    // Calcular IVA a partir del Valor Neto
    const precioIva = parseFloat((valorNeto * IVA_RATE).toFixed(2));
  
    // Calcular Precio de Venta
    const precioVenta = precioBruto + repuesto.sobreprecio;
  
    // Crear un nuevo objeto Repuesto con los valores calculados
    const repuestoCalculado: Repuesto = {
      ...repuesto,
      precioNetoCompra: valorNeto, // Valor Neto
      precioIva: precioIva,         // IVA
      precioBruto: precioBruto,     // Precio Bruto
      precio: precioVenta,          // Precio de Venta
    };
  
    // Guardar en el repositorio
    return await this.repuestosRepository.save(repuestoCalculado);
  }
  
 
  
  private calcularValorNeto(precioBruto: number, tasaIva: number = 0.19): number {
    return parseFloat((precioBruto / (1 + tasaIva)).toFixed(2));
  }
  async delete(id: number): Promise<void> {
    await this.repuestosRepository.delete(id);
  }
  async update(id: number, repuesto: Repuesto): Promise<Repuesto> {
    await this.repuestosRepository.update(id, repuesto);
    return this.findOne(id);
  }
}
