import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CdkDragDrop, DragDropModule, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { SettingsService } from '../../store/settings';
import { CardsService } from '../../store/cards';
import { CardOption } from '../../store/card.types';
import { ArtworkModalService } from '../../store/artwork-modal';
import { EdgeCutLinesComponent } from '../edge-cut-lines/edge-cut-lines';
import { ArtworkModalComponent } from '../artwork-modal/artwork-modal';
import { SortableCardComponent } from '../sortable-card/sortable-card';

const unit = 'mm';
const baseCardWidthMm = 63;
const baseCardHeightMm = 88;

@Component({
  selector: 'app-page-view',
  imports: [CommonModule, DragDropModule, EdgeCutLinesComponent, ArtworkModalComponent, SortableCardComponent],
  templateUrl: './page-view.html',
  styleUrl: './page-view.scss',
})
export class PageViewComponent {
  private settingsService = inject(SettingsService);
  private cardsService = inject(CardsService);
  private artworkModalService = inject(ArtworkModalService);

  pageSizeUnit = this.settingsService.state.asReadonly().pageSizeUnit;
  pageWidth = this.settingsService.state.asReadonly().pageWidth;
  pageHeight = this.settingsService.state.asReadonly().pageHeight;
  columns = this.settingsService.state.asReadonly().columns;
  rows = this.settingsService.state.asReadonly().rows;
  bleedEdgeWidth = this.settingsService.state.asReadonly().bleedEdgeWidth;
  zoom = this.settingsService.state.asReadonly().zoom;
  cardSpacingMm = this.settingsService.state.asReadonly().cardSpacingMm;

  cards = this.cardsService.state.asReadonly().cards;
  selectedImages = this.cardsService.state.asReadonly().selectedImages;

  totalCardWidth = computed(() => baseCardWidthMm + this.bleedEdgeWidth() * 2);
  totalCardHeight = computed(() => baseCardHeightMm + this.bleedEdgeWidth() * 2);
  pageCapacity = computed(() => this.columns() * this.rows());

  gridWidthMm = computed(() => this.totalCardWidth() * this.columns() + Math.max(0, this.columns() - 1) * this.cardSpacingMm());
  gridHeightMm = computed(() => this.totalCardHeight() * this.rows() + Math.max(0, this.rows() - 1) * this.cardSpacingMm());

  contextMenu = signal({
    visible: false,
    x: 0,
    y: 0,
    cardIndex: null as number | null,
  });

  chunkedCards = computed(() => {
    const cards = this.cards();
    const pageCapacity = this.pageCapacity();
    const chunks: CardOption[][] = [];
    for (let i = 0; i < cards.length; i += pageCapacity) {
      chunks.push(cards.slice(i, i + pageCapacity));
    }
    return chunks;
  });

  drop(event: CdkDragDrop<CardOption[]>) {
    if (event.previousContainer === event.container) {
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
    } else {
      transferArrayItem(
        event.previousContainer.data,
        event.container.data,
        event.previousIndex,
        event.currentIndex,
      );
    }
  }

  duplicateCard(index: number) {
    // TODO: Implement
  }

  deleteCard(index: number) {
    this.cardsService.removeCardAt(index);
  }

  onContextMenu(event: MouseEvent, index: number) {
    event.preventDefault();
    this.contextMenu.set({
      visible: true,
      x: event.clientX,
      y: event.clientY,
      cardIndex: index,
    });
  }
}
