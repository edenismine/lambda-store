import {
  CollectionReference,
  DocumentReference,
  Firestore,
} from '@google-cloud/firestore'

export const collection = (name: string) => <
  T extends Firestore | DocumentReference
>(
  acc: T,
): CollectionReference => acc.collection(name)
