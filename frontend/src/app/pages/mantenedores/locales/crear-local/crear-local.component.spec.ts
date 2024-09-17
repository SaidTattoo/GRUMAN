import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CrearLocalComponent } from './crear-local.component';

describe('CrearLocalComponent', () => {
  let component: CrearLocalComponent;
  let fixture: ComponentFixture<CrearLocalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CrearLocalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CrearLocalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
