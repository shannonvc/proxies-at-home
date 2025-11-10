export type LayoutPreset =
  | 'A4'
  | 'A3'
  | 'Letter'
  | 'Tabloid'
  | 'Legal'
  | 'ArchA'
  | 'ArchB'
  | 'SuperB'
  | 'A2'
  | 'A1';
export type PageOrientation = 'portrait' | 'landscape';

export interface SettingsState {
  pageSizeUnit: 'mm' | 'in';
  pageOrientation: PageOrientation;
  pageSizePreset: LayoutPreset;
  pageWidth: number;
  pageHeight: number;
  columns: number;
  rows: number;
  bleedEdgeWidth: number;
  bleedEdge: boolean;
  guideColor: string;
  guideWidth: number;
  zoom: number;
  cardSpacingMm: number;
  cardPositionX: number;
  cardPositionY: number;
  dpi: number;
}

export const defaultPageSettings: SettingsState = {
  pageSizeUnit: 'in',
  pageOrientation: 'portrait',
  pageSizePreset: 'Letter',
  pageWidth: 8.5,
  pageHeight: 11,
  columns: 3,
  rows: 3,
  bleedEdgeWidth: 1,
  bleedEdge: true,
  guideColor: '#39FF14',
  guideWidth: 0.5,
  cardSpacingMm: 0,
  cardPositionX: 0,
  cardPositionY: 0,
  zoom: 1,
  dpi: 900,
};

export const layoutPresetsSizes: Record<
  LayoutPreset,
  { pageWidth: number; pageHeight: number; pageSizeUnit: 'in' | 'mm' }
> = {
  Letter: { pageWidth: 8.5, pageHeight: 11, pageSizeUnit: 'in' },
  Tabloid: { pageWidth: 11, pageHeight: 17, pageSizeUnit: 'in' },
  A4: { pageWidth: 210, pageHeight: 297, pageSizeUnit: 'mm' },
  A3: { pageWidth: 297, pageHeight: 420, pageSizeUnit: 'mm' },
  Legal: { pageWidth: 8.5, pageHeight: 14, pageSizeUnit: 'in' },
  ArchA: { pageWidth: 9, pageHeight: 12, pageSizeUnit: 'in' },
  ArchB: { pageWidth: 12, pageHeight: 18, pageSizeUnit: 'in' },
  SuperB: { pageWidth: 13, pageHeight: 19, pageSizeUnit: 'in' },
  A2: { pageWidth: 420, pageHeight: 594, pageSizeUnit: 'mm' },
  A1: { pageWidth: 594, pageHeight: 841, pageSizeUnit: 'mm' },
};
