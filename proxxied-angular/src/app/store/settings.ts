import { Injectable, signal } from '@angular/core';
import { defaultPageSettings, LayoutPreset, layoutPresetsSizes, SettingsState } from './types';

@Injectable({
  providedIn: 'root',
})
export class SettingsService {
  private _state = signal<SettingsState>(defaultPageSettings);
  state = this._state.asReadonly();

  setPageSizePreset(value: LayoutPreset) {
    const { pageWidth, pageHeight, pageSizeUnit } = layoutPresetsSizes[value];
    this._state.update(state => ({
      ...state,
      pageSizePreset: value,
      pageOrientation: 'portrait', // always reset
      pageWidth,
      pageHeight,
      pageSizeUnit,
    }));
  }

  swapPageOrientation() {
    this._state.update(state => ({
      ...state,
      pageOrientation: state.pageOrientation === 'portrait' ? 'landscape' : 'portrait',
      pageWidth: state.pageHeight,
      pageHeight: state.pageWidth,
    }));
  }

  setColumns(columns: number) {
    this._state.update(state => ({ ...state, columns }));
  }

  setRows(rows: number) {
    this._state.update(state => ({ ...state, rows }));
  }

  setBleedEdgeWidth(bleedEdgeWidth: number) {
    this._state.update(state => ({ ...state, bleedEdgeWidth }));
  }

  setBleedEdge(bleedEdge: boolean) {
    this._state.update(state => ({ ...state, bleedEdge }));
  }

  setGuideColor(guideColor: string) {
    this._state.update(state => ({ ...state, guideColor }));
  }

  setGuideWidth(guideWidth: number) {
    this._state.update(state => ({ ...state, guideWidth }));
  }

  setZoom(zoom: number) {
    this._state.update(state => ({ ...state, zoom }));
  }

  setCardSpacingMm(cardSpacingMm: number) {
    this._state.update(state => ({ ...state, cardSpacingMm: Math.max(0, cardSpacingMm) }));
  }

  setCardPositionX(cardPositionX: number) {
    this._state.update(state => ({ ...state, cardPositionX }));
  }

  setCardPositionY(cardPositionY: number) {
    this._state.update(state => ({ ...state, cardPositionY }));
  }

  setDpi(dpi: number) {
    this._state.update(state => ({ ...state, dpi }));
  }

  resetSettings() {
    this._state.set(defaultPageSettings);
  }
}
