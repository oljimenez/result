import { errSync, okSync } from "./result-sync";

export class CustomError extends Error {
    name = "CustomError" as const;
}

export function syncFn(value: number) {
    if (value > 10) {
        throw new CustomError();
    }

    return value;
}

export function safeSyncFn(value: number) {
    if (value > 10) {
        return errSync(new CustomError());
    }

    return okSync(value);
}
