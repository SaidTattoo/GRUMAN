import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SolicitarVisitaComponent } from './solicitar-visita.component';

describe('SolicitarVisitaComponent', () => {
  let component: SolicitarVisitaComponent;
  let fixture: ComponentFixture<SolicitarVisitaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SolicitarVisitaComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SolicitarVisitaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
