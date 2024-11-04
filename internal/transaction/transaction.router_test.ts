import { describe, it } from "jsr:@std/testing/bdd";
import { expect } from "jsr:@std/expect";
import { createTransactionRepositoryInMemory } from "@internal/transaction/repository/transaction-in-memory.ts";
import { createPayableRepositoryInMemory } from "@internal/transaction/repository/payable-in-memory.ts";
import { createTransactionRouter } from "@internal/transaction/transaction.router.ts";
import {
  CreateTransactionPayload,
  CreditCardTransaction,
  Transaction,
} from "@internal/transaction/transaction.type.ts";

describe("Transaction Router", () => {
  describe("POST /", () => {
    it("should store transaction on the repository", async () => {
      const transactionRepo = createTransactionRepositoryInMemory();
      const payableRepo = createPayableRepositoryInMemory();
      const router = createTransactionRouter(transactionRepo, payableRepo);
      const input: CreateTransactionPayload = {
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

      const response = await router.request("/", {
        method: "POST",
        headers: new Headers({ "Content-Type": "application/json" }),
        body: JSON.stringify(input),
      });

      const { id }: Transaction = await response.json();
      const { value } = await transactionRepo.getById(id);
      const stored = value as CreditCardTransaction;

      expect(response.status).toBe(201);
      expect(stored.value).toBe(input.value);
      expect(stored.method).toBe(input.method);
      expect(stored.description).toBe(input.description);
      expect(stored.card).toEqual({
        ...input.card,
        number: "**********345678",
      });
    });

    it("should return a 400 status for invalid payload", async () => {
      const transactionRepo = createTransactionRepositoryInMemory();
      const payableRepo = createPayableRepositoryInMemory();
      const router = createTransactionRouter(transactionRepo, payableRepo);

      const inputWithoutValue = {
        description: "Invalid Transaction",
        method: "credit_card",
        card: {
          number: "1234567812345678",
          holderName: "John Doe",
          expiration: "12/25",
          cvv: "123",
        },
      };

      const response = await router.request("/", {
        method: "POST",
        headers: new Headers({ "Content-Type": "application/json" }),
        body: JSON.stringify(inputWithoutValue),
      });

      expect(response.status).toBe(400);
      const errorResponse = await response.json();
      expect(errorResponse).toHaveProperty("error");
    });

    it("should return a 500 status if there is an internal server error in the repository", async () => {
      const transactionRepo = createTransactionRepositoryInMemory(
        new Error("Internal Server Error"),
      );
      const payableRepo = createPayableRepositoryInMemory();

      const router = createTransactionRouter(transactionRepo, payableRepo);
      const input: CreateTransactionPayload = {
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

      const response = await router.request("/", {
        method: "POST",
        headers: new Headers({ "Content-Type": "application/json" }),
        body: JSON.stringify(input),
      });

      const errorResponse = await response.json();

      expect(response.status).toBe(500);
      expect(errorResponse).toHaveProperty("ok", false);
      expect(errorResponse).toHaveProperty("error", "Internal Server Error");
    });
  });

  describe("GET /", () => {
    it("should list all transactions", async () => {
      const initialData: Transaction[] = [
        {
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
        },
        {
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
        },
      ];

      const transactionRepo = createTransactionRepositoryInMemory(
        undefined,
        initialData,
      );
      const payableRepo = createPayableRepositoryInMemory();
      const router = createTransactionRouter(transactionRepo, payableRepo);

      const response = await router.request("/");
      const transactions = await response.json();

      expect(response.status).toBe(200);
      expect(transactions.length).toBe(initialData.length);
      expect(transactions).toContainEqual(initialData[0]);
      expect(transactions).toContainEqual(initialData[1]);
    });

    it("should return a 500 status if there is an internal server error in the repository", async () => {
      const transactionRepo = createTransactionRepositoryInMemory(
        new Error("Internal Server Error"),
      );
      const payableRepo = createPayableRepositoryInMemory();
      const router = createTransactionRouter(transactionRepo, payableRepo);

      const response = await router.request("/", { method: "GET" });
      const errorResponse = await response.json();

      expect(response.status).toBe(500);
      expect(errorResponse).toHaveProperty("ok", false);
      expect(errorResponse).toHaveProperty("error", "Internal Server Error");
    });
  });

  describe("GET /:id", () => {
    it("should retrieve a transaction by ID", async () => {
      const initialTransaction: Transaction = {
        id: "7e1dccf5-1e75-4af9-916b-bc2badffdf8e",
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

      const transactionRepo = createTransactionRepositoryInMemory(undefined, [
        initialTransaction,
      ]);
      const payableRepo = createPayableRepositoryInMemory();
      const router = createTransactionRouter(transactionRepo, payableRepo);

      const response = await router.request(`/${initialTransaction.id}`, {
        method: "GET",
      });
      const transaction = await response.json();

      expect(response.status).toBe(200);
      expect(transaction).toEqual(initialTransaction);
    });

    it("should return a 404 status if transaction ID does not exist", async () => {
      const transactionRepo = createTransactionRepositoryInMemory();
      const payableRepo = createPayableRepositoryInMemory();
      const router = createTransactionRouter(transactionRepo, payableRepo);

      const response = await router.request(
        "/25f9fbad-d892-44b9-bf46-5d243d15f897",
      );
      const errorResponse = await response.json();

      expect(response.status).toBe(404);
      expect(errorResponse).toHaveProperty("message", "transaction not found");
    });

    it("should return a 400 status if transaction ID is not a valid UUID", async () => {
      const transactionRepo = createTransactionRepositoryInMemory();
      const payableRepo = createPayableRepositoryInMemory();
      const router = createTransactionRouter(transactionRepo, payableRepo);

      const response = await router.request("/not-a-uuid");
      const errorResponse = await response.json();

      expect(response.status).toBe(400);
      expect(errorResponse?.error?.issues?.[0]).toHaveProperty(
        "message",
        "Invalid uuid",
      );
    });

    it("should return a 500 status if there is an internal server error in the repository", async () => {
      const transactionRepo = createTransactionRepositoryInMemory(
        new Error("Internal Server Error"),
      );
      const payableRepo = createPayableRepositoryInMemory();
      const router = createTransactionRouter(transactionRepo, payableRepo);

      const response = await router.request(
        "/25f9fbad-d892-44b9-bf46-5d243d15f897",
      );
      const errorResponse = await response.json();

      expect(response.status).toBe(500);
      expect(errorResponse).toHaveProperty("ok", false);
      expect(errorResponse).toHaveProperty("error", "Internal Server Error");
    });
  });
});
