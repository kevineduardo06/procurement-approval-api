export function requiredApprovalsForAmount(totalCents: number): number {
  if (totalCents >= 1_000_000) return 2;
  if (totalCents >= 250_000) return 1;
  return 0;
}
