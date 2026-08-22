import { Container } from "@/shared/ui/Container";
import { ButtonLink } from "@/shared/ui/Button";

export default function NotFound() {
  return (
    <Container className="flex min-h-[70svh] flex-col items-center justify-center py-20 text-center">
      <p className="font-mono text-xs uppercase tracking-[0.3em] text-ember">
        Error_404
      </p>
      <h1 className="mt-5 font-display text-3xl font-bold uppercase tracking-tight text-ink md:text-5xl">
        Кадр не найден
      </h1>
      <p className="mt-4 max-w-md text-sm leading-relaxed text-muted">
        Такой страницы нет — возможно, её вырезали на монтаже. Проверьте адрес
        или вернитесь на главную.
      </p>
      <ButtonLink href="/" className="mt-8">
        На главную
      </ButtonLink>
    </Container>
  );
}
