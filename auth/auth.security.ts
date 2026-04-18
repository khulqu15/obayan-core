import { createHash, randomBytes } from "node:crypto";

export function generateRawToken(size = 32) {
    return randomBytes(size).toString("hex");
}

export function sha256(value: string) {
    return createHash("sha256").update(value).digest("hex");
}