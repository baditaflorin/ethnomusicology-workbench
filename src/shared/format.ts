export const formatSeconds = (seconds: number): string => {
  if (!Number.isFinite(seconds)) {
    return "0:00";
  }
  const minutes = Math.floor(seconds / 60);
  const remaining = Math.round(seconds % 60)
    .toString()
    .padStart(2, "0");
  return `${minutes}:${remaining}`;
};

export const formatNumber = (value: number, digits = 2): string =>
  new Intl.NumberFormat("en", {
    maximumFractionDigits: digits,
    minimumFractionDigits: digits
  }).format(value);

export const formatPercent = (value: number): string =>
  new Intl.NumberFormat("en", {
    style: "percent",
    maximumFractionDigits: 0
  }).format(value);
