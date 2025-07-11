import { infer, ok, safeTry } from "../dist";

class DivisionError extends Error {
    readonly type = "DivideError" as const;
}

// Declare a unsafe function
function divideNumbers(a: number, b: number): Promise<number> {
    if (b === 0) {
        throw new Error("Division by zero");
    }
    return Promise.resolve(a / b);
}

// Make it safe function
const safeDivideNumbers = safeTry(
    divideNumbers,
    (error) => new DivisionError(`Division error: ${String(error)}`),
);

// Usage:
safeDivideNumbers(10, 2)
    .andThen((data) => ok(data))
    .match({
        ok: (result) => console.log(`Result: ${result}`),
        err: (error) => console.log(`An error occurred: ${error.message}`),
    });

const asd = infer(() => {
    return safeDivideNumbers(10, 0);
});
