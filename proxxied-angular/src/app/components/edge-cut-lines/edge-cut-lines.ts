import { Component, computed, inject, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SettingsService } from '../../store/settings';

@Component({
  selector: 'app-edge-cut-lines',
  imports: [CommonModule],
  templateUrl: './edge-cut-lines.html',
  styleUrl: './edge-cut-lines.scss',
})
export class EdgeCutLinesComponent {
  private settingsService = inject(SettingsService);

  totalCardWidthMm = input.required<number>();
  totalCardHeightMm = input.required<number>();
  baseCardWidthMm = input.required<number>();
  baseCardHeightMm = input.required<number>();
  bleedEdgeWidthMm = input.required<number>();

  bleedEdge = this.settingsService.state.asReadonly().bleedEdge;
  guideWidth = this.settingsService.state.asReadonly().guideWidth;
  pageSizeUnit = this.settingsService.state.asReadonly().pageSizeUnit;
  pageWidth = this.settingsService.state.asReadonly().pageWidth;
  pageHeight = this.settingsService.state.asReadonly().pageHeight;
  columns = this.settingsService.state.asReadonly().columns;
  rows = this.settingsService.state.asReadonly().rows;
  cardSpacingMm = this.settingsService.state.asReadonly().cardSpacingMm;

  pageWidthMm = computed(() => this.pageSizeUnit() === 'mm' ? this.pageWidth() : this.pageWidth() * 25.4);
  pageHeightMm = computed(() => this.pageSizeUnit() === 'mm' ? this.pageHeight() : this.pageHeight() * 25.4);

  gridWidthMm = computed(() => this.columns() * this.totalCardWidthMm() + Math.max(0, this.columns() - 1) * this.cardSpacingMm());
  gridHeightMm = computed(() => this.rows() * this.totalCardHeightMm() + Math.max(0, this.rows() - 1) * this.cardSpacingMm());

  startXmm = computed(() => (this.pageWidthMm() - this.gridWidthMm()) / 2);
  startYmm = computed(() => (this.pageHeightMm() - this.gridHeightMm()) / 2);

  cutInX = computed(() => this.bleedEdgeWidthMm());
  cutOutX = computed(() => this.bleedEdgeWidthMm() + this.baseCardWidthMm());
  cutInY = computed(() => this.bleedEdgeWidthMm());
  cutOutY = computed(() => this.bleedEdgeWidthMm() + this.baseCardHeightMm());

  xCuts = computed(() => {
    const cuts = new Set<number>();
    for (let c = 0; c < this.columns(); c++) {
      const cellLeft = this.startXmm() + c * (this.totalCardWidthMm() + this.cardSpacingMm());
      cuts.add(cellLeft + this.cutInX());
      cuts.add(cellLeft + this.cutOutX());
    }
    return [...cuts];
  });

  yCuts = computed(() => {
    const cuts = new Set<number>();
    for (let r = 0; r < this.rows(); r++) {
      const cellTop = this.startYmm() + r * (this.totalCardHeightMm() + this.cardSpacingMm());
      cuts.add(cellTop + this.cutInY());
      cuts.add(cellTop + this.cutOutY());
    }
    return [...cuts];
  });

  stubH = computed(() => this.startYmm() + this.cutInY());
  stubW = computed(() => this.startXmm() + this.cutInX());
}
