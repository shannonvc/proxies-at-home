import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ArtworkModal } from './artwork-modal';

describe('ArtworkModal', () => {
  let component: ArtworkModal;
  let fixture: ComponentFixture<ArtworkModal>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ArtworkModal],
    }).compileComponents();

    fixture = TestBed.createComponent(ArtworkModal);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
