import { describe, it } from "jsr:@std/testing/bdd";
import { expect } from "jsr:@std/expect";
import { failure, isFailure, isSuccess, success } from "@lib/result.ts";

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
});
