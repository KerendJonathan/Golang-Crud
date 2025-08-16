export function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

export function formatNpm(npm: string) {
  return npm?.trim() || "";
}
