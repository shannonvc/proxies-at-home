import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CardCellLazy } from './card-cell-lazy';

describe('CardCellLazy', () => {
  let component: CardCellLazy;
  let fixture: ComponentFixture<CardCellLazy>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CardCellLazy]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CardCellLazy);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
