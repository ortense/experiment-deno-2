import { describe, it } from "jsr:@std/testing/bdd";
import { expect } from "jsr:@std/expect";
import {
  failure,
  isFailure,
  isSuccess,
  success,
  withAsyncResult,
  withResult,
} from "@lib/result.ts";

describe("Result Utility Functions", () => {
  it("should create a success result correctly", () => {
    const result = success("Test Value");

    expect(result.ok).toBe(true);
    expect(result.value).toBe("Test Value");
  });

  it("should create a failure result correctly", () => {
    const error = new Error("Test Error");
    const result = failure(error);

    expect(result.ok).toBe(false);
    expect(result.value).toBe(error);
  });

  it("should identify success results correctly with isSuccess", () => {
    const successResult = success("Success Value");
    const failureResult = failure(new Error("Failure Value"));

    expect(isSuccess(successResult)).toBe(true);
    expect(isSuccess(failureResult)).toBe(false);
  });

  it("should identify failure results correctly with isFailure", () => {
    const successResult = success("Success Value");
    const failureResult = failure(new Error("Failure Value"));

    expect(isFailure(successResult)).toBe(false);
    expect(isFailure(failureResult)).toBe(true);
  });

  describe("withResult", () => {
    it("should return success when the function executes without error", () => {
      const testFunction = (x: number, y: number) => x + y;
      const wrappedFunction = withResult(testFunction);
      const result = wrappedFunction(3, 4);

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value).toBe(7);
      }
    });

    it("should return failure when the function throws an error", () => {
      const testFunction = () => {
        throw new Error("Test error");
      };
      const wrappedFunction = withResult(testFunction);
      const result = wrappedFunction();

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.value).toBeInstanceOf(Error);
        expect(result.value.message).toBe("Test error");
      }
    });

    it("should wrap non-error objects in a new Error on failure", () => {
      const testFunction = () => {
        throw "Non-error object";
      };
      const wrappedFunction = withResult(testFunction);
      const result = wrappedFunction();

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.value).toBeInstanceOf(Error);
        expect(result.value.message).toBe("Non-error object");
      }
    });
  });

  describe("withAsyncResult", () => {
    it("should return success when the async function resolves without error", async () => {
      // deno-lint-ignore require-await
      const asyncFunction = async (x: number, y: number) => x * y;
      const wrappedAsyncFunction = withAsyncResult(asyncFunction);
      const result = await wrappedAsyncFunction(5, 6);

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value).toBe(30);
      }
    });

    it("should return failure when the async function rejects with an error", async () => {
      // deno-lint-ignore require-await
      const asyncFunction = async () => {
        throw new Error("Async test error");
      };
      const wrappedAsyncFunction = withAsyncResult(asyncFunction);
      const result = await wrappedAsyncFunction();

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.value).toBeInstanceOf(Error);
        expect(result.value.message).toBe("Async test error");
      }
    });

    it("should wrap non-error objects in a new Error on async failure", async () => {
      // deno-lint-ignore require-await
      const asyncFunction = async () => {
        throw "Non-error async object";
      };
      const wrappedAsyncFunction = withAsyncResult(asyncFunction);
      const result = await wrappedAsyncFunction();

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.value).toBeInstanceOf(Error);
        expect(result.value.message).toBe("Non-error async object");
      }
    });
  });
});
