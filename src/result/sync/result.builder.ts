import type { InferErrTypes, InferOkTypes } from "./types";

const Empty = Symbol("Empty");

type Empty = typeof Empty;

/**
 * @description
 * A class representing a result of an operation that can either be successful (Ok) or failed (Err).
 *
 * @template O - The type of the successful result.
 * @template E - The type of the error result.
 */
class Result<O, E> {
	/**
	 * @description
	 * Indicates whether the result is successful.
	 */
	public readonly ok: boolean;

	/**
	 * @description
	 * The successful value or Empty if the result is error.
	 */
	private readonly value: O | Empty;

	/**
	 * @description
	 * The error value or Empty if the result is successful.
	 */
	private readonly error: E | Empty;

	/**
	 * @description
	 * Constructs a new Result instance.
	 *
	 * @param ok - Indicates whether the result is successful.
	 * @param value - The value of the successful result or Empty.
	 * @param error - The error value or Empty.
	 */
	constructor(ok: boolean, value: O | Empty, error: E | Empty) {
		this.ok = ok;
		this.value = value;
		this.error = error;
	}

	/**
	 * @description
	 * Retrieves the error value.
	 *
	 * @returns The error value.
	 * @throws If the error value is empty. (ImpossibleError)
	 */
	private getErr(): E {
		if (this.error === Empty) {
			throw new Error("[result] ImpossibleError: error is empty");
		}
		return this.error;
	}

	/**
	 * @description
	 * Retrieves the successful result value.
	 *
	 * @returns The successful result value.
	 * @throws If the value is empty. (ImpossibleError)
	 */
	private getValue(): O {
		if (this.value === Empty) {
			throw new Error("[result] ImpossibleError: value is empty");
		}

		return this.value;
	}

	/**
	 * @description
	 * Unwraps the result, returning the successful value or throwing the error.
	 *
	 * @returns The successful result value.
	 * @throws The error value if the result is not successful.
	 */
	unwrap(): O {
		if (!this.ok) {
			throw this.getErr();
		}
		return this.getValue();
	}

	/**
	 * @description
	 * Unwraps the result, returning the successful value or a fallback value.
	 *
	 * @template T - The type of the fallback value.
	 * @param fallback - The fallback value to return if the result is not successful.
	 * @returns The successful result value or the fallback value.
	 */
	unwrapOr<T>(fallback: T): T | O {
		if (!this.ok) {
			return fallback;
		}
		return this.getValue();
	}

	/**
	 * @description
	 * Matches the result, executing a function based on whether it is successful or failed.
	 *
	 * @template TResult - The type of the result of the match function.
	 * @param args - An object containing the functions to execute for the successful and failed cases.
	 * @returns The result of the executed function.
	 */
	match<TResult>(args: {
		ok: (data: O) => TResult;
		err: (error: E) => TResult;
	}): TResult {
		if (!this.ok) {
			return args.err(this.getErr());
		}
		return args.ok(this.getValue());
	}

	/**
	 * @description
	 * Maps the Ok value of the Result to a new value.
	 * The function is only executed if the Result is an Ok
	 * and the result is used to create a new Ok value for the
	 *
	 * @template TOk - The type of the new successful result value.
	 * @param fn - The function to map the successful result value.
	 * @returns A new Result instance with the mapped value.
	 */
	map<TOk>(fn: (data: O) => TOk): Result<TOk, E> {
		if (!this.ok) {
			return Result.errSync(this.getErr());
		}
		return Result.okSync(fn(this.getValue()));
	}

	/**
	 * @description
	 * Maps the error value of the Result to a new value.
	 * The function is only executed if the Result is an Err
	 * and the result is used to create a new Err value for the
	 *
	 * @template TErr - The type of the new error value.
	 * @param fn - The function to map the error value.
	 * @returns A new Result instance with the mapped error value.
	 */
	mapErr<TErr>(fn: (err: E) => TErr): Result<O, TErr> {
		if (!this.ok) {
			return Result.errSync(fn(this.getErr()));
		}
		return Result.okSync(this.getValue());
	}

	/**
	 * @description
	 * Chains another Result to be executed if the current Result is an Ok.
	 * The function is only executed if the Result is an Ok
	 * and the result is used to create a new
	 * the error types are combined.
	 *
	 * @template TResult - The type of the result of the chained operation.
	 * @param fn - The function to execute if the result is successful.
	 * @returns A new Result instance representing the result of the chained operation.
	 */
	andThen<TResult extends Result<unknown, unknown>>(
		fn: (t: O) => TResult,
	): Result<InferOkTypes<TResult>, InferErrTypes<TResult> | E>;
	andThen<TOk, TErr>(fn: (t: O) => Result<TOk, TErr>): Result<TOk, E | TErr>;
	andThen(fn: (t: O) => Result<unknown, unknown>): Result<unknown, unknown> {
		if (!this.ok) {
			return Result.errSync(this.getErr());
		}
		return fn(this.getValue());
	}

