export const CATEGORIES = [
  "نوشیدنی گرم",
  "نوشیدنی سرد",
  "کیک و دسر",
  "غذا",
] as const;

export type Category = (typeof CATEGORIES)[number];
