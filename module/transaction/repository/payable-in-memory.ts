// deno-lint-ignore-file require-await
import type {
  Payable,
  PayableRepository,
} from "@module/transaction/transaction.type.ts";
import { failure, success } from "@lib/result.ts";

export function createPayableRepositoryInMemory(
  error?: Error,
  initialData: Payable[] = [],
): PayableRepository {
  const data: Payable[] = [...initialData];

  return {
    async list() {
      if (error) return failure(error);
      return success([...data]);
    },

    async save(input) {
      if (error) return failure(error);

      const payable = {
        id: crypto.randomUUID(),
        createdAt: new Date(),
        ...input,
      };

      data.push(payable);

      return success(payable);
    },
  };
}
