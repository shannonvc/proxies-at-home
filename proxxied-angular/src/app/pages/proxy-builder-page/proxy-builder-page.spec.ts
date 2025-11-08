import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProxyBuilderPage } from './proxy-builder-page';

describe('ProxyBuilderPage', () => {
  let component: ProxyBuilderPage;
  let fixture: ComponentFixture<ProxyBuilderPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProxyBuilderPage]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProxyBuilderPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
