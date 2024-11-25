import { TestBed } from '@angular/core/testing';

import { ServiciosRealizadosService } from './servicios-realizados.service';

describe('ServiciosRealizadosService', () => {
  let service: ServiciosRealizadosService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ServiciosRealizadosService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
