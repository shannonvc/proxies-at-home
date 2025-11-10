import { Component, input, ViewChild, ElementRef, afterNextRender } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardOption } from '../../store/card.types';

@Component({
  selector: 'app-card-cell-lazy',
  imports: [CommonModule],
  templateUrl: './card-cell-lazy.html',
  styleUrl: './card-cell-lazy.scss',
})
export class CardCellLazyComponent {
  card = input.required<CardOption>();
  state = input<'idle' | 'loading' | 'error' | undefined>();
  hasImage = input.required<boolean>();
  ensureProcessed = input.required<(card: CardOption) => Promise<void>>();
  imageSrc = input<string | undefined>();
  totalCardWidth = input.required<number>();
  totalCardHeight = input.required<number>();

  @ViewChild('ref') ref!: ElementRef<HTMLDivElement>;

  constructor() {
    afterNextRender(() => {
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            this.ensureProcessed()(this.card());
            observer.disconnect();
          }
        },
        { rootMargin: '400px' }
      );
      observer.observe(this.ref.nativeElement);
    });
  }

  onClick() {
    if (this.state() === 'error') {
      this.ensureProcessed()(this.card());
    }
  }
}
