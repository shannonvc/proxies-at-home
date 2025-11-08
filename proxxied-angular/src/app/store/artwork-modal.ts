import { Injectable, signal } from '@angular/core';
import { CardOption } from './card.types';

export interface ArtworkModalData {
  card: CardOption | null;
  index: number | null;
}

export interface ArtworkModalState {
  open: boolean;
  card: CardOption | null;
  index: number | null;
}

export const defaultArtworkModalState: ArtworkModalState = {
  open: false,
  card: null,
  index: null,
};

@Injectable({
  providedIn: 'root',
})
export class ArtworkModalService {
  private _state = signal<ArtworkModalState>(defaultArtworkModalState);
  state = this._state.asReadonly();

  openModal(data: ArtworkModalData) {
    this._state.update(state => ({ ...state, open: true, card: data.card, index: data.index }));
  }

  closeModal() {
    this._state.set(defaultArtworkModalState);
  }

  updateCard(updatedCard: Partial<CardOption>) {
    this._state.update(state => {
      if (!state.card) return state;
      return { ...state, card: { ...state.card, ...updatedCard } };
    });
  }
}
