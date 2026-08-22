const ITEMS = [
  "VFX-визуализация",
  "CGI-продакшн",
  "UGC-контент",
  "Обучение",
  "3D / FOOH",
  "Моушн-дизайн",
];

function TickerHalf() {
  return (
    <div className="flex shrink-0 items-center">
      {ITEMS.map((item) => (
        <span
          key={item}
          className="flex items-center whitespace-nowrap font-display text-lg font-medium uppercase tracking-wide text-ink/70 md:text-2xl"
        >
          <span className="px-6 md:px-8">{item}</span>
          <span aria-hidden="true" className="text-sm text-ember">
            ◆
          </span>
        </span>
      ))}
    </div>
  );
}

/** Горизонтальный бегущий тикер направлений (SSTR-приём). */
export function Ticker() {
  return (
    <div
      className="overflow-hidden border-y border-ink/10 bg-warm py-4"
      aria-hidden="true"
    >
      <div className="ticker-track flex w-max">
        <TickerHalf />
        <TickerHalf />
      </div>
    </div>
  );
}
