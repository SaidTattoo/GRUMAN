import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CrearTipoServicioComponent } from './crear-tipo-servicio.component';

describe('CrearTipoServicioComponent', () => {
  let component: CrearTipoServicioComponent;
  let fixture: ComponentFixture<CrearTipoServicioComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CrearTipoServicioComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CrearTipoServicioComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
