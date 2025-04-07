import { expectTypeOf, test } from "vitest";
import type { InferAsyncOkTypes } from "./types";
import type { ResultAsync } from "./result-async.builder";

test("InferAsyncOkTypes should infer the Ok primitive values", () => {
	type ResultOk = number;
	type ResultExample = InferAsyncOkTypes<ResultAsync<number, never>>;

	expectTypeOf<ResultExample>().toEqualTypeOf<ResultOk>();
});

test("InferAsyncOkTypes should infer Ok object values", () => {
	type ResultOk = { name: number };
	type ResultExample = InferAsyncOkTypes<ResultAsync<ResultOk, never>>;

	expectTypeOf<ResultExample>().toEqualTypeOf<ResultOk>();
});

test("InferAsyncOkTypes should fail if wrong value is entered", () => {
	type ResultOk = { name: number }[];
	type ResultExample = InferAsyncOkTypes<ResultAsync<ResultOk, never>>;

	expectTypeOf<ResultExample>().toEqualTypeOf<ResultOk>();
});
