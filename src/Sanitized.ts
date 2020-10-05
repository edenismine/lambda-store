import { DocumentReference, Timestamp } from '@google-cloud/firestore'
import * as E from 'fp-ts/Either'
import * as te from './TaggedError'
import {
  isDate,
  isDocumentReference,
  isObject,
  isPrimitive,
  isTimestamp,
  Primitive,
} from './utils'
import TaggedError = te.TaggedError

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

export type SanitizationErrorType = 'SanitizationError'
export type SanitizationError = TaggedError<SanitizationErrorType>
export const liftSanitizationError = (x: unknown): SanitizationError =>
  te.ofUnknown('SanitizationError', x)

export const sanitize = <A>(
  data: A,
): E.Either<TaggedError<SanitizationErrorType>, Sanitized<A>> =>
  E.tryCatch(() => _unsafeSanitize(data), liftSanitizationError)

const _unsafeSanitize = <A>(data: A): Sanitized<A> => {
  if (isDate(data)) {
    return data as Sanitized<A>
  } else if (isTimestamp(data)) {
    return data.toDate() as Sanitized<A>
  } else if (isDocumentReference(data)) {
    return data.path as Sanitized<A>
  } else if (isPrimitive(data)) {
    return data as Sanitized<A>
  } else if (Array.isArray(data)) {
    return data.map(_unsafeSanitize) as Sanitized<A>
  } else if (isObject(data) && data.constructor.name === 'Object') {
    return Object.entries(data).reduce(
      (acc: Record<string, unknown>, [key, value]) => {
        acc[key] = _unsafeSanitize(value)
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
