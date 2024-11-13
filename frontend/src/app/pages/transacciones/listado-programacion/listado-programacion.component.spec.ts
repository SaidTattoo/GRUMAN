import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListadoProgramacionComponent } from './listado-programacion.component';

describe('ListadoProgramacionComponent', () => {
  let component: ListadoProgramacionComponent;
  let fixture: ComponentFixture<ListadoProgramacionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ListadoProgramacionComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ListadoProgramacionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
