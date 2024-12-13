import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditarTecnicoGrumanComponent } from './editar-tecnico-gruman.component';

describe('EditarTecnicoGrumanComponent', () => {
  let component: EditarTecnicoGrumanComponent;
  let fixture: ComponentFixture<EditarTecnicoGrumanComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EditarTecnicoGrumanComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EditarTecnicoGrumanComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
