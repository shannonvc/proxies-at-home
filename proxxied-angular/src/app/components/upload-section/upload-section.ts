import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { CardsService } from '../../store/cards';
import { LoadingService } from '../../store/loading';
import { SettingsService } from '../../store/settings';
import { LANGUAGE_OPTIONS } from '../../constants';
import { CardOption } from '../../store/card.types';
import axios from 'axios';
import { imageProcessor } from '../../helpers/imageProcessor';
import { getMpcImageUrl, inferCardNameFromFilename, parseMpcText, tryParseMpcSchemaXml } from '../../helpers/Mpc';
import { cardKey, CardInfo, parseDeckToInfos } from '../../helpers/CardInfoHelper';

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

  async addUploadedFiles(files: FileList, opts: { hasBakedBleed: boolean }) {
    const fileArray = Array.from(files);
    const startIndex = this.cardsService.state().cards.length;

    const newCards: CardOption[] = fileArray.map((file, i) => ({
      name:
        inferCardNameFromFilename(file.name) ||
        `Custom Art ${startIndex + i + 1}`,
      imageUrls: [],
      uuid: crypto.randomUUID(),
      isUserUpload: true,
      hasBakedBleed: opts.hasBakedBleed,
    }));

    this.cardsService.appendCards(newCards);

    const originalsUpdate: Record<string, string> = {};
    const processedUpdate: Record<string, string> = {};

    await Promise.all(
      fileArray.map(async (file, i) => {
        const base64 = await new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result as string);
          reader.readAsDataURL(file);
        });

        const { originalBase64, withBleedBase64 } = await this.processToWithBleed(
          base64,
          opts
        );

        const id = newCards[i].uuid;
        originalsUpdate[id] = originalBase64;
        processedUpdate[id] = withBleedBase64;
      })
    );

    this.cardsService.appendOriginalSelectedImages(originalsUpdate);
    this.cardsService.appendSelectedImages(processedUpdate);
  }

  async processToWithBleed(
    srcBase64: string,
    opts: { hasBakedBleed: boolean }
  ) {
    const { processedBlob, error } = await imageProcessor.process({
      uuid: crypto.randomUUID(),
      url: srcBase64,
      bleedEdgeWidth: this.settingsService.state().bleedEdgeWidth,
      unit: 'mm',
      apiBase: 'http://localhost:3000', // TODO: Get from environment
      isUserUpload: true,
      hasBakedBleed: opts.hasBakedBleed,
    });

    if (error) {
      throw new Error(error);
    }

    const withBleedBase64 = URL.createObjectURL(processedBlob);
    return { originalBase64: srcBase64, withBleedBase64 };
  }

  async handleUploadMpcFill(event: Event) {
    this.loadingService.setLoadingTask('Uploading Images');

    try {
      const files = (event.target as HTMLInputElement).files;
      if (files && files.length) {
        await this.addUploadedFiles(files, { hasBakedBleed: true });
      }
    } finally {
      if (event.target) (event.target as HTMLInputElement).value = '';

      this.loadingService.setLoadingTask(null);
    }
  }

  async handleImportMpcXml(event: Event) {
    try {
      const file = (event.target as HTMLInputElement).files?.[0];
      if (!file) return;

      const raw = await new Promise<string>((resolve) => {
        const r = new FileReader();
        r.onloadend = () => resolve(String(r.result || ''));
        r.readAsText(file);
      });

      const schemaItems = tryParseMpcSchemaXml(raw);
      const items =
        schemaItems && schemaItems.length ? schemaItems : parseMpcText(raw);

      const newCards: CardOption[] = [];
      const newOriginals: Record<string, string> = {};

      for (const it of items) {
        for (let i = 0; i < (it.qty || 1); i++) {
          const uuid = crypto.randomUUID();
          const name =
            it.name ||
            (it.filename
              ? inferCardNameFromFilename(it.filename)
              : 'Custom Art');

          newCards.push({
            uuid,
            name,
            imageUrls: [],
            isUserUpload: true,
            hasBakedBleed: true,
          });

          const mpcUrl = getMpcImageUrl(it.frontId);
          if (mpcUrl) {
            newOriginals[uuid] = mpcUrl;
          }
        }
      }

      this.cardsService.appendCards(newCards);
      if (Object.keys(newOriginals).length) {
        this.cardsService.appendOriginalSelectedImages(newOriginals);
      }
    } finally {
      if (event.target) (event.target as HTMLInputElement).value = '';
    }
  }

  async handleUploadStandard(event: Event) {
    this.loadingService.setLoadingTask('Uploading Images');

    try {
      const files = (event.target as HTMLInputElement).files;
      if (files && files.length) {
        await this.addUploadedFiles(files, { hasBakedBleed: false });
      }
    } finally {
      if (event.target) (event.target as HTMLInputElement).value = '';

      this.loadingService.setLoadingTask(null);
    }
  }

  async handleSubmit() {
    this.loadingService.setLoadingTask('Fetching cards');

    try {
      const infos = parseDeckToInfos(this.deckText || '');
      if (!infos.length) {
        this.loadingService.setLoadingTask(null);
        return;
      }

      const uniqueMap = new Map<string, CardInfo>();
      for (const ci of infos) uniqueMap.set(cardKey(ci), ci);
      const uniqueInfos = Array.from(uniqueMap.values());
      const uniqueNames = Array.from(new Set(uniqueInfos.map((ci) => ci.name)));

      try {
        await axios.delete(`http://localhost:3000/api/cards/images`, { timeout: 15000 });
      } catch (e) {
        console.warn('[FetchCards] DELETE failed (continuing):', e);
      }

      const response = await fetch(
        `http://localhost:3000/api/cards/images/images-stream`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            cardQueries: uniqueInfos,
            cardNames: uniqueNames,
            cardArt: 'art',
            language: this.globalLanguage,
          }),
        }
      );

      if (!response.body) {
        throw new Error('Missing response body from stream');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';
      const fetchedCards: CardOption[] = [];
      const fetchErrors: string[] = [];

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';
        let event = '';
        let data = '';
        for (const line of lines) {
          if (line.startsWith('event: ')) {
            event = line.substring(7).trim();
          } else if (line.startsWith('data: ')) {
            data = line.substring(6);
          } else if (line === '') {
            if (event === 'progress') {
              const { progress, total } = JSON.parse(data);
              const percent =
                total > 0 ? Math.round((progress / total) * 100) : 0;
              this.loadingService.setProgress(percent);
            } else if (event === 'card') {
              fetchedCards.push(JSON.parse(data));
            } else if (event === 'card-error') {
              const { name } = JSON.parse(data);
              fetchErrors.push(name);
            } else if (event === 'end') {
              reader.cancel();
              break;
            }
            event = '';
            data = '';
          }
        }
      }

      if (!fetchedCards.length) {
        if (fetchErrors.length > 0) {
          throw new Error(
            `Failed to find images for the following cards: ${fetchErrors.join(
              ', '
            )}`
          );
        }
        throw new Error('No images found for the provided list.');
      }

      const optionByKey: Record<string, CardOption> = {};
      for (const opt of fetchedCards) {
        if (!opt?.name) continue;
        const k = `${opt.name.toLowerCase()}|${opt.set ?? ''}|${
          opt.number ?? ''
        }`;
        optionByKey[k] = opt;
        const nameOnlyKey = `${opt.name.toLowerCase()}||`;
        if (!optionByKey[nameOnlyKey]) optionByKey[nameOnlyKey] = opt;
      }

      const expandedCards: CardOption[] = infos.map((ci) => {
        const k = cardKey(ci);
        const fallbackK = `${ci.name.toLowerCase()}||`;
        const card = optionByKey[k] ?? optionByKey[fallbackK];
        return {
          ...(card ?? { name: ci.name, imageUrls: [] }),
          uuid: crypto.randomUUID(),
        } as CardOption;
      });

      this.cardsService.appendCards(expandedCards);

      const newOriginals: Record<string, string> = {};
      for (const card of expandedCards) {
        if (card?.imageUrls?.length > 0) {
          newOriginals[card.uuid] = card.imageUrls[0];
        }
      }
      this.cardsService.appendOriginalSelectedImages(newOriginals);

      this.loadingService.setLoadingTask('Processing Images');
      this.loadingService.setProgress(0);

      const imageJobs = Object.entries(newOriginals);
      const totalToProcess = imageJobs.length;
      if (totalToProcess === 0) return;

      const processed: Record<string, string> = {};
      let processedCount = 0;

      const errored = new Set<string>();
      await new Promise<void>((resolve) => {
        const taskQueue = [...imageJobs];
        const maxWorkers = Math.max(
          1,
          (navigator.hardwareConcurrency || 4) - 1
        );
        let activeWorkers = 0;

        const run = () => {
          while (taskQueue.length > 0 && activeWorkers < maxWorkers) {
            const worker = new Worker(
              new URL('../../helpers/bleed.worker.ts', import.meta.url),
              { type: 'module' }
            );
            activeWorkers++;

            const [uuid, url] = taskQueue.shift()!;

            worker.onmessage = (e: MessageEvent) => {
              const { processedBlob, error } = e.data;
              if (error) {
                console.error(`Error processing image ${uuid}:`, error);
                errored.add(uuid);
              } else {
                const objectUrl = URL.createObjectURL(processedBlob);
                processed[uuid] = objectUrl;
              }

              processedCount++;
              this.loadingService.setProgress(
                (processedCount / totalToProcess) * 100
              );

              worker.terminate();
              activeWorkers--;

              if (taskQueue.length === 0 && activeWorkers === 0) {
                resolve();
              } else {
                run();
              }
            };

            worker.onerror = (error) => {
              worker.terminate();
              activeWorkers--;
              // Don't reject, as other images might still be processing
              console.error('Worker error:', error);
              if (taskQueue.length === 0 && activeWorkers === 0) {
                resolve(); // Or reject, depending on desired behavior
              }
            };

            const card = expandedCards.find((c) => c.uuid === uuid);

            worker.postMessage({
              uuid,
              url,
              bleedEdgeWidth: this.settingsService.state().bleedEdgeWidth,
              unit: 'mm',
              apiBase: 'http://localhost:3000', // TODO: Get from environment
              isUserUpload: card?.isUserUpload,
              hasBakedBleed: card?.hasBakedBleed,
            });
          }
        };

        run();
      });

      if (Object.keys(processed).length) {
        this.cardsService.appendSelectedImages(processed);
      }

      this.deckText = '';
    } catch (err: any) {
      console.error('[FetchCards] Error:', err);
      alert(err?.message || 'Something went wrong while fetching cards.');
    } finally {
      this.loadingService.setLoadingTask(null);
    }
  }

  handleClear() {
    this.showClearConfirmModal = true;
  }

  confirmClear() {
    this.cardsService.setCards([]);
    this.showClearConfirmModal = false;
  }
}
