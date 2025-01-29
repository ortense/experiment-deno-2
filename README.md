# Deno Experiment API

This project is a Deno-based REST API designed to register e-commerce
transactions with multiple payment methods, including credit card, debit card,
and boleto (bank slip). The project emphasizes modularity, testability, and
robust error handling, adhering to best practices in software architecture.

## Key Design Decisions

This project follows architectural and naming conventions that emphasize
modularity, consistency, and extensibility. These design patterns make the
project easy to navigate, maintain, and scale as new features or modules are
added.

### Explicit Error Handling with `Result`

The `Result` pattern is used across the project to handle both success and
failure cases explicitly, avoiding the need for try-catch blocks and improving
code readability. This pattern also supports clear type safety, ensuring each
function's outcome is clear.

- **Success:** Contains the expected result data.
- **Failure:** Contains an `Error` object detailing the failure.

```ts
export type Success<T> = Readonly<{ ok: true; value: T }>;

export type Failure<E extends Error> = Readonly<{ ok: false; value: E }>;

export type Result<S, F extends Error = Error> = Success<S> | Failure<F>;
```

### Modular Architecture

The project is structured to maximize modularity, enabling easy maintenance and
scalability. Key components include:

- **Features:** Each feature encapsulates a specific functionality, such as
  creating or retrieving data.
- **Repository:** An in-memory repository handles data persistence, simulating
  database operations.
- **Router:** Defines the RESTful routes for the API.
- **Schema and Types:** Validation and typing ensure consistency and security
  across the application.

#### Consistent Naming Conventions

To ensure that the project remains easy to navigate and maintain, we have
adopted a naming and organizational pattern that allows quick identification of
each file’s role and scope of responsibility. This pattern can be used as a
model when creating new modules or extending existing functionality, offering a
clear development guideline.

#### Function-Based Organization

Each module follows a structured layout organized into subfolders, separating
features, repository, routing, validation, and typing. This structure allows
each component to be developed, tested, and maintained independently.

Example directory layout for a module:

```
module/<module-name>/
├── feature/
│   └── [descritive-name].ts
├── repository/
│   └── [kind-of-repository].ts 
├── [module-name].router.ts
├── [module-name].schema.ts
└── [module-name].type.ts
```

This pattern also allows for easy expansion to include new modules in the
system. For example, to add a user module, the same naming conventions apply:

```
module/user/
├── feature/
│   ├── create-user.ts
│   ├── change-password.ts
│   └── get-user.ts
├── repository/
│   └── in-memory.ts
├── user.router.ts
├── user.schema.ts
└── user.type.ts
```

- `create-user.ts` - Contains the feature for create a new user on the system.
- `change-password.ts` - Contains the feature for change the user's password.
- `get-user.ts` - Contains the feature for retrieve a specific user.
- `user.router.ts` - Contains a function to create the user router with `Hono`.
- `user.schema.ts` - Defines the user validation schemas, reusable across
  different parts of the module.
- `user.types.ts` - Contains TypeScript types for the module, ensuring
  consistency in types.

### Validation with Zod

Using Zod for schema validation ensures that incoming data adheres to the
expected structure, reducing the risk of runtime errors due to unexpected
inputs. Validation is centralized in `[module-name].schema.ts` for reusability
and consistency.

### Types Derived from Schemas

In this project, TypeScript types of business objects are derived directly from
Zod schemas, ensuring that validation and typing remain consistent throughout
the application. By inferring types from the Zod schemas, we create a single
source of truth for both validation rules and type definitions. This approach
reduces redundancy and helps prevent discrepancies between expected data shapes
and validated structures.

Using Zod's `z.infer` utility, types are automatically inferred from the
schemas. This pattern is applied in the `[module-name].type.ts` file, where each
schema-based type definition aligns with the corresponding Zod validation
schema.

#### Example

Here is an example of how types are defined base on schemas in this project

```ts
// module/user/user.schema.ts
import { z } from "zod";

export const userSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(3).max(200),
  email: z.string().email(),
});

// module/user/user.types.ts
import { z } from "zod";
import { userSchema } from "@module/user/user.schema.ts";

export type User = z.infer<typeof userSchema>;
```

In this example, the `User` type is derived directly from `userSchema`, ensuring
that any change in the schema will automatically propagate to the corresponding
type. This reduces the likelihood of inconsistencies between validation logic
and TypeScript types, improving reliability and maintainability.

