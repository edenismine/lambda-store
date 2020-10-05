export type Asc<
  E extends Record<string, unknown>,
  K extends keyof E = keyof E
> = {
  _tag: 'asc'
  key: K
}
export const Asc = <
  E extends Record<string, unknown>,
  K extends keyof E = keyof E
>(
  key: K,
): Asc<E, K> => ({
  _tag: 'asc',
  key,
})

export type Desc<
  E extends Record<string, unknown>,
  K extends keyof E = keyof E
> = {
  _tag: 'desc'
  key: K
}
export const Desc = <
  E extends Record<string, unknown>,
  K extends keyof E = keyof E
>(
  key: K,
): Desc<E, K> => ({
  _tag: 'desc',
  key,
})

export type OrderBy<
  E extends Record<string, unknown>,
  K extends keyof E = keyof E
> = Asc<E, K> | Desc<E, K>
