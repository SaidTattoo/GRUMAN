import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListaServiciosRealizadosComponent } from './lista-servicios-realizados.component';

describe('ListaServiciosRealizadosComponent', () => {
  let component: ListaServiciosRealizadosComponent;
  let fixture: ComponentFixture<ListaServiciosRealizadosComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ListaServiciosRealizadosComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ListaServiciosRealizadosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
