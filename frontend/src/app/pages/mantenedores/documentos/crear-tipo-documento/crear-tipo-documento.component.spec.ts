import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CrearTipoDocumentoComponent } from './crear-tipo-documento.component';

describe('CrearTipoDocumentoComponent', () => {
  let component: CrearTipoDocumentoComponent;
  let fixture: ComponentFixture<CrearTipoDocumentoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CrearTipoDocumentoComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CrearTipoDocumentoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