	/**
	 * @description
	 * Chains another Result to be executed if the current Result is failed.
	 * The function is only executed if the Result is failed
	 * and the result is used to create a new
	 * the successful types are combined.
	 *
	 * @template TResult - The type of the result of the chained operation.
	 * @param fn - The function to execute if the result is failed.
	 * @returns A new Result instance representing the result of the chained operation.
	 */
	orElse<TResult extends Result<unknown, unknown>>(
		fn: (t: E) => TResult,
	): Result<O | InferOkTypes<TResult>, InferErrTypes<TResult>>;
	orElse<TOk, TErr>(fn: (t: E) => Result<TOk, TErr>): Result<O | TOk, TErr>;
	orElse(fn: (t: E) => Result<unknown, unknown>): Result<unknown, unknown> {
		if (!this.ok) {
			return fn(this.getErr());
		}
		return Result.okSync(this.getValue());
	}

	/**
	 * @description
	 * Executes a side-effect free function if the Result is an Ok.
	 * The function is only executed if the Result is an Ok.
	 * and the Result returned unchanged.
	 * this function should not throw an error.
	 *
	 * @param fn - The function to execute.
	 * @returns The original Result instance.
	 */
	andTee(fn: (ok: O) => unknown): Result<O, E> {
		if (!this.ok) {
			return Result.errSync(this.getErr());
		}

		try {
			fn(this.getValue());
		} catch (err) {
			throw new Error(
				`[service] andTee should not throw new errors, please move it to andThen, ${err}`,
				{ cause: err },
			);
		}

		return Result.okSync(this.getValue());
	}

	/**
	 * @description
	 * Executes a side-effect free function if the Result is an Err.
	 * The function is only executed if the Result is an Err
	 * and the Result returned unchanged.
	 * this function should not throw an error.
	 *
	 * @param fn - The function to execute.
	 * @returns The original Result instance.
	 */
	orTee(fn: (err: E) => unknown): Result<O, E> {
		if (this.ok) {
			return Result.okSync(this.getValue());
		}

		try {
			fn(this.getErr());
		} catch (err) {
			throw new Error(
				`[service] orTee should not throw new errors, please move it to orElse, ${err}`,
				{ cause: err },
			);
		}

		return Result.errSync(this.getErr());
	}

	// ##################################################
	// ###########      STATIC METHODS      #############
	// ##################################################

	/**
	 * @description
	 * Creates a successful result.
	 *
	 * @template O - The type of the successful result value.
	 * @template E - The type of the error value (default is never).
	 * @param okValue - The value of the successful result.
	 * @returns A successful Result instance.
	 */
	static okSync<O, E = never>(okValue: O): Result<O, E> {
		return new Result(true, okValue, Empty as E);
	}

	/**
	 * @description
	 * Creates a failed result.
	 *
	 * @template E - The type of the error value.
	 * @template O - The type of the successful result value (default is never).
	 * @param errorValue - The error value.
	 * @returns A failed Result instance.
	 */
	static errSync<E, O = never>(errorValue: E): Result<O, E> {
		return new Result(false, Empty as O, errorValue);
	}

	/**
	 * @description
	 * Attempts to execute a side effect function and captures any thrown errors as a failed result.
	 *
	 * @template O - The type of the successful result value.
	 * @template E - The type of the error value.
	 * @param fn - The side effect function to execute.
	 * @param fnErr - An optional function to map the error to a specific error type.
	 * @returns A Result instance representing the outcome of the attempted function execution.
	 */
	static safeTrySync<O, E>(
		fn: () => O,
		fnErr?: (error: unknown) => E,
	): Result<O, E> {
		try {
			return Result.okSync<O, E>(fn());
		} catch (error) {
			if (fnErr) {
				return Result.errSync<E, O>(fnErr(error));
			}
			return Result.errSync<E, O>(error as E);
		}
	}

	/**
	 * @description
	 * Infer the Ok and Err types of the returned Result
	 *
	 * @template TArgs - Any arguments
	 * @template TResult - A sync Result type
	 * @param fn - The function to execute.
	 * @returns A Result instance representing the outcome of the attempted function execution.
	 */
	static inferSync<
		TArgs extends any[],
		TResult extends Result<unknown, unknown>,
	>(
		fn: (...args: TArgs) => TResult,
	): (...args: TArgs) => Result<InferOkTypes<TResult>, InferErrTypes<TResult>>;
	static inferSync(fn: (...args: unknown[]) => unknown): typeof fn {
		return fn;
	}
}

export const okSync = Result.okSync;
export const errSync = Result.errSync;
export const safeTrySync = Result.safeTrySync;
export const inferSync = Result.inferSync;
export type { Result };
