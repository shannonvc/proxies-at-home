import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PageView } from './page-view';

describe('PageView', () => {
  let component: PageView;
  let fixture: ComponentFixture<PageView>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PageView],
    }).compileComponents();

    fixture = TestBed.createComponent(PageView);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
