import type {
  Transaction,
  TransactionRepository,
} from "@internal/transaction/transaction.type.ts";
import type { Result } from "@lib/result.ts";

export function getTransactionFeature(repo: TransactionRepository) {
  return {
    async execute(input: string): Promise<Result<Transaction | null>> {
      const transaction = await repo.getById(input);

      return transaction;
    },
  };
}
