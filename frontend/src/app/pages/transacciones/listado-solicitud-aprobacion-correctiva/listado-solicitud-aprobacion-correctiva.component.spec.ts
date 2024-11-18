import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListadoSolicitudAprobacionCorrectivaComponent } from './listado-solicitud-aprobacion-correctiva.component';

describe('ListadoSolicitudAprobacionCorrectivaComponent', () => {
  let component: ListadoSolicitudAprobacionCorrectivaComponent;
  let fixture: ComponentFixture<ListadoSolicitudAprobacionCorrectivaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ListadoSolicitudAprobacionCorrectivaComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ListadoSolicitudAprobacionCorrectivaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
