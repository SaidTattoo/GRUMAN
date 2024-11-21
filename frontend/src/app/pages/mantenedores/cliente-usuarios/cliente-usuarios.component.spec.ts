import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ClienteUsuariosComponent } from './cliente-usuarios.component';

describe('ClienteUsuariosComponent', () => {
  let component: ClienteUsuariosComponent;
  let fixture: ComponentFixture<ClienteUsuariosComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ClienteUsuariosComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ClienteUsuariosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
