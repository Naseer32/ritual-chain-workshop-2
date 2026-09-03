export function shortenAddress(addr: string): string {
  return addr.slice(0, 6) + "..." + addr.slice(-4);
}

export function formatEtherValue(wei: bigint | number | string): string {
  const n = typeof wei === "bigint" ? wei : BigInt(wei);
  const ether = Number(n) / 1e18;
  return ether.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 6 });
}

export const MARKET_STATE_LABELS = ["Open", "Closed", "Resolving", "Resolved", "Invalid"] as const;
export const OUTCOME_LABELS = ["Unresolved", "Yes", "No"] as const;
export const COMPARATOR_LABELS = [">", "≥", "<", "≤"] as const;

export function getStateBadgeClass(state: number): string {
  const c: Record<number, string> = {
    0: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    1: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    2: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    3: "bg-ritual-500/10 text-ritual-400 border-ritual-500/20",
    4: "bg-red-500/10 text-red-400 border-red-500/20",
  };
  return c[state] ?? "bg-gray-500/10 text-gray-400";
}

export function getOutcomeColor(outcome: number): string {
  const c: Record<number, string> = { 0: "text-gray-400", 1: "text-emerald-400", 2: "text-rose-400" };
  return c[outcome] ?? "text-gray-400";
}
