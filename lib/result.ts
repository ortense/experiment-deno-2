export type Success<T> = Readonly<{ ok: true; value: T }>;

export type Failure<E extends Error> = Readonly<{ ok: false; value: E }>;

export type Result<S, F extends Error = Error> = Success<S> | Failure<F>;

export const success = <T>(value: T): Result<T, never> =>
  Object.freeze({
    ok: true,
    value,
  });

export const failure = <E extends Error>(value: E): Result<never, E> =>
  Object.freeze({
    ok: false,
    value,
  });

export const isSuccess = <T, E extends Error>(
  result: Result<T, E>,
): result is Success<T> => result.ok;

export const isFailure = <T, E extends Error>(
  result: Result<T, E>,
): result is Failure<E> => !result.ok;
