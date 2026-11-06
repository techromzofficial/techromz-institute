/**
 * Safe calculations for Analytics Dashboard
 */

/**
 * Calculates conversion percentage safely without division-by-zero or NaN errors.
 *
 * @param {number} numerator
 * @param {number} denominator
 * @param {number} [decimalPlaces=2]
 * @returns {number} Percentage value (0..100)
 */
export function calculateConversionRate(numerator, denominator, decimalPlaces = 2) {
  if (
    numerator === null ||
    numerator === undefined ||
    denominator === null ||
    denominator === undefined ||
    Number(denominator) === 0 ||
    isNaN(Number(numerator)) ||
    isNaN(Number(denominator))
  ) {
    return 0;
  }

  const rate = (Number(numerator) / Number(denominator)) * 100;
  return Number(rate.toFixed(decimalPlaces));
}

/**
 * Calculates percentage change between current and previous values safely.
 *
 * @param {number} current
 * @param {number} previous
 * @returns {number|null}
 */
export function calculatePercentageChange(current, previous) {
  if (
    current === null ||
    current === undefined ||
    previous === null ||
    previous === undefined ||
    isNaN(Number(current)) ||
    isNaN(Number(previous))
  ) {
    return null;
  }

  const prev = Number(previous);
  if (prev === 0) {
    return Number(current) > 0 ? 100 : 0;
  }

  return Number((((Number(current) - prev) / Math.abs(prev)) * 100).toFixed(1));
}

/**
 * Metrics where an INCREASE is BAD (negative trend) and a DECREASE is GOOD (positive trend).
 */
export const INVERSE_METRICS = new Set([
  "failed-payments",
  "return-rate",
  "high-risk-events",
  "sla-breaches",
  "delivery-exceptions",
  "failed-deliveries",
  "cancellation-rate",
  "conflict-rate",
  "expiry-exposure",
]);

/**
 * Evaluates semantic status ("positive", "negative", "neutral") based on metric ID and direction.
 *
 * @param {string} metricId
 * @param {number} changeAmount Or percentage change
 * @returns {"positive"|"negative"|"neutral"}
 */
export function getTrendSemanticStatus(metricId, changeAmount) {
  if (changeAmount === null || changeAmount === undefined || changeAmount === 0) {
    return "neutral";
  }

  const isUp = Number(changeAmount) > 0;
  const isInverse = INVERSE_METRICS.has(metricId);

  if (isInverse) {
    return isUp ? "negative" : "positive";
  } else {
    return isUp ? "positive" : "negative";
  }
}

