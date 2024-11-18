import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditarSolicitudCorrectivaComponent } from './editar-solicitud-correctiva.component';

describe('EditarSolicitudCorrectivaComponent', () => {
  let component: EditarSolicitudCorrectivaComponent;
  let fixture: ComponentFixture<EditarSolicitudCorrectivaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EditarSolicitudCorrectivaComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EditarSolicitudCorrectivaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
