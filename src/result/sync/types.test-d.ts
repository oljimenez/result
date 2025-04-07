import { expectTypeOf, test } from "vitest";
import type { InferOkTypes } from "./types";
import type { Result } from "./result.builder";

test("InferOkTypes should infer the Ok primitive values", () => {
	type ResultExample = InferOkTypes<Result<number, boolean>>;

	expectTypeOf<ResultExample>().toEqualTypeOf<number>();
});

test("InferOkTypes should infer Ok object values", () => {
	type ResultOk = { name: string };
	type ResultExample = InferOkTypes<Result<ResultOk, boolean>>;

	expectTypeOf<ResultExample>().toEqualTypeOf<ResultOk>();
});

test("InferOkTypes should fail if wrong value is entered", () => {
	type ResultOk = { name: string }[];
	type ResultExample = InferOkTypes<Result<ResultOk, boolean>>;

	expectTypeOf<ResultExample>().toEqualTypeOf<ResultOk>();
});
