import {
  CollectionReference,
  DocumentReference,
  Query,
  SetOptions,
  Transaction,
  WriteResult,
} from '@google-cloud/firestore'
import * as array from 'fp-ts/Array'
import { pipe } from 'fp-ts/function'
import * as TE from 'fp-ts/TaskEither'
import { DocSnap, fromSnapshot } from './DocSnap'
import { FirestoreError, liftFirestoreError } from './FirestoreError'
import { FireDoc, getOrReject, taskEitherTryCatch } from './utils'
import TaskEither = TE.TaskEither

// CREATION and MODIFICATION operations

export const add = <A>(data: FireDoc<A>) => (
  ref: CollectionReference<A>,
): TaskEither<FirestoreError, string> =>
  taskEitherTryCatch(
    () => ref.add(data as A).then(dr => dr.id),
    liftFirestoreError,
  )

export const set = <A>(data: FireDoc<A>, setOptions?: SetOptions) => (
  ref: DocumentReference<A>,
): TaskEither<FirestoreError, WriteResult> =>
  taskEitherTryCatch(
    () => (setOptions ? ref.set(data as A, setOptions) : ref.set(data as A)),
    liftFirestoreError,
  )

export const update = <A>(data: Partial<FireDoc<A>>) => (
  ref: DocumentReference<A>,
): TaskEither<FirestoreError, WriteResult> =>
  taskEitherTryCatch(() => ref.update(data), liftFirestoreError)

export const create = <A>(data: FireDoc<A>) => (
  ref: DocumentReference<A>,
): TaskEither<FirestoreError, WriteResult> =>
  taskEitherTryCatch(() => ref.create(data as A), liftFirestoreError)

export const del = <A>(
  ref: DocumentReference<A>,
): TaskEither<FirestoreError, WriteResult> =>
  taskEitherTryCatch(() => ref.delete(), liftFirestoreError)

// QUERY operations

export const getAll = <A>(
  query: Query<A>,
): TaskEither<FirestoreError, DocSnap<A>[]> =>
  taskEitherTryCatch(
    () => query.get().then(snap => snap.docs.map(fromSnapshot)),
    liftFirestoreError,
  )

export const get = <A>(
  ref: DocumentReference<A>,
): TaskEither<FirestoreError, DocSnap<A>> =>
  taskEitherTryCatch(() => ref.get().then(fromSnapshot), liftFirestoreError)

// TX QUERY operations

export const getTx = <A>(ref: DocumentReference<A>) => (
  tx: Transaction,
): TaskEither<FirestoreError, DocSnap<A>> =>
  taskEitherTryCatch(() => tx.get(ref).then(fromSnapshot), liftFirestoreError)

export const getAllTx = <A>(queryOrRefs: Query<A> | DocumentReference<A>[]) => (
  tx: Transaction,
): TaskEither<FirestoreError, DocSnap<A>[]> =>
  taskEitherTryCatch(() => {
    return queryOrRefs.constructor.name === 'Query'
      ? tx
          .get(queryOrRefs as Query<A>)
          .then(snap => snap.docs.map(fromSnapshot))
      : pipe(
          queryOrRefs as DocumentReference<A>[],
          array.traverse(TE.taskEither)(ref => getTx(ref)(tx)),
        )().then(getOrReject)
  }, liftFirestoreError)

// TX CREATION and MODIFICATION operations

type WriteTx = TaskEither<FirestoreError, Transaction>

export const setTx = <A>(data: FireDoc<A>, setOptions?: SetOptions) => (
  ref: DocumentReference<A>,
) => (tx: Transaction): WriteTx =>
  taskEitherTryCatch(
    async () =>
      setOptions ? tx.set(ref, data as A, setOptions) : tx.set(ref, data as A),
    liftFirestoreError,
  )

export const updateTx = <A>(data: Partial<FireDoc<A>>) => (
  ref: DocumentReference<A>,
) => (tx: Transaction): WriteTx =>
  taskEitherTryCatch(async () => tx.update(ref, data), liftFirestoreError)

export const createTx = <A>(data: FireDoc<A>) => (
  ref: DocumentReference<A>,
) => (tx: Transaction): WriteTx =>
  taskEitherTryCatch(async () => tx.create(ref, data as A), liftFirestoreError)

export const delTx = <A>(ref: DocumentReference<A>) => (
  tx: Transaction,
): WriteTx => taskEitherTryCatch(async () => tx.delete(ref), liftFirestoreError)
