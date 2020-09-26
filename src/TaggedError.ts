export interface TaggedError<T extends string | symbol> extends Error {
  type: T
  reason?: Error
}

export const of = <T extends string | symbol>(
  type: T,
  message?: string,
): TaggedError<T> => {
  const reason = new Error(message) as Error & { type: T; reason?: Error }
  reason.name = type.toString()
  reason.type = type
  return reason
}

export const ofError = <T extends string | symbol>(
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

export const ofUnknown = <T extends string | symbol>(
  type: T,
  reason: unknown,
  message?: string,
): TaggedError<T> =>
  reason instanceof Error
    ? ofError(type, reason, message)
    : typeof reason === 'string'
    ? ofError(type, new Error(reason), message)
    : of(type, message)

export const map: <A extends string | symbol, B extends string | symbol>(
  fun: (a: A) => B,
) => (fa: TaggedError<A>) => TaggedError<B> = fun => te =>
  ofError(fun(te.type), te)
