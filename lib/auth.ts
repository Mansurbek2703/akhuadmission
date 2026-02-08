import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import type { UserRole } from "./types";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "al-xorazmiy-secret-key-2025-change-in-production"
);

export interface TokenPayload {
  userId: string;
  email: string;
  role: UserRole;
}

export async function createToken(payload: TokenPayload): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("7d")
    .setIssuedAt()
    .sign(JWT_SECRET);
}

export async function verifyToken(
  token: string
): Promise<TokenPayload | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload as unknown as TokenPayload;
  } catch {
    return null;
  }
}

export async function getSession(): Promise<TokenPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get("session")?.value;
  if (!token) return null;
  return verifyToken(token);
}

export async function requireAuth(
  allowedRoles?: UserRole[]
): Promise<TokenPayload> {
  const session = await getSession();
  if (!session) {
    throw new Error("Unauthorized");
  }
  if (allowedRoles && !allowedRoles.includes(session.role)) {
    throw new Error("Forbidden");
  }
  return session;
}
