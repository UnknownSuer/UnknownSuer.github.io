/** Направления работы студии — общие для курсов и портфолио. */
export type Direction = "vfx" | "cgi" | "ugc";

export const DIRECTION_LABELS: Record<Direction, string> = {
  vfx: "VFX",
  cgi: "CGI / 3D",
  ugc: "UGC",
};

export const DIRECTION_FILTERS: Array<{ value: Direction | "all"; label: string }> = [
  { value: "all", label: "Все" },
  { value: "vfx", label: "VFX" },
  { value: "cgi", label: "CGI" },
  { value: "ugc", label: "UGC" },
];
