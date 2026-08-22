import type { CSSProperties } from "react";
import { VideoTile } from "@/shared/ui/VideoTile";
import {
  HERO_COLUMNS,
  type HeroPuzzleColumn,
  type HeroTile,
} from "@/widgets/hero/tiles";

function PuzzleLane({
  tiles,
  aspect,
}: {
  tiles: HeroTile[];
  aspect: "portrait" | "landscape";
}) {
  return (
    <div className={`hero-puzzle-lane hero-puzzle-lane--${aspect}`}>
      {tiles.map((item, index) => (
        <div
          key={`${item.poster}-${index}`}
          className={`hero-puzzle-tile hero-puzzle-tile--${aspect}`}
        >
          <VideoTile
            poster={item.poster}
            src={item.video}
            className="h-full w-full object-cover"
          />
        </div>
      ))}
    </div>
  );
}

function PuzzleHalf({ column }: { column: HeroPuzzleColumn }) {
  const portrait = <PuzzleLane tiles={column.portraitTiles} aspect="portrait" />;
  const landscape = <PuzzleLane tiles={column.landscapeTiles} aspect="landscape" />;

  return (
    <div className="hero-puzzle-half">
      {column.portraitFirst ? (
        <>
          {portrait}
          {landscape}
        </>
      ) : (
        <>
          {landscape}
          {portrait}
        </>
      )}
    </div>
  );
}

/**
 * Бесконечная вертикальная мозаика: каждая макро-колонка прокручивается со
 * своей скоростью, а плитки внутри неё стыкуются без gap и имеют строго 16:9
 * или 9:16. Две одинаковые половины дают бесшовную петлю.
 */
export function HeroMarquee() {
  return (
    <div className="hero-puzzle absolute inset-0 overflow-hidden bg-tile" aria-hidden="true">
      <div className="absolute left-1/2 top-0 flex h-full min-w-max -translate-x-1/2">
        {HERO_COLUMNS.map((column, index) => (
          <div key={index} className="hero-puzzle-column h-full overflow-hidden">
            <div
              className="marquee-track flex flex-col"
              style={
                {
                  "--marquee-duration": `${column.duration}s`,
                  animationDelay: `${column.delay}s`,
                } as CSSProperties
              }
            >
              <PuzzleHalf column={column} />
              <PuzzleHalf column={column} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
