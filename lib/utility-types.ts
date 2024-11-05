// deno-lint-ignore no-explicit-any
export type AnyAsyncFunction = (...args: any[]) => Promise<any>;

// deno-lint-ignore no-explicit-any
export type AnyFunction = (...args: any[]) => any;

export type Nullable<T> = T | null;
