import { TestBed } from '@angular/core/testing';

import { ListadoSolicitudAprobacionCorrectivaService } from './listado-solicitud-aprobacion-correctiva.service';

describe('ListadoSolicitudAprobacionCorrectivaService', () => {
  let service: ListadoSolicitudAprobacionCorrectivaService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ListadoSolicitudAprobacionCorrectivaService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
