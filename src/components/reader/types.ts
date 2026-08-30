export type ReaderPage = {
  id: string;
  imageUrl: string;
  order: number;
  width: number | null;
  height: number | null;
  blurData: string | null;
};

export type ReaderChapter = {
  id: string;
  number: number;
  title: string | null;
  pages: ReaderPage[];
};

export type ChapterStub = {
  id: string;
  number: number;
  title: string | null;
};

export type ReaderSettings = {
  mode: 'vertical' | 'paginated';
  /** Percentage of the container width the page images occupy. */
  imageWidth: number;
  /** 0.4–1: multiplies a black overlay for night reading. */
  brightness: number;
  tapZones: boolean;
};

export const DEFAULT_SETTINGS: ReaderSettings = {
  mode: 'vertical',
  imageWidth: 100,
  brightness: 1,
  tapZones: true,
};

export const SETTINGS_KEY = 'manman:reader-settings';
export const LAST_READ_KEY = 'manman:last-read';
export const GUEST_PROGRESS_KEY = 'manman:progress';
