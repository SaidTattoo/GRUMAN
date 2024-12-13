import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TecnicosGrumanComponent } from './tecnicos-gruman.component';

describe('TecnicosGrumanComponent', () => {
  let component: TecnicosGrumanComponent;
  let fixture: ComponentFixture<TecnicosGrumanComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TecnicosGrumanComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TecnicosGrumanComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
