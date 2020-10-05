import {
  CollectionReference,
  Query as FirestoreQuery,
} from '@google-cloud/firestore'
import { Limit } from './Limit'
import { OrderBy } from './OrderBy'
import { Where } from './Where'

type Acc<X> = CollectionReference<X> | FirestoreQuery<X>

export const query = <E extends Record<string, unknown>>(
  ...queries: Where<E>[]
) => (...orderBy: OrderBy<E>[]) => (limit?: Limit) => (
  acc: Acc<E>,
): FirestoreQuery<E> => {
  const q = queries.reduce(
    (prev, curr) =>
      prev.where(
        curr.key as string,
        curr._tag,
        curr._tag === 'in' ? curr.values : curr.value,
      ),
    acc,
  )
  const o = orderBy.reduce(
    (prev, curr) => prev.orderBy(curr.key as string, curr._tag),
    q,
  )
  return limit
    ? limit._tag === 'first'
      ? o.limit(limit.n)
      : o.limitToLast(limit.n)
    : o
}
