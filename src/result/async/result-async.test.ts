import { describe, expect, it, vi } from "vitest";
import { err, infer, ok, ResultAsync, safeTry, toAsync } from "./result-async";
import { okSync, errSync } from "../sync/result-sync";

//############################################################
//##################### ResultAsync ##########################
//############################################################

describe("ResultAsync", () => {
    it("should be able to create a ResultAsync from Result Ok", async () => {
        const okResult = new ResultAsync(Promise.resolve(okSync("value")));

        expect(okResult).toBeInstanceOf(ResultAsync);
    });

    it("should be able to create a ResultAsync from Result Err", async () => {
        const errResult = new ResultAsync(Promise.resolve(errSync("error")));

        expect(errResult).toBeInstanceOf(ResultAsync);
    });
});

//############################################################
//##################### andThen() ############################
//############################################################

describe("ResultAsync.andThen()", () => {
    it("should transform success values with callback function", async () => {
        const okResult = ok(10);
        const result = await okResult.andThen((val) => ok(val * 2)).unwrap();

        expect(result).toBe(20);
    });

    it("should support chaining multiple andThen calls", async () => {
        const okResult = ok(10);
        const result = await okResult
            .andThen((val) => ok(val * 2))
            .andThen((val) => ok(val + 5))
            .unwrap();

        expect(result).toBe(25);
    });

    it("should propagate errors from the original result", async () => {
        const errResult = err("original error");
        const mockFn = vi.fn();

        const result = errResult.andThen(mockFn);

        await expect(() => result.unwrap()).rejects.toThrow("original error");
        expect(mockFn).not.toHaveBeenCalled();
    });

    it("should propagate errors from the callback function", async () => {
        const okResult = ok(10);
        const result = okResult.andThen(() => err("new error"));

        await expect(() => result.unwrap()).rejects.toBe("new error");
    });

    it("should work with async callbacks", async () => {
        const okResult = ok(10);
        const result = await okResult
            .andThen(async (val) => {
                return ok(await Promise.resolve(val * 2));
            })
            .unwrap();

        expect(result).toBe(20);
    });
});

//############################################################
//##################### orElse() #############################
//############################################################

describe("ResultAsync.orElse()", () => {
    it("should return the original result if it's successful", async () => {
        const okResult = ok("success");
        const mockFn = vi.fn();

        const result = await okResult.orElse(mockFn).unwrap();

        expect(mockFn).not.toHaveBeenCalled();
        expect(result).toBe("success");
    });

    it("should recover from error using callback function", async () => {
        const errResult = err("error");
        const result = await errResult.orElse(() => ok("recovered")).unwrap();

        expect(result).toBe("recovered");
    });

    it("should support chaining multiple orElse calls", async () => {
        const errResult = err("first error");
        const result = await errResult
            .orElse(() => err("second error"))
            .orElse(() => ok("finally recovered"))
            .unwrap();

        expect(result).toBe("finally recovered");
    });

    it("should not call the callback function if result is ok", async () => {
        let callbackCalled = false;
        const okResult = ok("success");

        await okResult
            .orElse(() => {
                callbackCalled = true;
                return ok("alternate");
            })
            .unwrap();

        expect(callbackCalled).toBe(false);
    });

    it("should propagate the new error if callback returns an error", async () => {
        const errResult = err("original error");
        const result = errResult.orElse(() => err("new error"));

        await expect(() => result.unwrap()).rejects.toBe("new error");
    });

    it("should work with async callbacks", async () => {
        const errResult = err("error");
        const result = await errResult
            .orElse(async () => {
                return ok(await Promise.resolve("async recovered"));
            })
            .unwrap();

        expect(result).toBe("async recovered");
    });
});

// ###########################################################
// #################### STATIC METHODS #######################
// ###########################################################

//############################################################
//##################### ok() #################################
//############################################################

describe("ResultAsync.ok()", () => {
    it("should be able to create a ResultAsync ", async () => {
        const okResult = ok("value");

        expect(okResult).toBeInstanceOf(ResultAsync);
    });
});

//############################################################
//##################### err() ################################
//############################################################

describe("ResultAsync.err()", () => {
    it("should be able to create a ResultAsync", async () => {
        const errResult = err("error");

        expect(errResult).toBeInstanceOf(ResultAsync);
    });
});

//############################################################
//##################### toAsync() ############################
//############################################################

describe("ResultAsync.toAsync()", () => {
    it("should be able to create a ResultAsync from Result Ok", async () => {
        const okResult = toAsync(okSync("value"));

        expect(okResult).toBeInstanceOf(ResultAsync);
    });
    it("should be able to create a ResultAsync from Result Err", async () => {
        const errResult = toAsync(errSync("error"));

        expect(errResult).toBeInstanceOf(ResultAsync);
    });
});

//############################################################
//##################### safeTry() ############################
//############################################################

describe("Result.safeTry()", () => {
    it("should return Ok result with function success", async () => {
        const value = 42;
        const fn = () => Promise.resolve(value);

        const result = safeTry(fn);

        expect(await result.unwrap()).toBe(value);
    });

    it("should return Err result when function throws", async () => {
        const message = "Something went wrong";
        const fn = () => Promise.reject(new Error(message));

        const result = safeTry(fn);

        await expect(() => result.unwrap()).rejects.toThrow(message);
    });

    it("should modify the error if `fnErr` is provided", async () => {
        const fn = () => Promise.reject(new Error("Original error"));

        const message = "Custom error message";
        const fnErr = () => new Error(message);

        const result = safeTry(fn, fnErr);

        await expect(() => result.unwrap()).rejects.toThrow(message);
    });
});

//############################################################
//##################### infer() ##############################
//############################################################

describe("Result.inferSync()", () => {
    it("should return the same Result", async () => {
        const ok = 10;
        const mockFn = (value: number) => {
            return value > 10
                ? Promise.reject(errSync(new Error()))
                : Promise.resolve(okSync(value));
        };
        const inferFn = infer(mockFn);

        const result = await mockFn(ok);

        expect(await inferFn(ok)).toStrictEqual(result);
    });
});
