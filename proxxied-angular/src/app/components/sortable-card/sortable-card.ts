import { Component, computed, inject, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { SettingsService } from '../../store/settings';
import { ArtworkModalService } from '../../store/artwork-modal';
import { CardOption } from '../../store/card.types';

@Component({
  selector: 'app-sortable-card',
  imports: [CommonModule, DragDropModule],
  templateUrl: './sortable-card.html',
  styleUrl: './sortable-card.scss',
})
export class SortableCardComponent {
  private settingsService = inject(SettingsService);
  private artworkModalService = inject(ArtworkModalService);

  card = input.required<CardOption>();
  imageSrc = input.required<string>();
  totalCardWidth = input.required<number>();
  totalCardHeight = input.required<number>();

  contextmenu = output<MouseEvent>();

  bleedEdge = computed(() => this.settingsService.state().bleedEdge);
  guideWidth = computed(() => this.settingsService.state().guideWidth);
  guideColor = computed(() => this.settingsService.state().guideColor);
  bleedEdgeWidth = computed(() => this.settingsService.state().bleedEdgeWidth);

  guideOffset = computed(() => `${(this.bleedEdgeWidth() * (25.4 / 300)).toFixed(3)}mm`);

  openArtworkModal() {
    this.artworkModalService.openModal({ card: this.card(), index: 0 });
  }

  onContextMenu(event: MouseEvent) {
    this.contextmenu.emit(event);
  }
}
