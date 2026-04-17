import type { StudyLevel } from "../types/product.types";

export const STUDY_LEVEL_LABELS: Record<StudyLevel, string> = {
  undergraduate: "Undergraduate",
  postgraduate: "Postgraduate",
  certificate: "Certificate",
  diploma: "Diploma",
};

export function formatFees(amount: number, currency: string): string {
  return new Intl.NumberFormat(undefined, {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
}
