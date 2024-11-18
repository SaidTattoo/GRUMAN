import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ServiciosRealizadosComponent } from './servicios-realizados.component';

describe('ServiciosRealizadosComponent', () => {
  let component: ServiciosRealizadosComponent;
  let fixture: ComponentFixture<ServiciosRealizadosComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ServiciosRealizadosComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ServiciosRealizadosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
