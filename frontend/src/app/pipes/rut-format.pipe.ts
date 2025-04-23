import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'rutFormat',
  standalone: true
})
export class RutFormatPipe implements PipeTransform {
  transform(rut: string): string {
    if (!rut) return '';

    // Limpiar el RUT de cualquier formato previo
    let valor = rut.replace(/\./g, '').replace(/-/g, '').trim();
    
    // Obtener el dígito verificador
    const dv = valor.slice(-1);
    // Obtener el cuerpo del RUT
    const rutBody = valor.slice(0, -1);
    
    // Formatear el cuerpo del RUT con puntos
    let rutFormateado = rutBody
      .toString()
      .split('')
      .reverse()
      .reduce((acum, num, i) => {
        if (i && i % 3 === 0) acum.push('.');
        acum.push(num);
        return acum;
      }, [] as string[])
      .reverse()
      .join('');

    // Retornar RUT formateado
    return `${rutFormateado}-${dv}`;
  }
} 