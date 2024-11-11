import { describe, it } from "jsr:@std/testing/bdd";
import { expect } from "jsr:@std/expect";
import { createTransactinWithPayableFeature } from "@internal/transaction/feature/create-transaction-with-payable.ts";
import { createTransactionRepositoryInMemory } from "@internal/transaction/repository/transaction-in-memory.ts";
import { createPayableRepositoryInMemory } from "@internal/transaction/repository/payable-in-memory.ts";
import {
  CreateTransactionInput,
  CreditCardTransaction,
  DebitCardTransaction,
  Payable,
  Transaction,
} from "@internal/transaction/transaction.type.ts";
import { Failure, Success } from "@lib/result.ts";

describe("Create Transaction With Payable Feature", () => {
  const validTransactionPayload: CreateTransactionInput = {
    value: 100,
    description: "Test Transaction",
    method: "credit_card",
    card: {
      number: "1234567812345678",
      holderName: "Test Holder",
      expiration: "12/25",
      cvv: "123",
    },
  };

  it("should create a transaction and its payable successfully with valid payload", async () => {
    const transactionRepo = createTransactionRepositoryInMemory();
    const payableRepo = createPayableRepositoryInMemory();
    const feature = createTransactinWithPayableFeature(
      transactionRepo,
      payableRepo,
    );

    const result = await feature.execute(validTransactionPayload);

    expect(result.ok).toBe(true);

    const transaction = result.value as Transaction;
    expect(transaction).toHaveProperty("id");
    expect(transaction.value).toBe(validTransactionPayload.value);
    expect(transaction.description).toBe(validTransactionPayload.description);
    expect(transaction.method).toBe(validTransactionPayload.method);

    const payableList = await payableRepo.list() as Success<Payable[]>;

    expect(payableList.ok).toBe(true);
    const payable = payableList.value.find((p) =>
      p.transactionId === transaction.id
    );
    expect(payable).toBeDefined();
    expect(payable?.subtotal).toBe(validTransactionPayload.value);
  });

  it("should apply mask credit and debit card number", async () => {
    const transactionRepo = createTransactionRepositoryInMemory();
    const payableRepo = createPayableRepositoryInMemory();
    const feature = createTransactinWithPayableFeature(
      transactionRepo,
      payableRepo,
    );

    const creditCardResult = await feature.execute(validTransactionPayload);
    const { card: creditCard } = creditCardResult
      .value as CreditCardTransaction;

    const debitCardResult = await feature.execute(validTransactionPayload);
    const { card: debitCard } = debitCardResult.value as DebitCardTransaction;

    expect(creditCard.number).toBe("**********345678");
    expect(debitCard.number).toBe("**********345678");
  });

  it("should return a failure if transaction repository fails to save transaction", async () => {
    const transactionRepo = createTransactionRepositoryInMemory(
      new Error("Transaction save error"),
    );
    const payableRepo = createPayableRepositoryInMemory();
    const feature = createTransactinWithPayableFeature(
      transactionRepo,
      payableRepo,
    );

    const result = await feature.execute(validTransactionPayload) as Failure<
      Error
    >;

    expect(result.ok).toBe(false);
    expect(result.value).toBeInstanceOf(Error);
    expect(result.value.message).toBe("Transaction save error");
  });

  it("should return a failure if payable repository fails to save payable", async () => {
    const transactionRepo = createTransactionRepositoryInMemory();
    const payableRepo = createPayableRepositoryInMemory(
      new Error("Payable save error"),
    );
    const feature = createTransactinWithPayableFeature(
      transactionRepo,
      payableRepo,
    );

    const result = await feature.execute(validTransactionPayload) as Failure<
      Error
    >;

    expect(result.ok).toBe(false);
    expect(result.value).toBeInstanceOf(Error);
    expect(result.value.message).toBe("Payable save error");
  });

  describe("Payable rule by payment method", () => {
    const transactionRepo = createTransactionRepositoryInMemory();

    describe("boleto", () => {
      it("should apply 1% tax and set status to waiting_funds", async () => {
        const payableRepo = createPayableRepositoryInMemory();
        const feature = createTransactinWithPayableFeature(
          transactionRepo,
          payableRepo,
        );

        const result = await feature.execute({
          ...validTransactionPayload,
          method: "boleto",
        });

        expect(result.ok).toBe(true);

        const { id } = result.value as Transaction;

        const { value: payables } = await payableRepo.list() as Success<
          Payable[]
        >;

        const payable = payables.find((p) => p.transactionId === id) as Payable;
        expect(payable).toBeDefined();
        expect(payable.createdAt).toBeInstanceOf(Date);
        expect(payable.subtotal).toBe(validTransactionPayload.value);
        expect(payable.tax).toBe(1);
        expect(payable.total).toBe(99);
        expect(payable.status).toBe("waiting_funds");
      });
    });

    describe("debit card", () => {
      it("should apply 2% tax and set status to paid", async () => {
        const payableRepo = createPayableRepositoryInMemory();
        const feature = createTransactinWithPayableFeature(
          transactionRepo,
          payableRepo,
        );

        const result = await feature.execute({
          ...validTransactionPayload,
          method: "debit_card",
        });

        expect(result.ok).toBe(true);

        const { id } = result.value as Transaction;

        const { value: payables } = await payableRepo.list() as Success<
          Payable[]
        >;

        const payable = payables.find((p) => p.transactionId === id) as Payable;
        expect(payable).toBeDefined();
        expect(payable.createdAt).toBeInstanceOf(Date);
        expect(payable.subtotal).toBe(validTransactionPayload.value);
        expect(payable.tax).toBe(2);
        expect(payable.total).toBe(98);
        expect(payable.status).toBe("paid");
      });
    });

    describe("crdit card", () => {
      it("should apply 5% tax and set status to waitng_funds", async () => {
        const payableRepo = createPayableRepositoryInMemory();
        const feature = createTransactinWithPayableFeature(
          transactionRepo,
          payableRepo,
        );

        const result = await feature.execute({
          ...validTransactionPayload,
          method: "credit_card",
        });

        expect(result.ok).toBe(true);

        const { id } = result.value as Transaction;

        const { value: payables } = await payableRepo.list() as Success<
          Payable[]
        >;

        const payable = payables.find((p) => p.transactionId === id) as Payable;
        expect(payable).toBeDefined();
        expect(payable.createdAt).toBeInstanceOf(Date);
        expect(payable.subtotal).toBe(validTransactionPayload.value);
        expect(payable.tax).toBe(5);
        expect(payable.total).toBe(95);
        expect(payable.status).toBe("waiting_funds");
      });
    });
  });
});
