import { ButtonLink } from "@/shared/ui/Button";

const STUDIO_LAT = 43.199864;
const STUDIO_LON = 46.863486;
const TWO_GIS_URL =
  "https://2gis.ru/kizilyurt/search/43.199864%2C%2046.863486";
const OSM_EMBED_URL =
  "https://www.openstreetmap.org/export/embed.html?bbox=46.854486%2C43.193864%2C46.872486%2C43.205864&layer=mapnik&marker=43.199864%2C46.863486";

/**
 * Карта на странице «Контакты».
 * Если задан NEXT_PUBLIC_2GIS_EMBED_URL — используем официальный 2ГИС-виджет.
 * Иначе показываем карту с точным маркером по указанным координатам и даём
 * прямую ссылку на эту же точку в 2ГИС.
 */
export function MapPanel() {
  const embedUrl = process.env.NEXT_PUBLIC_2GIS_EMBED_URL;

  return (
    <div className="overflow-hidden rounded-2xl border border-ink/10 bg-warm">
      <iframe
        src={embedUrl || OSM_EMBED_URL}
        title="Карта: студия АНГАР, Кизилюрт"
        loading="lazy"
        allowFullScreen
        className="aspect-[4/3] w-full border-0 bg-warm"
      />
      <div className="flex flex-col gap-4 border-t border-ink/10 bg-white p-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted">
            Точка студии
          </p>
          <p className="mt-1 text-sm font-medium text-ink">
            {STUDIO_LAT}, {STUDIO_LON}
          </p>
          <p className="mt-1 text-xs text-muted">Серый ангар у перекрестка</p>
        </div>
        <ButtonLink
          href={TWO_GIS_URL}
          target="_blank"
          rel="noopener noreferrer"
          variant="outline"
          size="sm"
          className="shrink-0 bg-white"
        >
          Открыть в 2ГИС ↗
        </ButtonLink>
      </div>
    </div>
  );
}
