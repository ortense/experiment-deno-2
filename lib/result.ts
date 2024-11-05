import { AnyAsyncFunction, AnyFunction } from "@lib/utility-types.ts";

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

type WithAsyncResult<F extends AnyAsyncFunction> = (
  ...args: Parameters<F>
) => Promise<Result<Awaited<ReturnType<F>>>>;

type WithResult<F extends AnyAsyncFunction> = (
  ...args: Parameters<F>
) => Result<ReturnType<F>>;

export function withResult<F extends AnyFunction>(
  fn: F,
): WithResult<F> {
  return (...args: Parameters<F>): Result<ReturnType<F>, Error> => {
    try {
      const result = fn(...args);
      return success<ReturnType<F>>(result);
    } catch (error) {
      return failure(error instanceof Error ? error : new Error(`${error}`));
    }
  };
}

export function withAsyncResult<F extends AnyAsyncFunction>(
  fn: F,
): WithAsyncResult<F> {
  return async (
    ...args: Parameters<F>
  ): Promise<Result<Awaited<ReturnType<F>>, Error>> => {
    try {
      const result = await fn(...args);
      return success<Awaited<ReturnType<F>>>(result);
    } catch (error) {
      return failure(error instanceof Error ? error : new Error(`${error}`));
    }
  };
}
