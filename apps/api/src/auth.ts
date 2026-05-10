import { createHmac, pbkdf2Sync, randomBytes, timingSafeEqual } from "node:crypto";

export interface TokenPayload {
  sub: string;
  email: string;
  permissions: string[];
  exp: number;
}

function base64Url(input: Buffer | string): string {
  return Buffer.from(input).toString("base64url");
}

function sign(input: string, secret: string): string {
  return createHmac("sha256", secret).update(input).digest("base64url");
}

export function hashPassword(password: string): string {
  const salt = randomBytes(16).toString("base64url");
  const hash = pbkdf2Sync(password, salt, 120_000, 32, "sha256").toString("base64url");
  return `pbkdf2_sha256$120000$${salt}$${hash}`;
}

export function verifyPassword(password: string, encoded: string): boolean {
  const [algorithm, iterations, salt, expectedHash] = encoded.split("$");
  if (algorithm !== "pbkdf2_sha256" || !iterations || !salt || !expectedHash) {
    return false;
  }

  const actual = pbkdf2Sync(password, salt, Number(iterations), 32, "sha256");
  const expected = Buffer.from(expectedHash, "base64url");
  return actual.length === expected.length && timingSafeEqual(actual, expected);
}

export function createToken(payload: Omit<TokenPayload, "exp">, secret: string, ttlSeconds: number): string {
  const header = base64Url(JSON.stringify({ alg: "HS256", typ: "JWT" }));
  const body = base64Url(JSON.stringify({ ...payload, exp: Math.floor(Date.now() / 1000) + ttlSeconds }));
  const unsigned = `${header}.${body}`;
  return `${unsigned}.${sign(unsigned, secret)}`;
}

export function verifyToken(token: string, secret: string): TokenPayload | null {
  const parts = token.split(".");
  if (parts.length !== 3 || !parts[0] || !parts[1] || !parts[2]) {
    return null;
  }

  const unsigned = `${parts[0]}.${parts[1]}`;
  const actual = Buffer.from(sign(unsigned, secret));
  const expected = Buffer.from(parts[2]);

  if (actual.length !== expected.length || !timingSafeEqual(actual, expected)) {
    return null;
  }

  const payload = JSON.parse(Buffer.from(parts[1], "base64url").toString("utf8")) as TokenPayload;
  if (payload.exp < Math.floor(Date.now() / 1000)) {
    return null;
  }

  return payload;
}
