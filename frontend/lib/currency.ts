/**
 * Centralized currency formatting utility for GrowSuite.
 * Defaults to INR as per current development data.
 * Will later be connected to Workspace Settings.
 */
export function formatCurrency(amount: number, currency: string = "INR"): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}
