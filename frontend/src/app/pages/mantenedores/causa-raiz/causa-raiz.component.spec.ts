import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CausaRaizComponent } from './causa-raiz.component';

describe('CausaRaizComponent', () => {
  let component: CausaRaizComponent;
  let fixture: ComponentFixture<CausaRaizComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CausaRaizComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CausaRaizComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
