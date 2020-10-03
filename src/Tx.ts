/* eslint-disable @typescript-eslint/no-explicit-any */
import { Transaction } from '@google-cloud/firestore'
import { TaskEither, taskEither } from 'fp-ts/lib/TaskEither'
import { FirestoreError } from './FirestoreError'

const { map, chain, of } = taskEither

interface Tx<S extends Record<string, unknown>> {
  bind: <N extends string, A>(
    name: Exclude<N, keyof S>,
    maTx: (tx: Transaction) => TaskEither<FirestoreError, A>,
  ) => Tx<S & { [K in N]: A }>
  bindL: <N extends string, A>(
    name: Exclude<N, keyof S>,
    f: (s: S) => (tx: Transaction) => TaskEither<FirestoreError, A>,
  ) => Tx<S & { [K in N]: A }>
  do: (maTx: (tx: Transaction) => TaskEither<FirestoreError, unknown>) => Tx<S>
  doL: (
    f: (s: S) => (tx: Transaction) => TaskEither<FirestoreError, unknown>,
  ) => Tx<S>
  let: <N extends string, A>(
    name: Exclude<N, keyof S>,
    a: A,
  ) => Tx<S & { [K in N]: A }>
  letL: <N extends string, A>(
    name: Exclude<N, keyof S>,
    f: (s: S) => A,
  ) => Tx<S & { [K in N]: A }>
  return: <A>(f: (s: S) => A) => TaskEither<FirestoreError, A>
  done: () => TaskEither<FirestoreError, S>
}

class TxClass implements Tx<any> {
  constructor(
    readonly tx: Transaction,
    readonly result: TaskEither<FirestoreError, any>,
  ) {}
  do(action: (tx: Transaction) => TaskEither<FirestoreError, any>): TxClass {
    const { result, tx } = this
    return new TxClass(
      tx,
      chain(result, s => map(action(tx), () => s)),
    )
  }
  doL(
    f: (s: any) => (tx: Transaction) => TaskEither<FirestoreError, any>,
  ): TxClass {
    const { result, tx } = this
    return new TxClass(
      tx,
      chain(result, s => map(f(s)(tx), () => s)),
    )
  }
  bind(
    name: string,
    action: (tx: Transaction) => TaskEither<FirestoreError, any>,
  ): TxClass {
    const { result, tx } = this
    return new TxClass(
      tx,
      chain(result, s =>
        map(action(tx), b => Object.assign({}, s, { [name]: b })),
      ),
    )
  }
  bindL(
    name: string,
    f: (s: any) => (tx: Transaction) => TaskEither<FirestoreError, any>,
  ): TxClass {
    const { result, tx } = this
    return new TxClass(
      tx,
      chain(result, s =>
        map(f(s)(tx), b => Object.assign({}, s, { [name]: b })),
      ),
    )
  }
  let(name: string, a: any): TxClass {
    const { result, tx } = this
    return new TxClass(
      tx,
      map(result, s => Object.assign({}, s, { [name]: a })),
    )
  }
  letL(name: string, f: (s: any) => any): TxClass {
    const { result, tx } = this
    return new TxClass(
      tx,
      map(result, s => Object.assign({}, s, { [name]: f(s) })),
    )
  }
  return<B>(f: (s: any) => B): TaskEither<FirestoreError, B> {
    return map(this.result, f)
  }
  done(): TaskEither<FirestoreError, any> {
    return this.result
  }
}

export function Tx<S extends Record<string, unknown>>(
  tx: Transaction,
  init: S,
): Tx<S> {
  return new TxClass(tx, of(init))
}
