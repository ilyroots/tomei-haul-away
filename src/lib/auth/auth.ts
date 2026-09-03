import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/db/prisma";
import { logger } from "@/lib/logging/logger";

const credentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

const RATE_LIMIT = new Map<string, { count: number; resetAt: number }>();
const MAX_ATTEMPTS = 5;
const WINDOW_MS = 15 * 60 * 1000; // 15 minutes

export function checkRateLimit(identifier: string): boolean {
  const now = Date.now();
  const record = RATE_LIMIT.get(identifier);

  if (!record || now > record.resetAt) {
    RATE_LIMIT.set(identifier, { count: 1, resetAt: now + WINDOW_MS });
    return true;
  }

  if (record.count >= MAX_ATTEMPTS) {
    return false;
  }

  record.count += 1;
  return true;
}

export const {
  handlers: { GET, POST },
  auth,
  signIn,
  signOut,
} = NextAuth({
  trustHost: true,
  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      authorize: async (credentials) => {
        const parsed = credentialsSchema.safeParse(credentials);
        if (!parsed.success) {
          logger.warn("Invalid admin login payload");
          return null;
        }

        const { email, password } = parsed.data;

        if (!checkRateLimit(email.toLowerCase())) {
          logger.warn("Admin login rate limit exceeded", { email });
          return null;
        }

        const admin = await prisma.admin.findUnique({
          where: { email: email.toLowerCase() },
        });

        if (!admin || !admin.isActive) {
          logger.warn("Admin login attempt for unknown or inactive account", { email });
          return null;
        }

        const valid = await bcrypt.compare(password, admin.passwordHash);
        if (!valid) {
          logger.warn("Failed admin login attempt", { email });
          return null;
        }

        await prisma.admin.update({
          where: { id: admin.id },
          data: { lastLoginAt: new Date() },
        });

        logger.info("Admin logged in", { adminId: admin.id, email: admin.email });

        return {
          id: admin.id,
          email: admin.email,
          name: admin.name ?? undefined,
          role: admin.role,
        };
      },
    }),
  ],
  session: {
    strategy: "jwt",
    maxAge: 8 * 60 * 60, // 8 hours
  },
  pages: {
    signIn: "/admin/login",
    error: "/admin/login",
  },
  cookies: {
    sessionToken: {
      name:
        process.env.NODE_ENV === "production"
          ? "__Secure-next-auth.session-token"
          : "next-auth.session-token",
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production",
      },
    },
  },
  callbacks: {
    jwt: async ({ token, user }) => {
      if (user) {
        token.id = user.id;
        token.role = user.role;
      }
      return token;
    },
    session: async ({ session, token }) => {
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
      }
      return session;
    },
  },
});

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
    };
  }

  interface User {
    role: string;
  }

  interface JWT {
    id?: string;
    role?: string;
  }
}
