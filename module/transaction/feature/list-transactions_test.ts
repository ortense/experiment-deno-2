import { describe, it } from "jsr:@std/testing/bdd";
import { expect } from "jsr:@std/expect";
import { listTransactionFeature } from "@module/transaction/feature/list-transactions.ts";
import { createTransactionRepositoryInMemory } from "@module/transaction/repository/transaction-in-memory.ts";
import { Transaction } from "@module/transaction/transaction.type.ts";

describe("List Transaction Feature", () => {
  it("should list transactions successfully when there are none", async () => {
    const repo = createTransactionRepositoryInMemory();
    const feature = listTransactionFeature(repo);

    const result = await feature.execute();

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value).toEqual([]);
    }
  });

  it("should list transactions successfully when there are transactions", async () => {
    const data: Transaction[] = [{
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
    }, {
      id: "2",
      value: 200,
      description: "Transaction 2",
      method: "debit_card",
      card: {
        number: "8765432187654321",
        holderName: "Jane Doe",
        expiration: "11/24",
        cvv: "456",
      },
    }];

    const repo = createTransactionRepositoryInMemory(undefined, data);
    const feature = listTransactionFeature(repo);

    const result = await feature.execute();

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.length).toBe(2);
      expect(result.value).toContainEqual(data[0]);
      expect(result.value).toContainEqual(data[1]);
    }
  });

  it("should return a failure if repository fails to list transactions", async () => {
    const repo = createTransactionRepositoryInMemory(
      new Error("Test repository error"),
    );
    const feature = listTransactionFeature(repo);

    const result = await feature.execute();

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.value).toBeInstanceOf(Error);
      expect(result.value.message).toBe("Test repository error");
    }
  });
});
