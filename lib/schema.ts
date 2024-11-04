import z from "zod";

export const idSchema = z.string().uuid();

export const withId = z.object({ id: idSchema });

export const currencyValueSchema = z.number().int().positive();
