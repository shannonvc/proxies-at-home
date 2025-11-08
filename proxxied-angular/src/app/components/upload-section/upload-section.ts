import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { CardsService } from '../../store/cards';
import { LoadingService } from '../../store/loading';
import { SettingsService } from '../../store/settings';
import { LANGUAGE_OPTIONS } from '../../constants';
import { CardOption } from '../../store/card.types';
import axios from 'axios';

@Component({
  selector: 'app-upload-section',
  imports: [FormsModule, CommonModule],
  templateUrl: './upload-section.html',
  styleUrl: './upload-section.scss',
})
export class UploadSectionComponent {
  private cardsService = inject(CardsService);
  private loadingService = inject(LoadingService);
  private settingsService = inject(SettingsService);

  deckText = '';
  globalLanguage = 'en';
  LANGUAGE_OPTIONS = LANGUAGE_OPTIONS;
  showClearConfirmModal = false;

  handleUploadMpcFill(event: Event) {
    // TODO: Implement
  }

  handleImportMpcXml(event: Event) {
    // TODO: Implement
  }

  handleUploadStandard(event: Event) {
    // TODO: Implement
  }

  handleSubmit() {
    // TODO: Implement
  }

  handleClear() {
    this.showClearConfirmModal = true;
  }

  confirmClear() {
    this.cardsService.setCards([]);
    this.showClearConfirmModal = false;
  }
}