By using schema-based types, developers can confidently work with data
structures knowing that they are correctly validated and typed across the
application.

### Separation of Repositories and Business Logic in Features

The `repository` and `feature` are separated to maintain independence between
data storage logic and business logic. The repository handles data storage
operations (e.g., database, caching), while the feature encapsulates the
business logic. This pattern makes it easy to swap the repository (e.g., from an
in-memory store to a real database) without modifying business logic.

#### Generic Repository Structure

Each module should define the repository type in `[module-name].type.ts` in an
implementation-agnostic way, and then implement it in
`[module-name]/repository/<kind-of-repository>.ts`. Is strongly recommended to
implement an `in-memory` repository for use in unit testing.

Example:

```ts
// module/user/user.types.ts
export type UserRepository = {
  save(input: CreateTransactionPayload): Promise<Result<User>>;
  getById(id: string): Promise<Result<User | null>>;
};

// module/user/repository/in-memory.ts
export function createUserRepositoryInMemory(
  err?: Error,
  initial: User[] = [],
): UserRepository {
  const data: User[] = [...initia];

  return {
    async save(input) {
      if (err) return failure(err);
      const transaction = { id: crypto.randomUUID(), ...input };

      data.push(transaction);
      return success(transaction);
    },

    async getById(id) {
      if (err) return failure(err);
      const transaction = data.find((item) => item.id === id);

      if (transaction) return success(transaction);
      return success(null);
    },
  };
}
```

#### Reusable Feature Structure

Each `feature` is encapsulated in a object that includes the `execute` method,
this object is created by a function exported from the feature file that
receives the feature dependencies as parameters, which enhances testability and
maintains consistency. This approach allows all features to follow a uniform
format, making them isolated, and each one has a specific, well-defined purpose.
As a result, new features can be added easily by following the same model.

Example: `module/user/feature/create-user.ts`

```ts
export function createUserFeature(repo: UserRepository) {
  return {
    async execute(input: CreateUserPayload): Promise<Result<User>> {
      // business logic
      const result = await repo.save(input);

      if (isFailure(result)) return failure(result.value);

      return success(result.value);
    },
  };
}
```

## Run locally

To run this project locally, you need to have [Deno](https://deno.com/)
installed on your machine.

- **Deno Installation:** Follow the Deno installation instructions for your
  operating system.
- **Automatic Dependency Management:** Deno automatically manages dependencies,
  so there’s no need for a separate installation step for libraries or modules.
- **Development Mode:** Run the project in watch mode with:

```bash
deno task dev
```

This command will start the server and automatically reload on file changes.

## Unit and integration tests

This project uses Deno’s standard library for testing.

- **Test Structure:** All test files are located close to the corresponding
  logic files, following a structure that improves readability and
  maintainability. Each feature and repository has its own test file with the
  suffix `_test`.
- **Running Tests:** To execute all unit and integration tests, use:

```bash
deno test
```

### Code Coverage

- Deno provides basic code coverage analysis. For a more detailed report, you
  can install `lcov` globally. For example, on macOS, you can run
  `brew install lcov`.
- To see the coverage results directly in the terminal:

```bash
deno task coverage
```

- Ensure lcov is installed on your machine, then use the following command to
  generate an HTML report.

```bash
deno task coverage:report
```

This command will create an HTML report at `./coverage/report/index.html`. Open
the index.html file in your browser to view the detailed coverage report.

## Build to production

The project assumes the production environment uses a compiled version of the
application for better performance and security.

- **Build Command:** Use the following command to create a binary for
  production:

```bash
deno task build
```

The binary will be saved as `./bin/api`.

### Multi-Stage Dockerfile

To build and run the application in a production-ready Docker container, a
multi-stage Dockerfile is used. This approach creates a small, optimized image
by building the application in one stage and copying the binary into a
lightweight production image.

```
FROM denoland/deno:alpine AS build

WORKDIR /app

COPY deno.json deno.lock ./
COPY . .

RUN deno task build 

FROM denoland/deno:alpine

WORKDIR /app

COPY --from=build /app/bin/api /app/api

EXPOSE 8000

CMD ["./api"]
```

This Dockerfile uses the deno:alpine base image to first compile the binary in a
build stage and then copy it into a minimal Deno runtime environment. The result
is a streamlined Docker image ready for production use, with the application
listening on port `8000`.
