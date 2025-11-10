import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ArtworkModalService } from '../../store/artwork-modal';
import { CardsService } from '../../store/cards';
import axios from 'axios';
import { CardOption } from '../../store/card.types';
import { getLocalBleedImageUrl } from '../../helpers/ImageHelper';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-artwork-modal',
  imports: [CommonModule, FormsModule],
  templateUrl: './artwork-modal.html',
  styleUrl: './artwork-modal.scss',
})
export class ArtworkModalComponent {
  private artworkModalService = inject(ArtworkModalService);
  private cardsService = inject(CardsService);

  state = this.artworkModalService.state;
  originalSelectedImages = this.cardsService.state;

  isGettingMore = false;
  searchQuery = '';
  applyToAll = false;

  cardNamesToUuids = computed(() => {
    const map: Record<string, string[]> = {};
    this.cardsService.state().cards.forEach((card) => {
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
      const res = await axios.post<CardOption[]>(`${environment.API_BASE}/api/cards/images`, {
        cardNames: [card.name],
        cardArt: 'prints',
      });

      const urls = res.data?.[0]?.imageUrls ?? [];
      this.artworkModalService.updateCard({ imageUrls: urls });
    } finally {
      this.isGettingMore = false;
    }
  }

  async search() {
    const name = this.searchQuery.trim();
    const modalIndex = this.state().index;
    if (!name || modalIndex === null) return;

    const res = await axios.post<CardOption[]>(`${environment.API_BASE}/api/cards/images`, {
      cardNames: [name],
    });

    if (!res.data.length) return;

    const newCard = res.data[0];
    if (!newCard.imageUrls?.length) return;

    const newUuid = crypto.randomUUID();

    this.cardsService.updateCard(modalIndex, {
      uuid: newUuid,
      name: newCard.name,
      imageUrls: newCard.imageUrls,
      isUserUpload: false,
    });

    this.artworkModalService.updateCard({
      uuid: newUuid,
      name: newCard.name,
      imageUrls: newCard.imageUrls,
      isUserUpload: false,
    });

    this.cardsService.appendOriginalSelectedImages({
      [newUuid]: newCard.imageUrls[0],
    });

    this.cardsService.clearSelectedImage(newUuid);

    this.searchQuery = '';
  }

  async selectImage(pngUrl: string) {
    const card = this.state().card;
    if (!card) return;

    if (this.applyToAll) {
      const newOriginalSelectedImages: Record<string, string> = {};
      const uuidsToClear: string[] = [];

      const uuidsToUpdate = this.cardNamesToUuids()[card.name] || [];

      uuidsToUpdate.forEach((uuid) => {
        newOriginalSelectedImages[uuid] = pngUrl;
        uuidsToClear.push(uuid);
      });

      this.cardsService.appendOriginalSelectedImages(newOriginalSelectedImages);
      this.cardsService.clearManySelectedImages(uuidsToClear);
    } else {
      this.cardsService.appendOriginalSelectedImages({
        [card.uuid]: pngUrl,
      });

      this.cardsService.clearSelectedImage(card.uuid);
    }

    this.closeModal();
  }

  closeModal() {
    this.artworkModalService.closeModal();
  }
}
