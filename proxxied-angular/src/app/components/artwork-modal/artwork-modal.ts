import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ArtworkModalService } from '../../store/artwork-modal';
import { CardsService } from '../../store/cards';
import axios from 'axios';
import { CardOption } from '../../store/card.types';

@Component({
  selector: 'app-artwork-modal',
  imports: [CommonModule, FormsModule],
  templateUrl: './artwork-modal.html',
  styleUrl: './artwork-modal.scss',
})
export class ArtworkModalComponent {
  private artworkModalService = inject(ArtworkModalService);
  private cardsService = inject(CardsService);

  state = this.artworkModalService.state.asReadonly();
  originalSelectedImages = this.cardsService.state.asReadonly().originalSelectedImages;

  isGettingMore = false;
  searchQuery = '';
  applyToAll = false;

  cardNamesToUuids = computed(() => {
    const map: Record<string, string[]> = {};
    this.cardsService.state().cards.forEach(card => {
      if (!map[card.name]) {
        map[card.name] = [];
      }
      map[card.name].push(card.uuid);
    });
    return map;
  });

  async getMoreCards() {
    const card = this.state().card;
    if (!card) return;
    this.isGettingMore = true;
    try {
      const res = await axios.post<CardOption[]>(
        `http://localhost:3000/api/cards/images`,
        { cardNames: [card.name], cardArt: 'prints' }
      );

      const urls = res.data?.[0]?.imageUrls ?? [];
      this.artworkModalService.updateCard({ imageUrls: urls });
    } finally {
      this.isGettingMore = false;
    }
  }

  search() {
    // TODO: Implement
  }

  selectImage(pngUrl: string) {
    // TODO: Implement
  }

  closeModal() {
    this.artworkModalService.closeModal();
  }
}
