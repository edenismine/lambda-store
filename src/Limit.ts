export type LimitToFirst = {
  _tag: 'first'
  n: number
}
export const LimitToFirst = (n: number): LimitToFirst => ({ _tag: 'first', n })

export type LimitToLast = {
  _tag: 'last'
  n: number
}
export const LimitToLast = (n: number): LimitToLast => ({ _tag: 'last', n })

export type Limit = LimitToFirst | LimitToLast
