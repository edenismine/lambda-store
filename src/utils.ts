import {
  CollectionReference,
  DocumentReference,
  FieldValue,
  GeoPoint,
  Query,
  Timestamp,
} from '@google-cloud/firestore'
import * as E from 'fp-ts/Either'
import { Lazy } from 'fp-ts/function'
import * as TE from 'fp-ts/TaskEither'
import { types } from 'util'

export type Primitive = undefined | null | boolean | string | number

export type FirestoreField =
  | null
  | boolean
  | string
  | number
  | DocumentReference
  | FieldValue
  | Timestamp
  | GeoPoint
  | { [property: string]: FirestoreField }
  | FirestoreField[]

export type FireDoc<A> = A extends Record<string, FirestoreField>
  ? { [K in keyof A]: FieldValue | A[K] }
  : never

export const isObject = (x: unknown): x is Record<string, unknown> =>
  x !== null && typeof x === 'object' && !Array.isArray(x)

export const isPrimitive = (x: unknown): x is Primitive =>
  (typeof x !== 'object' && typeof x !== 'function') || x === null

export const isDate = (x: unknown): x is Date => types.isDate(x)

export const isTimestamp = (x: unknown): x is Timestamp =>
  isObject(x) && x instanceof Timestamp

export const isDocumentReference = (x: unknown): x is DocumentReference =>
  isObject(x) && x instanceof DocumentReference

/**
 * Same as fp-ts TaskEither tryCatch but any exceptions thrown by f are caught.
 * @param f a lazy promise that can throw
 * @param onRejected a function used to recover a left value on errors
 */
export const taskEitherTryCatch = <Left, Right>(
  f: Lazy<Promise<Right>>,
  onRejected: (reason: unknown) => Left,
): TE.TaskEither<Left, Right> => () => {
  try {
    return f().then(
      a => E.right<Left, Right>(a),
      reason => E.left<Left, Right>(onRejected(reason)),
    )
  } catch (e) {
    return Promise.resolve(E.left<Left, Right>(onRejected(e)))
  }
}

export const getOrReject = <L, R>(e: E.Either<L, R>): R | Promise<never> => {
  if (E.isLeft(e)) return Promise.reject(e.left)
  return e.right
}

export type ExtractReference<T, X> = T extends CollectionReference
  ? CollectionReference<X>
  : T extends DocumentReference
  ? DocumentReference<X>
  : T extends Query
  ? Query<X>
  : never

export type ExtractData<T> = T extends CollectionReference<infer U>
  ? U
  : T extends DocumentReference<infer U>
  ? U
  : T extends Query<infer U>
  ? U
  : never
