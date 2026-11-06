/**
 * Analytics Formatting Utilities
 */

/**
 * Format currency in LKR or selected currency code.
 * E.g., 84200000 -> "LKR 84.2M", 6744 -> "LKR 6,744", 2400000 -> "LKR 2.4M"
 */
export function formatCurrency(amount, currencyCode = "LKR", compact = true) {
  if (amount === null || amount === undefined || isNaN(Number(amount))) {
    return "Not Available";
  }

  const num = Number(amount);

  if (compact) {
    if (Math.abs(num) >= 1_000_000_000) {
      return `${currencyCode} ${(num / 1_000_000_000).toFixed(2)}B`;
    }
    if (Math.abs(num) >= 1_000_000) {
      const formatted = (num / 1_000_000)
        .toFixed(2)
        .replace(/\.?0+$/, "");
      return `${currencyCode} ${formatted}M`;
    }
    if (Math.abs(num) >= 100_000) {
      return `${currencyCode} ${(num / 1_000).toFixed(0)}K`;
    }
  }

  return `${currencyCode} ${new Intl.NumberFormat("en-LK", {
    maximumFractionDigits: 2,
  }).format(num)}`;
}

/**
 * Format count numbers (e.g. 12486 -> "12,486", 1820000 -> "1.82M")
 */
export function formatCount(count, compact = false) {
  if (count === null || count === undefined || isNaN(Number(count))) {
    return "Not Available";
  }

  const num = Number(count);

  if (compact) {
    if (Math.abs(num) >= 1_000_000) {
      return `${(num / 1_000_000).toFixed(2).replace(/\.00$/, "")}M`;
    }
    if (Math.abs(num) >= 10_000) {
      return `${(num / 1_000).toFixed(1).replace(/\.0$/, "")}K`;
    }
  }

  return new Intl.NumberFormat("en-US").format(num);
}

/**
 * Format percentages (e.g. 0.938 -> "93.8%", 38.6 -> "38.6%")
 */
export function formatPercent(value, isFraction = false, decimalPlaces = 1) {
  if (value === null || value === undefined || isNaN(Number(value))) {
    return "Not Available";
  }

  const num = isFraction ? Number(value) * 100 : Number(value);
  return `${num.toFixed(decimalPlaces)}%`;
}

/**
 * Format durations (e.g. 18 -> "18 mins", 6.4 -> "6.4 Hours", 3.4 -> "3.4 Days")
 */
export function formatDuration(value, unit = "mins") {
  if (value === null || value === undefined || isNaN(Number(value))) {
    return "Not Available";
  }
  return `${value} ${unit}`;
}

/**
 * Format trend percentage badge text (e.g. "+12.4%", "-0.6%", "+6")
 */
export function formatTrendText(percentage, isAbsoluteCount = false) {
  if (percentage === null || percentage === undefined || isNaN(Number(percentage))) {
    return "";
  }
  const val = Number(percentage);
  const sign = val > 0 ? "+" : "";
  if (isAbsoluteCount) {
    return `${sign}${val}`;
  }
  return `${sign}${val.toFixed(1)}%`;
}
