export const ResultStatus = {
    OK: "ok",
    ERR: "err",
} as const;

export type ResultStatus = (typeof ResultStatus)[keyof typeof ResultStatus];
