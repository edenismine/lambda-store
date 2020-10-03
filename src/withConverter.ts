/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  CollectionReference,
  DocumentReference,
  FirestoreDataConverter,
  Query,
} from '@google-cloud/firestore'
import { ExtractReference } from './utils'

type Acc = DocumentReference | CollectionReference | Query
export const withConverter = <X>(converter: FirestoreDataConverter<X>) => <
  T extends Acc
>(
  acc: T,
): ExtractReference<T, X> => (acc as any).withConverter(converter)
