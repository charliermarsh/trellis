/**
 * Typed version of Object.values.
 */
export declare function typedValues<T>(obj: { [key: string]: T }): T[];
/**
 * Typed version of Object.typedKeys.
 */
export declare function typedKeys<T extends string, U>(
  obj: {
    [K in T]: U;
  },
): Array<T>;
/**
 * Typed version of Object.entries.
 */
export declare function typedEntries<T>(obj: {
  [key: string]: T;
}): Array<[string, T]>;
