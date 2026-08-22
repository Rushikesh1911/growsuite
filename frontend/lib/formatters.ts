export function formatDate(dateString: string | Date): string {
  if (!dateString) return "-";
  try {
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }).format(new Date(dateString));
  } catch (e) {
    return String(dateString);
  }
}

export function formatEnum(enumString: string): string {
  if (!enumString) return "";
  return enumString
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
}
