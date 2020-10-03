import { DocumentReference, DocumentSnapshot } from '@google-cloud/firestore'

/**
 * Read a document with data.
 */
export type DocData<A> = Readonly<{
  _tag: 'DocData'

  id: string
  ref: DocumentReference
  readTime: Date

  data: A
  createTime: Date
  updateTime: Date
}>

/**
 * Read an empty document.
 */
export type NoDoc = Readonly<{
  _tag: 'NoDoc'

  id: string
  ref: DocumentReference
  readTime: Date
}>

/**
 * Document Snapshots either hold data or they don't.
 */
export type DocSnap<A> = NoDoc | DocData<A>

export const fromSnapshot = <A>(snap: DocumentSnapshot<A>): DocSnap<A> => {
  const { id, ref, exists } = snap
  const data = snap.data()
  const createTime = snap.createTime?.toDate() ?? new Date()
  const updateTime = snap.updateTime?.toDate() ?? new Date()
  const readTime = snap.readTime.toDate()
  if (exists && data !== undefined) {
    return { id, ref, data, createTime, updateTime, readTime, _tag: 'DocData' }
  } else {
    return { id, ref, readTime, _tag: 'NoDoc' }
  }
}

export const map = <A, B>(f: (a: A) => B) => (fa: DocSnap<A>): DocSnap<B> =>
  fa._tag === 'DocData' ? { ...fa, data: f(fa.data) } : fa

export const fold = <A, B>(
  onLeft: (f: NoDoc) => B,
  onRight: (f: DocData<A>) => B,
) => (fa: DocSnap<A>): B => (fa._tag === 'DocData' ? onRight(fa) : onLeft(fa))
