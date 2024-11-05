import { describe, it } from "jsr:@std/testing/bdd";
import { expect } from "jsr:@std/expect";
import { Spy, spy } from "jsr:@std/testing/mock";
import { DB } from "sqlite";
import {
  CreatePayablePayload,
  PayableDataRow,
} from "@internal/transaction/transaction.type.ts";
import { createPayableRepositorySQL } from "@internal/transaction/repository/payable-sql.ts";

describe("Payable Repository", () => {
  function createMockedRepo() {
    const db = {
      execute: spy(() => {}),
      query: spy(() => [] as PayableDataRow[]),
    } as unknown as DB;
    const repository = createPayableRepositorySQL(db as unknown as DB);

    return { repository, db };
  }

  describe("save", () => {
    it("should execute the correct SQL to save a payable", async () => {
      const { repository, db } = createMockedRepo();
      const payload: CreatePayablePayload = {
        transactionId: "1",
        subtotal: 200,
        status: "waiting_funds",
        tax: 5,
        total: 190,
      };

      const result = await repository.save(payload);
      const spy = db.query as Spy;

      expect(result.ok).toBe(true);
      expect(spy.calls.length).toBe(1);
      expect(spy.calls[0].args[0]).toContain("INSERT INTO payables");
    });

    it("should return failure if database insertion fails", async () => {
      const { repository, db } = createMockedRepo();
      db.query = spy(() => {
        throw new Error("Mocked DB error");
      });

      const payload: CreatePayablePayload = {
        transactionId: "1",
        subtotal: 300,
        status: "paid",
        tax: 10,
        total: 270,
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
    it("should execute the correct SQL to list payables", async () => {
      const { repository, db } = createMockedRepo();
      db.query = spy(() =>
        [
          ["1", "1", "waiting_funds", 100, 5, 95, new Date().toISOString()],
          ["2", "2", "paid", 150, 2, 148, new Date().toISOString()],
        ] as PayableDataRow[]
      ) as typeof db.query;

      const result = await repository.list();
      const fake = db.query as Spy;

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(fake.calls.length).toBe(1);
        expect(fake.calls[0].args[0]).toContain(
          "SELECT id, transactionId, status, subtotal, tax, total, createdAt FROM payables",
        );
        expect(result.value.length).toBe(2);
      }
    });
  });
});
