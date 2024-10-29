import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'formatRut'
})
export class FormatRutPipe implements PipeTransform {
  transform(value: string): string {
    if (!value) return '';
    return value.replace(/^(\d{1,2})(\d{3})(\d{3})([\dkK])$/, '$1.$2.$3-$4');
  }
}
