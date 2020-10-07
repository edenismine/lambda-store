import {
  DocumentReference,
  DocumentSnapshot,
  Timestamp,
} from '@google-cloud/firestore'

/**
 * Read a document with data.
 */
export type DocData<A> = Readonly<{
  _tag: 'DocData'

  id: string
  ref: DocumentReference<A>
  readTime: Timestamp

  data: A
  createTime: Timestamp
  updateTime: Timestamp
}>

/**
 * Read an empty document.
 */
export type NoDoc<A> = Readonly<{
  _tag: 'NoDoc'

  id: string
  ref: DocumentReference<A>
  readTime: Timestamp
}>

/**
 * Document Snapshots either hold data or they don't.
 */
export type DocSnap<A> = NoDoc<A> | DocData<A>

export const fromSnapshot = <A>(snap: DocumentSnapshot<A>): DocSnap<A> => {
  const { id, ref, exists } = snap
  const data = snap.data()
  const createTime = snap.createTime ?? Timestamp.fromDate(new Date())
  const updateTime = snap.updateTime ?? Timestamp.fromDate(new Date())
  const readTime = snap.readTime
  if (exists && data !== undefined) {
    return { id, ref, data, createTime, updateTime, readTime, _tag: 'DocData' }
  } else {
    return { id, ref, readTime, _tag: 'NoDoc' }
  }
}

export const fold = <A, B>(
  onLeft: (f: NoDoc<A>) => B,
  onRight: (f: DocData<A>) => B,
) => (fa: DocSnap<A>): B => (fa._tag === 'DocData' ? onRight(fa) : onLeft(fa))
