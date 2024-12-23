import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditarMesDeFacturacionComponent } from './editar-mes-de-facturacion.component';

describe('EditarMesDeFacturacionComponent', () => {
  let component: EditarMesDeFacturacionComponent;
  let fixture: ComponentFixture<EditarMesDeFacturacionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EditarMesDeFacturacionComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EditarMesDeFacturacionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
