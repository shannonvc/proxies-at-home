import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SortableCard } from './sortable-card';

describe('SortableCard', () => {
  let component: SortableCard;
  let fixture: ComponentFixture<SortableCard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SortableCard],
    }).compileComponents();

    fixture = TestBed.createComponent(SortableCard);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
