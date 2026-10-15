import "server-only";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import { createHash, randomBytes } from "node:crypto";
import { prisma } from "@/lib/prisma";

const SESSION_COOKIE = "cafe_session";
const SESSION_DURATION_MS = 1000 * 60 * 60 * 12; // 12 hours
const BCRYPT_ROUNDS = 12;
const PASSWORD_HASH_PREFIX = "sha256-bcrypt-v1:";

function prehashPassword(plain: string): string {
  return createHash("sha256").update(plain, "utf8").digest("hex");
}

/* ---------- Password ---------- */

export async function hashPassword(plain: string): Promise<string> {
  // bcrypt considers at most 72 input bytes. Pre-hashing keeps long Unicode
  // passwords unambiguous while the prefix preserves legacy hash compatibility.
  return PASSWORD_HASH_PREFIX + await bcrypt.hash(prehashPassword(plain), BCRYPT_ROUNDS);
}

export async function verifyPassword(
  plain: string,
  hash: string
): Promise<boolean> {
  if (hash.startsWith(PASSWORD_HASH_PREFIX)) {
    return bcrypt.compare(prehashPassword(plain), hash.slice(PASSWORD_HASH_PREFIX.length));
  }

  // Existing installations have unprefixed bcrypt hashes; continue to accept them.
  return bcrypt.compare(plain, hash);
}

/* ---------- Admin ---------- */

export async function getAdmin() {
  return prisma.admin.findFirst();
}

export async function adminExists(): Promise<boolean> {
  const count = await prisma.admin.count();
  return count > 0;
}

/* ---------- Session ---------- */

export async function createSession(): Promise<string> {
  const token = randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + SESSION_DURATION_MS);

  await prisma.session.create({
    data: { token, expiresAt },
  });

  return token;
}

export async function setSessionCookie(token: string): Promise<void> {
  const store = await cookies();
  store.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_DURATION_MS / 1000,
  });
}

export async function getSessionToken(): Promise<string | null> {
  const store = await cookies();
  return store.get(SESSION_COOKIE)?.value ?? null;
}

export async function verifySession(): Promise<boolean> {
  const token = await getSessionToken();
  if (!token) return false;

  const session = await prisma.session.findUnique({
    where: { token },
  });

  if (!session) return false;
  if (session.expiresAt < new Date()) {
    await prisma.session.delete({ where: { id: session.id } }).catch(() => {});
    return false;
  }

  return true;
}

export async function destroyCurrentSession(): Promise<void> {
  const token = await getSessionToken();
  if (token) {
    await prisma.session.deleteMany({ where: { token } }).catch(() => {});
  }
  const store = await cookies();
  store.delete(SESSION_COOKIE);
}

/* ---------- Cleanup ---------- */

export async function cleanupExpiredSessions(): Promise<number> {
  const result = await prisma.session.deleteMany({
    where: { expiresAt: { lt: new Date() } },
  });
  return result.count;
}