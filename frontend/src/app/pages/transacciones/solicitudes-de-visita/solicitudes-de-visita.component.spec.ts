import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SolicitudesDeVisitaComponent } from './solicitudes-de-visita.component';

describe('SolicitudesDeVisitaComponent', () => {
  let component: SolicitudesDeVisitaComponent;
  let fixture: ComponentFixture<SolicitudesDeVisitaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SolicitudesDeVisitaComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SolicitudesDeVisitaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
