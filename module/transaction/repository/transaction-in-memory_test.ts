import { describe, it } from "jsr:@std/testing/bdd";
import { expect } from "jsr:@std/expect";
import { createTransactionRepositoryInMemory } from "@module/transaction/repository/transaction-in-memory.ts";
import type {
  CreateTransactionInput,
  Transaction,
} from "@module/transaction/transaction.type.ts";
import type { Failure, Success } from "@lib/result.ts";

describe("In-Memory Transaction Repository", () => {
  const sampleTransactionPayload: CreateTransactionInput = {
    value: 200,
    description: "Sample Transaction",
    method: "credit_card",
    card: {
      number: "1234567812345678",
      holderName: "John Doe",
      expiration: "12/25",
      cvv: "123",
    },
  };

  it("should list transactions successfully when there are none", async () => {
    const repo = createTransactionRepositoryInMemory();

    const result = await repo.list() as Success<Transaction[]>;

    expect(result.ok).toBe(true);
    expect(result.value).toEqual([]);
  });

  it("should save a transaction successfully", async () => {
    const repo = createTransactionRepositoryInMemory();

    const result = await repo.save(sampleTransactionPayload) as Success<
      Transaction
    >;

    expect(result.ok).toBe(true);
    expect(result.value).toHaveProperty("id");
    expect(result.value.value).toBe(sampleTransactionPayload.value);
    expect(result.value.description).toBe(
      sampleTransactionPayload.description,
    );
    expect(result.value.method).toBe(sampleTransactionPayload.method);
  });

  it("should retrieve a transaction by ID after saving", async () => {
    const repo = createTransactionRepositoryInMemory();

    const saveResult = await repo.save(sampleTransactionPayload) as Success<
      Transaction
    >;

    const { id } = saveResult.value;
    const getResult = await repo.getById(id) as Success<Transaction>;

    expect(getResult.ok).toBe(true);
    expect(getResult.value).toEqual(saveResult.value);
  });

  it("should return null when trying to retrieve a non-existent transaction by ID", async () => {
    const repo = createTransactionRepositoryInMemory();

    const result = await repo.getById("non-existent-id") as Success<null>;

    expect(result.ok).toBe(true);
    expect(result.value).toBe(null);
  });

  it("should return a failure when an error is configured in the repository", async () => {
    const repo = createTransactionRepositoryInMemory(new Error("Test error"));

    const listResult = await repo.list() as Failure<Error>;
    const saveResult = await repo.save(sampleTransactionPayload) as Failure<
      Error
    >;
    const getResult = await repo.getById("non-existent-id") as Failure<Error>;

    [listResult, saveResult, getResult].forEach((result) => {
      expect(result.ok).toBe(false);
      expect(result.value).toBeInstanceOf(Error);
      expect(result.value.message).toBe("Test error");
    });
  });
});
