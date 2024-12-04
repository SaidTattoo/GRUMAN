import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VerSolicitudComponent } from './ver-solicitud.component';

describe('VerSolicitudComponent', () => {
  let component: VerSolicitudComponent;
  let fixture: ComponentFixture<VerSolicitudComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VerSolicitudComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VerSolicitudComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
