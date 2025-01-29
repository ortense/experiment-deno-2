import { describe, it } from "jsr:@std/testing/bdd";
import { expect } from "jsr:@std/expect";
import { getTransactionFeature } from "@module/transaction/feature/get-transaction.ts";
import { createTransactionRepositoryInMemory } from "@module/transaction/repository/transaction-in-memory.ts";
import type { Transaction } from "@module/transaction/transaction.type.ts";

describe("Get Transaction Feature", () => {
  it("should retrieve a transaction by ID successfully", async () => {
    const transaction: Transaction = {
      id: "1",
      value: 100,
      description: "Transaction 1",
      method: "credit_card",
      card: {
        number: "1234567812345678",
        holderName: "John Doe",
        expiration: "12/25",
        cvv: "123",
      },
    };

    const repo = createTransactionRepositoryInMemory(undefined, [transaction]);
    const feature = getTransactionFeature(repo);

    const result = await feature.execute("1");

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value).toEqual(transaction);
    }
  });

  it("should return null if transaction ID does not exist", async () => {
    const repo = createTransactionRepositoryInMemory();
    const feature = getTransactionFeature(repo);

    const result = await feature.execute("non-existent-id");

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value).toBe(null);
    }
  });

  it("should return a failure if repository fails to retrieve transaction", async () => {
    const repo = createTransactionRepositoryInMemory(
      new Error("Test repository error"),
    );
    const feature = getTransactionFeature(repo);

    const result = await feature.execute("1");

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.value).toBeInstanceOf(Error);
      expect(result.value.message).toBe("Test repository error");
    }
  });
});
