/* eslint-disable @typescript-eslint/no-explicit-any */
import { Transaction } from '@google-cloud/firestore'
import { pipe } from 'fp-ts/lib/function'
import { chainW as chain, map, of, TaskEither } from 'fp-ts/lib/TaskEither'
import { FirestoreErrorType } from './FirestoreError'
import { TaggedError } from './TaggedError'

type Key = string | symbol

interface Tx<E extends Key, S extends Record<string, unknown>> {
  bind: <N extends string, A, E1 extends Key>(
    name: Exclude<N, keyof S>,
    maTx: (tx: Transaction) => TaskEither<TaggedError<E1>, A>,
  ) => Tx<E | E1, S & { [K in N]: A }>
  bindL: <N extends string, A, E1 extends Key>(
    name: Exclude<N, keyof S>,
    f: (s: S) => (tx: Transaction) => TaskEither<TaggedError<E1>, A>,
  ) => Tx<E | E1, S & { [K in N]: A }>
  do: <E1 extends Key>(
    maTx: (tx: Transaction) => TaskEither<TaggedError<E1>, unknown>,
  ) => Tx<E | E1, S>
  doL: <E1 extends Key>(
    f: (s: S) => (tx: Transaction) => TaskEither<TaggedError<E1>, unknown>,
  ) => Tx<E | E1, S>
  let: <N extends string, A>(
    name: Exclude<N, keyof S>,
    a: A,
  ) => Tx<E, S & { [K in N]: A }>
  letL: <N extends string, A>(
    name: Exclude<N, keyof S>,
    f: (s: S) => A,
  ) => Tx<E, S & { [K in N]: A }>
  return: <A>(f: (s: S) => A) => TaskEither<TaggedError<E>, A>
  done: () => TaskEither<TaggedError<E>, S>
}

class TxClass<E extends Key> implements Tx<E, any> {
  constructor(
    readonly tx: Transaction,
    readonly result: TaskEither<TaggedError<E>, any>,
  ) {}
  do<E1 extends Key>(
    action: (tx: Transaction) => TaskEither<TaggedError<E1>, any>,
  ): TxClass<E | E1> {
    const { result, tx } = this
    return new TxClass<E | E1>(
      tx,
      pipe(
        result,
        chain(s =>
          pipe(
            action(tx),
            map(() => s),
          ),
        ),
      ),
    )
  }
  doL<E1 extends Key>(
    f: (s: any) => (tx: Transaction) => TaskEither<TaggedError<E1>, any>,
  ): TxClass<E | E1> {
    const { result, tx } = this
    return new TxClass<E | E1>(
      tx,
      pipe(
        result,
        chain(s =>
          pipe(
            f(s)(tx),
            map(() => s),
          ),
        ),
      ),
    )
  }
  bind<E1 extends Key>(
    name: string,
    action: (tx: Transaction) => TaskEither<TaggedError<E1>, any>,
  ): TxClass<E | E1> {
    const { result, tx } = this
    return new TxClass<E | E1>(
      tx,
      pipe(
        result,
        chain(s =>
          pipe(
            action(tx),
            map(b => Object.assign({}, s, { [name]: b })),
          ),
        ),
      ),
    )
  }
  bindL<E1 extends Key>(
    name: string,
    f: (s: any) => (tx: Transaction) => TaskEither<TaggedError<E1>, any>,
  ): TxClass<E | E1> {
    const { result, tx } = this
    return new TxClass<E | E1>(
      tx,
      pipe(
        result,
        chain(s =>
          pipe(
            f(s)(tx),
            map(b => Object.assign({}, s, { [name]: b })),
          ),
        ),
      ),
    )
  }
  let(name: string, a: any): TxClass<E> {
    const { result, tx } = this
    return new TxClass(
      tx,
      pipe(
        result,
        map(s => Object.assign({}, s, { [name]: a })),
      ),
    )
  }
  letL(name: string, f: (s: any) => any): TxClass<E> {
    const { result, tx } = this
    return new TxClass(
      tx,
      pipe(
        result,
        map(s => Object.assign({}, s, { [name]: f(s) })),
      ),
    )
  }
  return<B>(f: (s: any) => B): TaskEither<TaggedError<E>, B> {
    return map(f)(this.result)
  }
  done(): TaskEither<TaggedError<E>, any> {
    return this.result
  }
}
const empty = {}
export function Tx<
  E extends Key = FirestoreErrorType,
  S extends Record<string, unknown> = typeof empty
>(tx: Transaction, init: S): Tx<E, S> {
  return new TxClass<E>(tx, of(init))
}
