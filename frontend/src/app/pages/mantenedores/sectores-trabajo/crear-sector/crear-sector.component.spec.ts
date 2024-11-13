import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CrearSectorComponent } from './crear-sector.component';

describe('CrearSectorComponent', () => {
  let component: CrearSectorComponent;
  let fixture: ComponentFixture<CrearSectorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CrearSectorComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CrearSectorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
