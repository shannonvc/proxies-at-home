import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EdgeCutLines } from './edge-cut-lines';

describe('EdgeCutLines', () => {
  let component: EdgeCutLines;
  let fixture: ComponentFixture<EdgeCutLines>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EdgeCutLines]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EdgeCutLines);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
