import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VerListaInspeccionComponent } from './ver-lista-inspeccion.component';

describe('VerListaInspeccionComponent', () => {
  let component: VerListaInspeccionComponent;
  let fixture: ComponentFixture<VerListaInspeccionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VerListaInspeccionComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VerListaInspeccionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
