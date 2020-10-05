export type LessThan<
  E extends Record<string, unknown>,
  K extends keyof E = keyof E
> = {
  _tag: '<'
  key: K
  value: E[K]
}
export const LessThan = <
  E extends Record<string, unknown>,
  K extends keyof E = keyof E
>(
  key: K,
  value: E[K],
): LessThan<E> => ({ _tag: '<', key, value })

export type LessOrEqual<
  E extends Record<string, unknown>,
  K extends keyof E = keyof E
> = {
  _tag: '<='
  key: K
  value: E[K]
}
export const LessOrEqual = <
  E extends Record<string, unknown>,
  K extends keyof E = keyof E
>(
  key: K,
  value: E[K],
): LessOrEqual<E> => ({ _tag: '<=', key, value })

export type Equal<
  E extends Record<string, unknown>,
  K extends keyof E = keyof E
> = {
  _tag: '=='
  key: K
  value: E[K]
}
export const Equal = <
  E extends Record<string, unknown>,
  K extends keyof E = keyof E
>(
  key: K,
  value: E[K],
): Equal<E> => ({ _tag: '==', key, value })

export type GreaterOrEqual<
  E extends Record<string, unknown>,
  K extends keyof E = keyof E
> = {
  _tag: '>='
  key: K
  value: E[K]
}
export const GreaterOrEqual = <
  E extends Record<string, unknown>,
  K extends keyof E = keyof E
>(
  key: K,
  value: E[K],
): GreaterOrEqual<E> => ({ _tag: '>=', key, value })

export type GreaterThan<
  E extends Record<string, unknown>,
  K extends keyof E = keyof E
> = {
  _tag: '>'
  key: K
  value: E[K]
}
export const GreaterThan = <
  E extends Record<string, unknown>,
  K extends keyof E = keyof E
>(
  key: K,
  value: E[K],
): GreaterThan<E> => ({ _tag: '>', key, value })

export type In<
  E extends Record<string, unknown>,
  K extends keyof E = keyof E
> = {
  _tag: 'in'
  key: K
  values: E[K][]
}
export const In = <
  E extends Record<string, unknown>,
  K extends keyof E = keyof E
>(
  key: K,
  values: E[K][],
): In<E, K> => ({ _tag: 'in', key, values })

export type Where<
  E extends Record<string, unknown>,
  K extends keyof E = keyof E
> =
  | LessThan<E, K>
  | LessOrEqual<E, K>
  | Equal<E, K>
  | GreaterOrEqual<E, K>
  | GreaterThan<E, K>
  | In<E, K>
