/**
 * Typed version of Object.values.
 */
export function typedValues<T>(obj: { [key: string]: T }): T[] {
  return Object.keys(obj).map((k) => obj[k]);
}

/**
 * Typed version of Object.typedKeys.
 */
export function typedKeys<T extends string, U>(obj: { [K in T]: U }): Array<T> {
  return Object.keys(obj).map((k) => k as T);
}

/**
 * Typed version of Object.entries.
 */
export function typedEntries<T>(obj: { [key: string]: T }): Array<[string, T]> {
  return Object.keys(obj).map((k) => [k, obj[k]]);
}
