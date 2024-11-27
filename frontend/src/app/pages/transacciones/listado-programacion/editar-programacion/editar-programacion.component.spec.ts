import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditarProgramacionComponent } from './editar-programacion.component';

describe('EditarProgramacionComponent', () => {
  let component: EditarProgramacionComponent;
  let fixture: ComponentFixture<EditarProgramacionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EditarProgramacionComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EditarProgramacionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
