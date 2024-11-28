import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CrearActivoFijoLocalComponent } from './crear-activo-fijo-local.component';

describe('CrearActivoFijoLocalComponent', () => {
  let component: CrearActivoFijoLocalComponent;
  let fixture: ComponentFixture<CrearActivoFijoLocalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CrearActivoFijoLocalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CrearActivoFijoLocalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
