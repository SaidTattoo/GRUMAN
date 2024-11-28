import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditarActivoFijoLocalComponent } from './editar-activo-fijo-local.component';

describe('EditarActivoFijoLocalComponent', () => {
  let component: EditarActivoFijoLocalComponent;
  let fixture: ComponentFixture<EditarActivoFijoLocalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EditarActivoFijoLocalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EditarActivoFijoLocalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
