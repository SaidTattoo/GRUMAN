import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListaDeInspeccionesComponent } from './lista-de-inspecciones.component';

describe('ListaDeInspeccionesComponent', () => {
  let component: ListaDeInspeccionesComponent;
  let fixture: ComponentFixture<ListaDeInspeccionesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ListaDeInspeccionesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ListaDeInspeccionesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
