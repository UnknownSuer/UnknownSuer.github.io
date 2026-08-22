"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useAppDispatch } from "@/shared/store/hooks";
import { setCookieConsent, type CookieConsent } from "@/shared/store/ui-slice";
import { Button } from "@/shared/ui/Button";

const STORAGE_KEY = "angar:cookie-consent";

export function CookieBanner() {
  const dispatch = useAppDispatch();
  const [visible, setVisible] = useState(false);
  const [liftBy, setLiftBy] = useState(0);

  useEffect(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored === "all" || stored === "necessary") {
      dispatch(setCookieConsent(stored));
    } else {
      setVisible(true);
    }
  }, [dispatch]);

  /**
   * На странице курса внизу висит панель «Купить курс». Полноширинный баннер
   * ложился прямо на неё и до принятия cookie кнопка покупки не нажималась.
   * Поэтому баннер приподнимается ровно на высоту такой панели.
   */
  useEffect(() => {
    if (!visible) return;

    const measure = () => {
      const cta = document.querySelector<HTMLElement>("[data-sticky-cta]");
      if (!cta || getComputedStyle(cta).display === "none") {
        setLiftBy(0);
        return;
      }
      setLiftBy(cta.getBoundingClientRect().height);
    };

    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [visible]);

  const choose = (value: Exclude<CookieConsent, "unknown">) => {
    window.localStorage.setItem(STORAGE_KEY, value);
    dispatch(setCookieConsent(value));
    setVisible(false);
    // TODO(аналитика): включать self-hosted Matomo/Plausible только при value === "all".
  };

  if (!visible) return null;

  return (
    <div
      role="region"
      aria-label="Согласие на использование cookie"
      style={{ bottom: `calc(1rem + ${liftBy}px)` }}
      className="fixed left-4 right-4 z-[60] rounded-xl border border-ink/10 bg-white p-4 shadow-lift sm:right-auto sm:max-w-sm sm:p-5"
    >
      <p className="text-sm leading-relaxed text-ink/80">
        Используем cookie: необходимые — для работы сайта, аналитические — только
        с вашего согласия. Подробнее — в{" "}
        <Link href="/legal/cookies" className="underline underline-offset-2">
          cookie-policy
        </Link>
        .
      </p>
      <div className="mt-4 flex flex-wrap gap-2">
        <Button size="sm" onClick={() => choose("all")}>
          Принять все
        </Button>
        <Button size="sm" variant="outline" onClick={() => choose("necessary")}>
          Только необходимые
        </Button>
      </div>
    </div>
  );
}
