import { expectTypeOf, test } from "vitest";
import type { InferAsyncErrTypes, InferAsyncOkTypes } from "./types";
import type { ResultAsync } from "./result-async.builder";

//############################################################
//##################### InferAsyncOkTypes ####################
//############################################################

test("InferAsyncOkTypes should infer the Ok primitive values", () => {
	type ResultExample = InferAsyncOkTypes<ResultAsync<number, boolean>>;

	expectTypeOf<ResultExample>().toEqualTypeOf<number>();
});

test("InferAsyncOkTypes should infer Ok object values", () => {
	type ResultOk = { name: string };
	type ResultExample = InferAsyncOkTypes<ResultAsync<ResultOk, boolean>>;

	expectTypeOf<ResultExample>().toEqualTypeOf<ResultOk>();
});

test("InferAsyncOkTypes should fail if wrong value is entered", () => {
	type ResultOk = { name: string }[];
	type ResultExample = InferAsyncOkTypes<ResultAsync<ResultOk, boolean>>;

	expectTypeOf<ResultExample>().toEqualTypeOf<ResultOk>();
});

//############################################################
//##################### InferAsyncErrTypes ###################
//############################################################

test("InferAsyncErrTypes should infer the Err primitive values", () => {
	type ResultErr = number;
	type ResultExample = InferAsyncErrTypes<ResultAsync<never, ResultErr>>;

	expectTypeOf<ResultExample>().toEqualTypeOf<ResultErr>();
});

test("InferAsyncErrTypes should infer Err object values", () => {
	type ResultErr = { name: number };
	type ResultExample = InferAsyncErrTypes<ResultAsync<never, ResultErr>>;

	expectTypeOf<ResultExample>().toEqualTypeOf<ResultErr>();
});

test("InferAsyncErrTypes should fail if wrong value is entered", () => {
	type ResultErr = { name: number }[];
	type ResultExample = InferAsyncErrTypes<ResultAsync<never, ResultErr>>;

	expectTypeOf<ResultExample>().toEqualTypeOf<ResultErr>();
});
