import { DocumentReference, Timestamp } from '@google-cloud/firestore'
import * as E from 'fp-ts/Either'
import * as DS from './DocSnap'
import {
  isDate,
  isTimestamp,
  isDocumentReference,
  isPrimitive,
  isObject,
  Primitive,
} from './utils'
import * as te from './TaggedError'
import TaggedError = te.TaggedError
import DocSnap = DS.DocSnap

export type Sanitized<T> = T extends Timestamp
  ? Date
  : T extends DocumentReference
  ? string
  : T extends Primitive
  ? T
  : T extends ArrayLike<infer U>
  ? Array<Sanitized<U>>
  : T extends Record<string, unknown>
  ? { [K in keyof T]: Sanitized<T[K]> }
  : never

export type SanitizationError = 'SanitizationError'

export const sanitized = <R>(
  doc: DocSnap<R>,
): E.Either<TaggedError<SanitizationError>, DocSnap<Sanitized<R>>> =>
  E.tryCatch(
    () => DS.map(_sanitized)(doc),
    reason => te.ofUnknown('SanitizationError', reason),
  )

const _sanitized = <A>(data: A): Sanitized<A> => {
  if (isDate(data)) {
    return data as Sanitized<A>
  } else if (isTimestamp(data)) {
    return data.toDate() as Sanitized<A>
  } else if (isDocumentReference(data)) {
    return data.path as Sanitized<A>
  } else if (isPrimitive(data)) {
    return data as Sanitized<A>
  } else if (Array.isArray(data)) {
    return data.map(_sanitized) as Sanitized<A>
  } else if (isObject(data) && data.constructor.name === 'Object') {
    return Object.entries(data).reduce(
      (acc: Record<string, unknown>, [key, value]) => {
        acc[key] = _sanitized(value)
        return acc
      },
      {},
    ) as Sanitized<A>
  } else {
    throw new Error(
      `Unable to sanitize object of type ${
        isObject(data) ? data.constructor.name : data
      }`,
    )
  }
}
