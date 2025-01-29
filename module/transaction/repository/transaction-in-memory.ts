// deno-lint-ignore-file require-await
import type {
  Transaction,
  TransactionRepository,
} from "@module/transaction/transaction.type.ts";
import { failure, success } from "@lib/result.ts";

export function createTransactionRepositoryInMemory(
  error?: Error,
  initialData: Transaction[] = [],
): TransactionRepository {
  const data: Transaction[] = [...initialData];

  return {
    async list() {
      if (error) return failure(error);
      return success([...data]);
    },

    async save(input) {
      if (error) return failure(error);

      const transaction = { id: crypto.randomUUID(), ...input };

      data.push(transaction);

      return success(transaction);
    },

    async getById(id) {
      if (error) return failure(error);

      const transaction = data.find((item) => item.id === id);

      if (transaction) return success(transaction);

      return success(null);
    },
  };
}
