import { describe, it } from "jsr:@std/testing/bdd";
import { expect } from "jsr:@std/expect";
import { convertKeysToSnakeCase } from "@lib/to-snake-case.ts";

describe("convertKeysToSnakeCase", () => {
  it("should convert a flat object's keys to snake_case", () => {
    const input = { camelCaseKey: "value", anotherKey: 123 };
    const output = convertKeysToSnakeCase(input);
    expect(output).toEqual({ camel_case_key: "value", another_key: 123 });
  });

  it("should convert nested object's keys to snake_case", () => {
    const input = { nestedKey: { innerKey: "value" } };
    const output = convertKeysToSnakeCase(input);
    expect(output).toEqual({ nested_key: { inner_key: "value" } });
  });

  it("should convert arrays of objects", () => {
    const input = [{ firstKey: 1 }, { secondKey: 2 }];
    const output = convertKeysToSnakeCase(input);
    expect(output).toEqual([{ first_key: 1 }, { second_key: 2 }]);
  });

  it("should leave primitive values unchanged", () => {
    expect(convertKeysToSnakeCase(42)).toBe(42);
    expect(convertKeysToSnakeCase("test")).toBe("test");
  });
});
