import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CrearTecnicoGrumanComponent } from './crear-tecnico-gruman.component';

describe('CrearTecnicoGrumanComponent', () => {
  let component: CrearTecnicoGrumanComponent;
  let fixture: ComponentFixture<CrearTecnicoGrumanComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CrearTecnicoGrumanComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CrearTecnicoGrumanComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
