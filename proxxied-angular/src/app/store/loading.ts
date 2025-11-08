import { Injectable, signal } from '@angular/core';

export type LoadingTask =
  | 'Fetching cards'
  | 'Processing Images'
  | 'Generating PDF'
  | 'Uploading Images'
  | 'Clearing Images'
  | null;

export interface LoadingState {
  loadingTask: LoadingTask;
  progress: number;
  onCancel: (() => void) | null;
}

export const defaultLoadingState: LoadingState = {
  loadingTask: null,
  progress: 0,
  onCancel: null,
};

@Injectable({
  providedIn: 'root',
})
export class LoadingService {
  private _state = signal<LoadingState>(defaultLoadingState);
  state = this._state.asReadonly();

  setLoadingTask(loadingTask: LoadingTask) {
    this._state.update(state => ({ ...state, loadingTask, progress: 0, onCancel: null }));
  }

  setProgress(progress: number) {
    this._state.update(state => ({ ...state, progress }));
  }

  setOnCancel(onCancel: (() => void) | null) {
    this._state.update(state => ({ ...state, onCancel }));
  }
}
