import { TestBed } from '@angular/core/testing';

import { UserVehiculoService } from './user-vehiculo.service';

describe('UserVehiculoService', () => {
  let service: UserVehiculoService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(UserVehiculoService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
