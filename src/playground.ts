import { safeTrySync } from "./result";

// Declare a unsafe function
function divideNumbers(a: number, b: number): number {
    if (b === 0) {
        throw new Error("Division by zero");
    }
    return a / b;
}

// Make it safe function
const safeDivideNumbers = safeTrySync(
    divideNumbers,
    (error) => new Error(`Division error: ${String(error)}`),
);

// Usage:
safeDivideNumbers(10, 2).match({
    ok: (result) => console.log(`Result: ${result}`),
    err: (error) => console.log(`An error occurred: ${error.message}`),
});

new TypeError();
