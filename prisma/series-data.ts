import { SeriesStatus } from '@prisma/client';

/**
 * Catalogue metadata. Titles, genres and scores are transcribed from the
 * reference screenshots; ratings are the site's own 0-10 scores halved to the
 * 0-5 range this schema stores.
 *
 * Two fields are deliberately NOT filled in:
 *
 *   author/artist - left as "Unknown". Attaching a guessed creator name to a
 *   real work is a false credit, so these wait for the publisher's asset pack.
 *
 *   description - a one-line genre note, not a plot summary. Replace with the
 *   publisher's own copy; do not invent synopses for real titles.
 *
 * Chapter counts are capped at 45 so seeding stays quick - the real counts run
 * into the hundreds and arrive with the real data.
 */
export type SeedSeries = {
  slug: string;
  title: string;
  author: string;
  artist: string;
  status: SeriesStatus;
  genres: string[];
  rating: number;
  views: number;
  chapters: number;
  /** Two hues (0-360) used to generate the placeholder cover gradient. */
  hues: [number, number];
  description: string;
};

const UNKNOWN = 'Unknown';
const pending = (flavour: string) => `${flavour}. Publisher synopsis pending.`;

export const SERIES: SeedSeries[] = [
  {
    slug: 'absolute-sword-sense',
    title: 'Absolute Sword Sense',
    author: UNKNOWN, artist: UNKNOWN,
    status: SeriesStatus.ONGOING,
    genres: ['Action', 'Adventure', 'Murim'],
    rating: 4.8, views: 5_940_000, chapters: 45, hues: [225, 265],
    description: pending('Murim swordsmanship action'),
  },
  {
    slug: 'swordmasters-youngest-son',
    title: "Swordmaster's Youngest Son",
    author: UNKNOWN, artist: UNKNOWN,
    status: SeriesStatus.ONGOING,
    genres: ['Action', 'Fantasy', 'Overpowered'],
    rating: 4.8, views: 5_610_000, chapters: 45, hues: [210, 245],
    description: pending('Fantasy sword fantasy with an overpowered lead'),
  },
  {
    slug: 'surviving-the-game-as-a-barbarian',
    title: 'Surviving The Game as a Barbarian',
    author: UNKNOWN, artist: UNKNOWN,
    status: SeriesStatus.ONGOING,
    genres: ['Action', 'Adventure', 'Comedy'],
    rating: 4.85, views: 5_380_000, chapters: 45, hues: [15, 40],
    description: pending('Game-world action adventure'),
  },
  {
    slug: 'dungeon-odyssey',
    title: 'Dungeon Odyssey',
    author: UNKNOWN, artist: UNKNOWN,
    status: SeriesStatus.ONGOING,
    genres: ['Action', 'Adventure', 'Fantasy'],
    rating: 4.85, views: 5_120_000, chapters: 45, hues: [340, 10],
    description: pending('Dungeon-crawling fantasy action'),
  },
  {
    slug: 'nano-machine',
    title: 'Nano Machine',
    author: UNKNOWN, artist: UNKNOWN,
    status: SeriesStatus.ONGOING,
    genres: ['Action', 'Adventure', 'Murim'],
    rating: 4.7, views: 4_870_000, chapters: 45, hues: [265, 220],
    description: pending('Murim action with a science-fiction edge'),
  },
  {
    slug: 'the-regressed-mercenarys-machinations',
    title: "The Regressed Mercenary's Machinations",
    author: UNKNOWN, artist: UNKNOWN,
    status: SeriesStatus.ONGOING,
    genres: ['Action', 'Fantasy', 'Regression'],
    rating: 4.85, views: 4_640_000, chapters: 45, hues: [200, 235],
    description: pending('Regression fantasy'),
  },
  {
    slug: 'pick-me-up-infinite-gacha',
    title: 'Pick Me Up, Infinite Gacha',
    author: UNKNOWN, artist: UNKNOWN,
    status: SeriesStatus.ONGOING,
    genres: ['Action', 'Fantasy', 'System'],
    rating: 4.9, views: 4_410_000, chapters: 45, hues: [285, 320],
    description: pending('Game-system fantasy'),
  },
  {
    slug: 'return-of-the-mount-hua-sect',
    title: 'Return of the Mount Hua Sect',
    author: UNKNOWN, artist: UNKNOWN,
    status: SeriesStatus.ONGOING,
    genres: ['Action', 'Comedy', 'Murim'],
    rating: 4.9, views: 4_230_000, chapters: 45, hues: [140, 175],
    description: pending('Murim comedy action'),
  },
  {
    slug: 'star-embracing-swordmaster',
    title: 'Star-Embracing Swordmaster',
    author: UNKNOWN, artist: UNKNOWN,
    status: SeriesStatus.ONGOING,
    genres: ['Action', 'Fantasy', 'Adventure'],
    rating: 4.9, views: 4_020_000, chapters: 45, hues: [230, 200],
    description: pending('Sword fantasy adventure'),
  },
  {
    slug: 'surviving-as-a-genius-on-borrowed-time',
    title: 'Surviving as a Genius on Borrowed Time',
    author: UNKNOWN, artist: UNKNOWN,
    status: SeriesStatus.ONGOING,
    genres: ['Action', 'Adventure', 'Drama'],
    rating: 4.8, views: 3_880_000, chapters: 45, hues: [25, 350],
    description: pending('Action drama'),
  },
  {
    slug: 'revenge-of-the-iron-blooded-sword-hound',
    title: 'Revenge of the Iron-Blooded Sword Hound',
    author: UNKNOWN, artist: UNKNOWN,
    status: SeriesStatus.ONGOING,
    genres: ['Action', 'Drama', 'Regression'],
    rating: 4.7, views: 3_690_000, chapters: 45, hues: [205, 250],
    description: pending('Revenge-driven action drama'),
  },
  {
    slug: 'the-return-of-the-crazy-demon',
    title: 'The Return of the Crazy Demon',
    author: UNKNOWN, artist: UNKNOWN,
    status: SeriesStatus.ONGOING,
    genres: ['Action', 'Comedy', 'Murim'],
    rating: 4.9, views: 3_540_000, chapters: 45, hues: [355, 20],
    description: pending('Murim action comedy'),
  },
  {
    slug: 'a-painter-who-draws-dungeons',
    title: 'A Painter Who Draws Dungeons',
    author: UNKNOWN, artist: UNKNOWN,
    status: SeriesStatus.ONGOING,
    genres: ['Action', 'Fantasy', 'System'],
    rating: 4.9, views: 3_360_000, chapters: 22, hues: [45, 30],
    description: pending('Dungeon fantasy'),
  },
  {
    slug: 'player-who-returned-10000-years-later',
    title: 'Player Who Returned 10,000 Years Later',
    author: UNKNOWN, artist: UNKNOWN,
    status: SeriesStatus.ONGOING,
    genres: ['Action', 'Adventure', 'Overpowered'],
    rating: 4.6, views: 3_180_000, chapters: 45, hues: [270, 300],
    description: pending('Returnee fantasy action'),
  },
  {
    slug: 'academys-genius-swordsman',
    title: "Academy's Genius Swordsman",
    author: UNKNOWN, artist: UNKNOWN,
    status: SeriesStatus.ONGOING,
    genres: ['Academy', 'Action', 'Fantasy'],
    rating: 4.6, views: 3_010_000, chapters: 45, hues: [255, 285],
    description: pending('Academy sword fantasy'),
  },
  {
    slug: 'reincarnators-stream',
    title: "Reincarnator's Stream",
    author: UNKNOWN, artist: UNKNOWN,
    status: SeriesStatus.ONGOING,
    genres: ['Action', 'Fantasy', 'Regression'],
    rating: 4.75, views: 2_860_000, chapters: 45, hues: [195, 220],
    description: pending('Reincarnation fantasy'),
  },
  {
    slug: 'reincarnation-of-the-fist-king',
    title: 'Reincarnation of the Fist King',
    author: UNKNOWN, artist: UNKNOWN,
    status: SeriesStatus.ONGOING,
    genres: ['Action', 'Martial Arts', 'Regression'],
    rating: 4.75, views: 2_710_000, chapters: 45, hues: [20, 45],
    description: pending('Martial arts action'),
  },
  {
    slug: 'the-ultimate-shut-in',
    title: 'The Ultimate Shut-In',
    author: UNKNOWN, artist: UNKNOWN,
    status: SeriesStatus.ONGOING,
    genres: ['Action', 'Comedy', 'Fantasy'],
    rating: 4.75, views: 2_580_000, chapters: 45, hues: [290, 250],
    description: pending('Fantasy action comedy'),
  },
  {
    slug: 'a-wimps-strategy-guide-to-conquer-the-tower',
    title: "A Wimp's Strategy Guide to Conquer the Tower",
    author: UNKNOWN, artist: UNKNOWN,
    status: SeriesStatus.ONGOING,
    genres: ['Action', 'Adventure', 'System'],
    rating: 4.7, views: 2_440_000, chapters: 44, hues: [40, 20],
    description: pending('Tower-climbing fantasy'),
  },
  {
    slug: 'genius-martial-arts-trainer',
    title: 'Genius Martial Arts Trainer',
    author: UNKNOWN, artist: UNKNOWN,
    status: SeriesStatus.ONGOING,
    genres: ['Action', 'Martial Arts', 'Murim'],
    rating: 4.65, views: 2_300_000, chapters: 45, hues: [150, 185],
    description: pending('Martial arts training action'),
  },
  {
    slug: 'chronicles-of-the-lazy-sovereign',
    title: 'Chronicles of the Lazy Sovereign',
    author: UNKNOWN, artist: UNKNOWN,
    status: SeriesStatus.ONGOING,
    genres: ['Action', 'Cultivation', 'Murim'],
    rating: 4.65, views: 2_170_000, chapters: 45, hues: [35, 55],
    description: pending('Cultivation action'),
  },
  {
    slug: 'return-of-the-unrivaled-spear-knight',
    title: 'Return of The Unrivaled Spear Knight',
    author: UNKNOWN, artist: UNKNOWN,
    status: SeriesStatus.ONGOING,
    genres: ['Action', 'Fantasy', 'Regression'],
    rating: 4.6, views: 2_040_000, chapters: 45, hues: [215, 190],
    description: pending('Knightly fantasy action'),
  },
  {
    slug: 'the-player-hides-his-past',
    title: 'The Player Hides His Past',
    author: UNKNOWN, artist: UNKNOWN,
    status: SeriesStatus.ONGOING,
    genres: ['Action', 'Fantasy', 'Mystery'],
    rating: 4.6, views: 1_920_000, chapters: 45, hues: [250, 210],
    description: pending('Hunter fantasy with a hidden past'),
  },
  {
    slug: '30-years-since-the-prologue',
    title: '30 Years Since the Prologue',
    author: UNKNOWN, artist: UNKNOWN,
    status: SeriesStatus.ONGOING,
    genres: ['Action', 'Fantasy', 'Regression'],
    rating: 4.6, views: 1_800_000, chapters: 14, hues: [200, 230],
    description: pending('Fantasy regression action'),
  },
  {
    slug: 'the-dark-mages-return-to-enlistment',
    title: "The Dark Mage's Return to Enlistment",
    author: UNKNOWN, artist: UNKNOWN,
    status: SeriesStatus.ONGOING,
    genres: ['Action', 'Fantasy', 'Regression'],
    rating: 4.45, views: 1_690_000, chapters: 45, hues: [300, 275],
    description: pending('Military fantasy action'),
  },
  {
    slug: 'doctors-rebirth',
    title: "Doctor's Rebirth",
    author: UNKNOWN, artist: UNKNOWN,
    status: SeriesStatus.ONGOING,
    genres: ['Action', 'Drama', 'Murim'],
    rating: 4.55, views: 1_570_000, chapters: 45, hues: [160, 130],
    description: pending('Murim drama with a physician lead'),
  },
  {
    slug: 'im-gonna-annihilate-this-land',
    title: "I'm Gonna Annihilate This Land",
    author: UNKNOWN, artist: UNKNOWN,
    status: SeriesStatus.ONGOING,
    genres: ['Action', 'Fantasy', 'Overpowered'],
    rating: 4.25, views: 1_450_000, chapters: 45, hues: [10, 340],
    description: pending('High-power fantasy action'),
  },
  {
    slug: 'the-martial-genius-who-remembers-everything',
    title: 'The Martial Genius Who Remembers Everything',
    author: UNKNOWN, artist: UNKNOWN,
    status: SeriesStatus.ONGOING,
    genres: ['Action', 'Martial Arts', 'Murim'],
    rating: 4.4, views: 1_340_000, chapters: 24, hues: [345, 15],
    description: pending('Murim martial arts action'),
  },
  {
    slug: 'the-dark-swordsman-returns',
    title: 'The Dark Swordsman Returns',
    author: UNKNOWN, artist: UNKNOWN,
    status: SeriesStatus.ONGOING,
    genres: ['Action', 'Fantasy', 'Regression'],
    rating: 4.15, views: 1_230_000, chapters: 45, hues: [355, 330],
    description: pending('Dark fantasy sword action'),
  },
  {
    slug: 'the-regressor-can-make-them-all',
    title: 'The Regressor Can Make Them All',
    author: UNKNOWN, artist: UNKNOWN,
    status: SeriesStatus.ONGOING,
    genres: ['Action', 'Fantasy', 'Regression'],
    rating: 4.0, views: 1_120_000, chapters: 38, hues: [235, 265],
    description: pending('Crafting-focused regression fantasy'),
  },
];
