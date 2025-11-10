import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  CdkDragDrop,
  DragDropModule,
  moveItemInArray,
  transferArrayItem,
} from '@angular/cdk/drag-drop';
import { SettingsService } from '../../store/settings';
import { CardsService } from '../../store/cards';
import { CardOption } from '../../store/card.types';
import { ArtworkModalService } from '../../store/artwork-modal';
import { EdgeCutLinesComponent } from '../edge-cut-lines/edge-cut-lines';
import { ArtworkModalComponent } from '../artwork-modal/artwork-modal';
import { CardCellLazyComponent } from '../card-cell-lazy/card-cell-lazy';
import { imageProcessor } from '../../helpers/imageProcessor';
import { environment } from '../../../environments/environment';

const unit = 'mm';
const baseCardWidthMm = 63;
const baseCardHeightMm = 88;

@Component({
  selector: 'app-page-view',
  imports: [
    CommonModule,
    DragDropModule,
    EdgeCutLinesComponent,
    ArtworkModalComponent,
    CardCellLazyComponent,
  ],
  templateUrl: './page-view.html',
  styleUrl: './page-view.scss',
})
export class PageViewComponent {
  private settingsService = inject(SettingsService);
  private cardsService = inject(CardsService);
  private artworkModalService = inject(ArtworkModalService);

  pageSizeUnit = computed(() => this.settingsService.state().pageSizeUnit);
  pageWidth = computed(() => this.settingsService.state().pageWidth);
  pageHeight = computed(() => this.settingsService.state().pageHeight);
  columns = computed(() => this.settingsService.state().columns);
  rows = computed(() => this.settingsService.state().rows);
  bleedEdgeWidth = computed(() => this.settingsService.state().bleedEdgeWidth);
  zoom = computed(() => this.settingsService.state().zoom);
  cardSpacingMm = computed(() => this.settingsService.state().cardSpacingMm);

  cards = computed(() => this.cardsService.state().cards);
  selectedImages = computed(() => this.cardsService.state().selectedImages);

  totalCardWidth = computed(() => baseCardWidthMm + this.bleedEdgeWidth() * 2);
  totalCardHeight = computed(() => baseCardHeightMm + this.bleedEdgeWidth() * 2);
  pageCapacity = computed(() => this.columns() * this.rows());

  gridWidthMm = computed(
    () =>
      this.totalCardWidth() * this.columns() +
      Math.max(0, this.columns() - 1) * this.cardSpacingMm(),
  );
  gridHeightMm = computed(
    () =>
      this.totalCardHeight() * this.rows() + Math.max(0, this.rows() - 1) * this.cardSpacingMm(),
  );

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
    const allCards = [...this.cardsService.state().cards];
    const pageCapacity = this.pageCapacity();

    if (event.previousContainer === event.container) {
      // Dragging within the same page
      const pageIndex = parseInt(event.container.id.replace('page-', ''), 10);
      const globalPreviousIndex = pageIndex * pageCapacity + event.previousIndex;
      const globalCurrentIndex = pageIndex * pageCapacity + event.currentIndex;
      moveItemInArray(allCards, globalPreviousIndex, globalCurrentIndex);
    } else {
      // Dragging between different pages
      const movedCard = event.item.data;

      const previousPageIndex = parseInt(event.previousContainer.id.replace('page-', ''), 10);
      const globalPreviousIndex = previousPageIndex * pageCapacity + event.previousIndex;

      const currentPageIndex = parseInt(event.container.id.replace('page-', ''), 10);
      const globalCurrentIndex = currentPageIndex * pageCapacity + event.currentIndex;

      // Remove from old position
      allCards.splice(globalPreviousIndex, 1);
      // Insert into new position
      allCards.splice(globalCurrentIndex, 0, movedCard);
    }
    this.cardsService.setCards(allCards);
  }

  duplicateCard(index: number) {
    const cardToCopy = this.cards()[index];
    const newCard = { ...cardToCopy, uuid: crypto.randomUUID() };

    const newCards = [...this.cards()];
    newCards.splice(index + 1, 0, newCard);
    this.cardsService.setCards(newCards);

    const original = this.cardsService.state().originalSelectedImages[cardToCopy.uuid];
    const processed = this.cardsService.state().selectedImages[cardToCopy.uuid];

    this.cardsService.appendOriginalSelectedImages({
      [newCard.uuid]: original,
    });

    this.cardsService.appendSelectedImages({
      [newCard.uuid]: processed,
    });
  }

  deleteCard(index: number) {
    this.cardsService.removeCardAt(index);
  }

  baseCardWidthMm = baseCardWidthMm;
  baseCardHeightMm = baseCardHeightMm;

  hideContextMenu() {
    this.contextMenu.set({ ...this.contextMenu(), visible: false });
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

  async ensureProcessed(card: CardOption) {
    const originalUrl = this.cardsService.state().originalSelectedImages[card.uuid];
    if (!originalUrl) return;

    const { processedBlob, error } = await imageProcessor.process({
      uuid: card.uuid,
      url: originalUrl,
      bleedEdgeWidth: this.bleedEdgeWidth(),
      unit: unit,
      apiBase: environment.API_BASE,
      isUserUpload: card.isUserUpload,
      hasBakedBleed: card.hasBakedBleed,
    });

    if (error) {
      console.error(`Error processing image ${card.uuid}:`, error);
      // TODO: Set card state to error
      return;
    }

    const objectUrl = URL.createObjectURL(processedBlob);
    this.cardsService.appendSelectedImages({ [card.uuid]: objectUrl });
  }
}
