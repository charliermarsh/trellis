/**
 * Typed version of Object.values.
 */
export function typedValues(obj) {
  return Object.keys(obj).map((k) => obj[k]);
}
/**
 * Typed version of Object.typedKeys.
 */
export function typedKeys(obj) {
  return Object.keys(obj).map((k) => k);
}
/**
 * Typed version of Object.entries.
 */
export function typedEntries(obj) {
  return Object.keys(obj).map((k) => [k, obj[k]]);
}
