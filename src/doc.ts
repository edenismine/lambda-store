import { CollectionReference, DocumentReference } from '@google-cloud/firestore'

export const doc = (id?: string) => <T>(
  acc: CollectionReference<T>,
): DocumentReference<T> => (id ? acc.doc(id) : acc.doc())
