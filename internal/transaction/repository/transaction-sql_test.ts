import { describe, it } from "jsr:@std/testing/bdd";
import { expect } from "jsr:@std/expect";
import { Spy, spy } from "jsr:@std/testing/mock";
import {
  CreateTransactionInput,
  TransactionDataRow,
} from "@internal/transaction/transaction.type.ts";
import { createTransactionRepositorySQL } from "@internal/transaction/repository/transaction-sql.ts";
import { DB } from "sqlite";

describe("Transaction Repository", () => {
  function createMockedRepo() {
    const db = {
      execute: spy(() => {}),
      query: spy(() => [] as TransactionDataRow[]),
    } as unknown as DB;
    const repository = createTransactionRepositorySQL(db as unknown as DB);

    return { repository, db };
  }

  describe("save", () => {
    it("should execute the correct SQL to save a transaction", async () => {
      const { repository, db } = createMockedRepo();
      const payload: CreateTransactionInput = {
        value: 200,
        description: "Test Transaction",
        method: "credit_card",
        card: {
          number: "1234567812345678",
          holderName: "John Doe",
          expiration: "12/25",
          cvv: "123",
        },
      };

      const result = await repository.save(payload);
      const spy = db.query as Spy;

      expect(result.ok).toBe(true);
      expect(spy.calls.length).toBe(1);
      expect(spy.calls[0].args[0]).toContain("INSERT INTO transactions");
    });

    it("should return failure if database insertion fails", async () => {
      const { repository, db } = createMockedRepo();
      db.query = spy(() => {
        throw new Error("Mocked DB error");
      });

      const payload: CreateTransactionInput = {
        value: 300,
        description: "Invalid Transaction",
        // deno-lint-ignore no-explicit-any
        method: "invalid_method" as any,
      };

      const result = await repository.save(payload);

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.value).toBeInstanceOf(Error);
        expect(result.value.message).toBe("Mocked DB error");
      }
    });
  });

  describe("list", () => {
    it("should execute the correct SQL to list transactions", async () => {
      const { repository, db } = createMockedRepo();
      db.query = spy(() =>
        [
          ["1", 100, "Transaction 1", "boleto", null, null, null, null],
          [
            "2",
            150,
            "Transaction 2",
            "debit_card",
            "1234567812345678",
            "Jane Doe",
            "11/24",
            "456",
          ],
        ] as TransactionDataRow[]
      ) as typeof db.query;

      const result = await repository.list();
      const fake = db.query as Spy;

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(fake.calls.length).toBe(1);
        expect(fake.calls[0].args[0]).toContain(
          "SELECT id, value, description",
        );
        expect(result.value.length).toBe(2);
      }
    });
  });

  describe("getById", () => {
    it("should execute the correct SQL to retrieve a transaction by ID", async () => {
      const { repository, db } = createMockedRepo();
      const mockData: TransactionDataRow = [
        "1",
        250,
        "Single Transaction",
        "credit_card",
        "8765432187654321",
        "Alice Smith",
        "10/24",
        "321",
      ];
      db.query = spy(() => [mockData]) as typeof db.query;

      const result = await repository.getById("1");
      const fake = db.query as Spy;

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(fake.calls.length).toBe(1);
        expect(fake.calls[0].args[0]).toContain(
          "SELECT id, value, description",
        );
        expect(result.value?.id).toBe("1");
        expect(result.value?.value).toBe(250);
      }
    });

    it("should return null if transaction ID does not exist", async () => {
      const { repository, db } = createMockedRepo();
      db.query = spy(() => []);

      const result = await repository.getById("non-existing-id");

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value).toBeNull();
      }
    });
  });
});
