import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CrearSectorDefaultComponent } from './crear-sector-default.component';

describe('CrearSectorDefaultComponent', () => {
  let component: CrearSectorDefaultComponent;
  let fixture: ComponentFixture<CrearSectorDefaultComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CrearSectorDefaultComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CrearSectorDefaultComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
