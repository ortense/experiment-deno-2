import { describe, it } from "jsr:@std/testing/bdd";
import { expect } from "jsr:@std/expect";
import { createPayableRepositoryInMemory } from "@module/transaction/repository/payable-in-memory.ts";
import type {
  CreatePayablePayload,
  Payable,
} from "@module/transaction/transaction.type.ts";
import type { Success } from "@lib/result.ts";

describe("In-Memory Payable Repository", () => {
  const samplePayablePayload: CreatePayablePayload = {
    transactionId: crypto.randomUUID(),
    status: "paid",
    subtotal: 10000,
    tax: 2,
    total: 9800,
  };

  it("should list payables successfully when there are none", async () => {
    const repo = createPayableRepositoryInMemory();

    const result = await repo.list() as Success<Payable[]>;

    expect(result.ok).toBe(true);
    expect(result.value).toEqual([]);
  });

  it("should save a payable successfully", async () => {
    const repo = createPayableRepositoryInMemory();

    const result = await repo.save(samplePayablePayload) as Success<Payable>;

    expect(result.ok).toBe(true);
    expect(result.value).toHaveProperty("id");
    expect(result.value).toHaveProperty("createdAt");
    expect(result.value.transactionId).toBe(
      samplePayablePayload.transactionId,
    );
    expect(result.value.total).toBe(samplePayablePayload.total);
    expect(result.value.tax).toBe(samplePayablePayload.tax);
    expect(result.value.subtotal).toBe(samplePayablePayload.subtotal);
  });

  it("should return failure when has any error", async () => {
    const repo = createPayableRepositoryInMemory(new Error("test error"));

    expect((await repo.save(samplePayablePayload)).value).toBeInstanceOf(Error);
    expect((await repo.list()).value).toBeInstanceOf(Error);
  });
});
