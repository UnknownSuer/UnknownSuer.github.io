/**
 * Контент фоновой мозаики хиро.
 *
 * Геометрия построена как настоящий бесшовный пазл из прямоугольников 16:9 и
 * 9:16. В каждой макро-колонке узкая дорожка содержит 9 вертикальных плиток
 * 9:16, а широкая — 16 горизонтальных 16:9. Обе дорожки имеют одинаковую
 * высоту (144 условных единицы), поэтому между элементами не появляются дыры.
 *
 * Для замены контента меняйте только `poster` / `video` у конкретной плитки —
 * размеры и раскладка останутся прежними.
 */

export interface HeroTile {
  poster: string;
  video?: string;
}

export interface HeroPuzzleColumn {
  portraitFirst: boolean;
  portraitTiles: HeroTile[];
  landscapeTiles: HeroTile[];
  duration: number;
  delay: number;
}

const poster = (n: number) => `/media/posters/p${String(n).padStart(2, "0")}.svg`;
const tile = (n: number): HeroTile => ({ poster: poster(n) });

const cycle = (seed: number, count: number) =>
  Array.from({ length: count }, (_, index) => tile(((seed + index * 5) % 12) + 1));

/**
 * Семь независимых колонок закрывают широкий десктоп и с запасом уходят за
 * края экрана. Отрицательный delay запускает их с разных позиций цикла.
 */
export const HERO_COLUMNS: HeroPuzzleColumn[] = [
  { portraitFirst: true, portraitTiles: cycle(0, 9), landscapeTiles: cycle(3, 16), duration: 78, delay: -21 },
  { portraitFirst: false, portraitTiles: cycle(4, 9), landscapeTiles: cycle(8, 16), duration: 92, delay: -47 },
  { portraitFirst: true, portraitTiles: cycle(7, 9), landscapeTiles: cycle(1, 16), duration: 84, delay: -12 },
  { portraitFirst: false, portraitTiles: cycle(2, 9), landscapeTiles: cycle(10, 16), duration: 106, delay: -63 },
  { portraitFirst: true, portraitTiles: cycle(9, 9), landscapeTiles: cycle(5, 16), duration: 88, delay: -34 },
  { portraitFirst: false, portraitTiles: cycle(5, 9), landscapeTiles: cycle(0, 16), duration: 98, delay: -55 },
  { portraitFirst: true, portraitTiles: cycle(11, 9), landscapeTiles: cycle(6, 16), duration: 82, delay: -27 },
];
