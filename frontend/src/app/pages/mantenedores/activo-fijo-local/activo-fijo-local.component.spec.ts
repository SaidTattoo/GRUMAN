import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ActivoFijoLocalComponent } from './activo-fijo-local.component';

describe('ActivoFijoLocalComponent', () => {
  let component: ActivoFijoLocalComponent;
  let fixture: ComponentFixture<ActivoFijoLocalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ActivoFijoLocalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ActivoFijoLocalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
