import { type Result, r } from "./result";

class CustomError extends Error {
    name = "CustomError" as const;
}

class CustomError2 extends Error {
    name = "CustomError2" as const;
}

function hello(value: number): Result<null, CustomError | CustomError2> {
    if (value > 10) {
        return r.errSync(new CustomError("Value must be lower than 10"));
    }

    if (value > 20) {
        return r.errSync(new CustomError2("Value must be lower than 10"));
    }

    return r.okSync(null);
}
