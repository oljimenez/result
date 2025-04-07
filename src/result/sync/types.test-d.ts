import { expectTypeOf, test } from "vitest";
import type { InferErrTypes, InferOkTypes } from "./types";
import type { Result } from "./result.builder";

//############################################################
//##################### InferOkTypes #########################
//############################################################

test("InferOkTypes should infer the Ok primitive values", () => {
	type ResultOk = number;
	type ResultExample = InferOkTypes<Result<ResultOk, never>>;

	expectTypeOf<ResultExample>().toEqualTypeOf<ResultOk>();
});

test("InferOkTypes should infer Ok object values", () => {
	type ResultOk = { name: number };
	type ResultExample = InferOkTypes<Result<ResultOk, never>>;

	expectTypeOf<ResultExample>().toEqualTypeOf<ResultOk>();
});

test("InferOkTypes should infer Ok array values", () => {
	type ResultOk = { name: number }[];
	type ResultExample = InferOkTypes<Result<ResultOk, never>>;

	expectTypeOf<ResultExample>().toEqualTypeOf<ResultOk>();
});

//############################################################
//##################### InferErrTypes #########################
//############################################################

test("InferErrTypes should infer the Err primitive values", () => {
	type ResultErr = number;
	type ResultExample = InferErrTypes<Result<never, ResultErr>>;

	expectTypeOf<ResultExample>().toEqualTypeOf<ResultErr>();
});

test("InferOkTypes should infer Err object values", () => {
	type ResultErr = { name: number };
	type ResultExample = InferErrTypes<Result<never, ResultErr>>;

	expectTypeOf<ResultExample>().toEqualTypeOf<ResultErr>();
});

test("InferErrTypes should fail if wrong value is entered", () => {
	type ResultErr = { name: number }[];
	type ResultExample = InferErrTypes<Result<never, ResultErr>>;

	expectTypeOf<ResultExample>().toEqualTypeOf<ResultErr>();
});
