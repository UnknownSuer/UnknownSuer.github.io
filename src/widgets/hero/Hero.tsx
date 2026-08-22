import { ButtonLink } from "@/shared/ui/Button";
import { HeroMarquee } from "@/widgets/hero/HeroMarquee";
import { withBasePath } from "@/shared/lib/base-path";

/**
 * Хиро главной: логотип и навигация поверх бесконечной видео-мозаики.
 * Плитки мозаики имеют только 16:9 и 9:16, чтобы реальные ролики можно было
 * менять без перестройки компонента.
 */
export function Hero() {
  return (
    <section className="relative flex min-h-[100svh] items-center justify-center overflow-hidden">
      <HeroMarquee />
      <div className="hero-veil absolute inset-0" aria-hidden="true" />

      <div className="relative z-10 mx-auto flex w-full max-w-5xl flex-col items-center px-4 py-24 text-center sm:px-6 md:py-28">
        <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-ink/60 sm:text-[11px] sm:tracking-[0.3em]">
          Ангар — продакшн Амира Абдурахманова
        </p>

        {/*
          Логотип студии вместо набранного текста. Файл лежит в
          public/media/brand/amigokiz-logo.svg — владелец может заменить его
          своим оригиналом, ничего не трогая в коде. Текст остаётся в h1 для
          поиска и скринридеров.
        */}
        <h1 className="mt-6 w-full">
          <span className="sr-only">AmigoKiz Production</span>
          {/* eslint-disable-next-line @next/next/no-img-element -- SVG не требует оптимизации next/image */}
          <img
            src={withBasePath("/media/brand/amigokiz-logo.svg")}
            alt=""
            width="1456"
            height="639"
            fetchPriority="high"
            className="mx-auto h-auto w-full max-w-[min(100%,44rem)]"
          />
        </h1>

        <p className="mt-7 max-w-xl text-[15px] leading-relaxed text-ink/70 sm:text-base md:text-lg">
          VFX-визуализация, CGI и UGC-контент для брендов. Обучаем тех, кто хочет
          делать так же.
        </p>

        <div className="mt-9 flex w-full flex-col items-center gap-3">
          <div className="flex flex-wrap justify-center gap-3">
            <ButtonLink href="/courses" size="lg">
              Курсы
            </ButtonLink>
            <ButtonLink href="/contacts#brief" size="lg">
              Заказать
            </ButtonLink>
          </div>
          {/* На узких экранах кнопки переносятся, а не уезжают за край. */}
          <div className="flex flex-wrap justify-center gap-2 sm:gap-3">
            <ButtonLink href="/portfolio" variant="outline" size="lg" className="bg-white/70">
              Портфолио
            </ButtonLink>
            <ButtonLink href="/contacts" variant="outline" size="lg" className="bg-white/70">
              Контакты
            </ButtonLink>
            <ButtonLink href="/about" variant="outline" size="lg" className="bg-white/70">
              О нас
            </ButtonLink>
          </div>
        </div>
      </div>

      <p className="absolute bottom-6 left-6 z-10 hidden font-mono text-[10px] uppercase tracking-[0.25em] text-muted md:block">
        Кизилюрт · Дагестан
      </p>
      <p className="absolute bottom-6 right-6 z-10 hidden font-mono text-[10px] uppercase tracking-[0.25em] text-muted md:block">
        VFX / CGI / UGC
      </p>
      <p className="absolute bottom-5 left-1/2 z-10 -translate-x-1/2 font-mono text-[10px] uppercase tracking-[0.25em] text-muted">
        Листай ↓
      </p>
    </section>
  );
}
