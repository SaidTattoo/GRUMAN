import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TecnicosMovilesComponent } from './tecnicos-moviles.component';

describe('TecnicosMovilesComponent', () => {
  let component: TecnicosMovilesComponent;
  let fixture: ComponentFixture<TecnicosMovilesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TecnicosMovilesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TecnicosMovilesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
