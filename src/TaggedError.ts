type Key = string | symbol

export interface TaggedError<T extends Key> extends Error {
  type: T
  name: string
  reason?: Error
}

export const TaggedError = <T extends Key>(
  type: T,
  message?: string,
): TaggedError<T> => {
  const reason = new Error(message) as Error & { type: T; reason?: Error }
  reason.name = type.toString()
  reason.type = type
  return reason
}

export const ofError = <T extends Key>(
  type: T,
  reason: Error,
  message?: string,
): TaggedError<T> => {
  const result = new Error(message) as Error & { type: T; reason: Error }
  result.message = [reason.message, message]
    .filter(s => typeof s === 'string')
    .join(' <> ')
  result.name = type.toString()
  result.type = type
  result.reason = reason
  return result
}

export const ofUnknown = <T extends Key>(
  type: T,
  reason: unknown,
  message?: string,
): TaggedError<T> =>
  reason instanceof Error
    ? ofError(type, reason, message)
    : typeof reason === 'string'
    ? ofError(type, new Error(reason), message)
    : TaggedError(type, message)

export const map: <A extends Key, B extends Key>(
  fun: (a: A) => B,
) => (fa: TaggedError<A>) => TaggedError<B> = fun => te =>
  ofError(fun(te.type), te)
