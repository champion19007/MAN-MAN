'use client';

import Link from 'next/link';
import { useState } from 'react';
import type { ChapterStub, ReaderSettings } from './types';

type Props = {
  visible: boolean;
  seriesSlug: string;
  seriesTitle: string;
  chapters: ChapterStub[];
  activeNumber: number;
  activeTitle: string | null;
  prevNumber: number | null;
  nextNumber: number | null;
  progress: number;
  settings: ReaderSettings;
  onSettingsChange: (patch: Partial<ReaderSettings>) => void;
  onNavigate: (number: number) => void;
};

export function ReaderChrome({
  visible,
  seriesSlug,
  seriesTitle,
  chapters,
  activeNumber,
  activeTitle,
  prevNumber,
  nextNumber,
  progress,
  settings,
  onSettingsChange,
  onNavigate,
}: Props) {
  const [settingsOpen, setSettingsOpen] = useState(false);
  const shown = visible || settingsOpen;

  return (
    <>
      <header
        className={`fixed inset-x-0 top-0 z-40 border-b border-white/10 bg-black/80 backdrop-blur transition-transform duration-200 ${
          shown ? 'translate-y-0' : '-translate-y-full'
        }`}
      >
        <div className="mx-auto flex h-14 max-w-4xl items-center gap-2 px-3">
          <Link
            href={`/series/${seriesSlug}`}
            aria-label="Back to series"
            className="rounded-lg px-2 py-1.5 text-white/80 hover:text-white"
          >
            ‹
          </Link>

          <div className="min-w-0 flex-1">
            <Link
              href={`/series/${seriesSlug}`}
              className="block truncate text-sm font-medium text-white"
            >
              {seriesTitle}
            </Link>
            <p className="truncate text-xs text-white/60">
              Chapter {activeNumber}
              {activeTitle ? ` — ${activeTitle}` : ''}
            </p>
          </div>

          <label className="sr-only" htmlFor="chapter-select">
            Select chapter
          </label>
          <select
            id="chapter-select"
            value={activeNumber}
            onChange={(event) => onNavigate(Number(event.target.value))}
            className="max-w-[8rem] rounded-lg border border-white/15 bg-black/60 px-2 py-1.5 text-sm text-white"
          >
            {[...chapters].reverse().map((chapter) => (
              <option key={chapter.id} value={chapter.number}>
                Ch. {chapter.number}
              </option>
            ))}
          </select>

          <button
            type="button"
            aria-label="Reader settings"
            aria-expanded={settingsOpen}
            onClick={() => setSettingsOpen((open) => !open)}
            className="rounded-lg px-2 py-1.5 text-white/80 hover:text-white"
          >
            ⚙
          </button>
        </div>
      </header>

      <footer
        className={`fixed inset-x-0 bottom-0 z-40 border-t border-white/10 bg-black/80 backdrop-blur transition-transform duration-200 ${
          shown ? 'translate-y-0' : 'translate-y-full'
        }`}
      >
        <div
          className="h-1 w-full bg-white/10"
          role="progressbar"
          aria-label="Chapter progress"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={Math.round(progress * 100)}
        >
          <div
            className="h-full bg-indigo-500 transition-[width] duration-150"
            style={{ width: `${Math.min(100, Math.max(0, progress * 100))}%` }}
          />
        </div>

        <div className="mx-auto flex h-14 max-w-4xl items-center justify-between gap-2 px-3">
          <button
            type="button"
            disabled={prevNumber === null}
            onClick={() => prevNumber !== null && onNavigate(prevNumber)}
            className="rounded-lg border border-white/15 px-3 py-1.5 text-sm text-white disabled:opacity-30"
          >
            ‹ Prev
          </button>
          <span className="text-xs text-white/60">
            {Math.round(progress * 100)}%
          </span>
          <button
            type="button"
            disabled={nextNumber === null}
            onClick={() => nextNumber !== null && onNavigate(nextNumber)}
            className="rounded-lg border border-white/15 px-3 py-1.5 text-sm text-white disabled:opacity-30"
          >
            Next ›
          </button>
        </div>
      </footer>

      {settingsOpen ? (
        <div
          className="fixed inset-0 z-50 flex justify-end bg-black/50"
          onClick={() => setSettingsOpen(false)}
        >
          <div
            className="h-full w-80 max-w-[85vw] space-y-6 overflow-y-auto border-l border-white/10 bg-neutral-950 p-5 text-white"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <h2 className="text-base font-semibold">Reader settings</h2>
              <button
                type="button"
                onClick={() => setSettingsOpen(false)}
                aria-label="Close settings"
                className="text-white/60 hover:text-white"
              >
                ✕
              </button>
            </div>

            <fieldset>
              <legend className="mb-2 text-xs uppercase tracking-wider text-white/50">
                Reading mode
              </legend>
              <div className="grid grid-cols-2 gap-2">
                {(['vertical', 'paginated'] as const).map((mode) => (
                  <button
                    key={mode}
                    type="button"
                    onClick={() => onSettingsChange({ mode })}
                    className={`rounded-lg border px-3 py-2 text-sm capitalize ${
                      settings.mode === mode
                        ? 'border-indigo-500 bg-indigo-500/20'
                        : 'border-white/15'
                    }`}
                  >
                    {mode === 'vertical' ? 'Long strip' : 'Paged'}
                  </button>
                ))}
              </div>
            </fieldset>

            <div>
              <label
                htmlFor="image-width"
                className="mb-2 block text-xs uppercase tracking-wider text-white/50"
              >
                Image width — {settings.imageWidth}%
              </label>
              <input
                id="image-width"
                type="range"
                min={40}
                max={100}
                step={5}
                value={settings.imageWidth}
                onChange={(event) =>
                  onSettingsChange({ imageWidth: Number(event.target.value) })
                }
                className="w-full"
              />
            </div>

            <div>
              <label
                htmlFor="brightness"
                className="mb-2 block text-xs uppercase tracking-wider text-white/50"
              >
                Brightness — {Math.round(settings.brightness * 100)}%
              </label>
              <input
                id="brightness"
                type="range"
                min={0.4}
                max={1}
                step={0.05}
                value={settings.brightness}
                onChange={(event) =>
                  onSettingsChange({ brightness: Number(event.target.value) })
                }
                className="w-full"
              />
            </div>

            <label className="flex items-center justify-between gap-3 text-sm">
              <span>Tap zones</span>
              <input
                type="checkbox"
                checked={settings.tapZones}
                onChange={(event) =>
                  onSettingsChange({ tapZones: event.target.checked })
                }
                className="h-4 w-4"
              />
            </label>

            <p className="text-xs leading-relaxed text-white/40">
              Tap the middle of the page to hide these bars. Swipe left or right to
              move between chapters.
            </p>
          </div>
        </div>
      ) : null}
    </>
  );
}
