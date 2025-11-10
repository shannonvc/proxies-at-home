import { Injectable, signal } from '@angular/core';
import { CardOption } from './card.types';

export interface CardsState {
  cards: CardOption[];
  cachedImageUrls: Record<string, string>;
  globalLanguage: string;
  selectedImages: Record<string, string>;
  originalSelectedImages: Record<string, string>;
  uploadedImages: Record<string, string>;
  uploadedOriginalImages: Record<string, string>;
  uploadedFiles: Record<string, File>;
}

export const defaultCardsState: CardsState = {
  cards: [],
  cachedImageUrls: {},
  globalLanguage: 'en',
  selectedImages: {},
  originalSelectedImages: {},
  uploadedImages: {},
  uploadedOriginalImages: {},
  uploadedFiles: {},
};

@Injectable({
  providedIn: 'root',
})
export class CardsService {
  private _state = signal<CardsState>(defaultCardsState);
  state = this._state.asReadonly();

  setCards(cards: CardOption[]) {
    this._state.update((state) => ({ ...state, cards }));
  }

  appendCards(newCards: CardOption[]) {
    this._state.update((state) => ({ ...state, cards: [...state.cards, ...newCards] }));
  }

  updateCard(pos: number, updatedCard: Partial<CardOption>) {
    this._state.update((state) => ({
      ...state,
      cards: state.cards.map((card, index) => (index === pos ? { ...card, ...updatedCard } : card)),
    }));
  }

  removeCardAt(pos: number) {
    this._state.update((state) => {
      const cards = [...state.cards];
      cards.splice(pos, 1);
      return { ...state, cards };
    });
  }

  appendOriginalSelectedImages(newImages: Record<string, string>) {
    this._state.update((state) => ({
      ...state,
      originalSelectedImages: { ...state.originalSelectedImages, ...newImages },
    }));
  }

  appendSelectedImages(newImages: Record<string, string>) {
    this._state.update((state) => ({
      ...state,
      selectedImages: { ...state.selectedImages, ...newImages },
    }));
  }

  clearSelectedImage(uuid: string) {
    this._state.update((state) => {
      const newSelected = { ...state.selectedImages };
      delete newSelected[uuid];
      return { ...state, selectedImages: newSelected };
    });
  }

  clearManySelectedImages(uuids: string[]) {
    this._state.update((state) => {
      const newSelected = { ...state.selectedImages };
      for (const uuid of uuids) delete newSelected[uuid];
      return { ...state, selectedImages: newSelected };
    });
  }
}
