import { describe, expect, it } from "vitest";
import { errSync, okSync } from "../export";
import { ResultAsync } from "./result-async";

//############################################################
//##################### ResultAsync ##########################
//############################################################

describe("ResultAsync", () => {
    it("should be able to create a ResultAsync", async () => {
        const okResult = new ResultAsync(Promise.resolve(okSync("value")));

        expect(okResult).toBeInstanceOf(ResultAsync);
        expect(await okResult.isOk()).toBe(true);
        expect(await okResult.unwrap()).toBe("value");

        const errResult = new ResultAsync(Promise.resolve(errSync("error")));

        expect(errResult).toBeInstanceOf(ResultAsync);
        expect(await errResult.isErr()).toBe(true);
        await expect(() => errResult.unwrap()).rejects.toThrow();
    });
});
