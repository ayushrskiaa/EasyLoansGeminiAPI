import { getServerSession as getNextAuthServerSession } from "next-auth";
import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { db } from "./db";
import { users } from "./db/schema";
import { eq } from "drizzle-orm";

// Ensure NEXTAUTH_SECRET is set
if (!process.env.NEXTAUTH_SECRET) {
  console.warn("Warning: NEXTAUTH_SECRET is not set. Using fallback secret.");
}

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        // For demo purposes: allow any email/password if database is not available
        // In production, always use database
        try {
          // Try to use database if available
          const user = await db
            .select()
            .from(users)
            .where(eq(users.email, credentials.email))
            .limit(1);

          if (user.length === 0) {
            // Create user if doesn't exist (demo mode)
            const [newUser] = await db
              .insert(users)
              .values({
                email: credentials.email,
                displayName: credentials.email.split("@")[0],
              })
              .returning();

            return {
              id: newUser.id,
              email: newUser.email,
              name: newUser.displayName || newUser.email,
            };
          }

          return {
            id: user[0].id,
            email: user[0].email,
            name: user[0].displayName || user[0].email,
          };
        } catch (error) {
          console.warn("Database not available, using demo mode auth:", error);
          // Fallback: allow login without database for demo purposes
          // Generate a consistent ID based on email (simple hash)
          const emailHash = credentials.email
            .split('')
            .reduce((acc, char) => acc + char.charCodeAt(0), 0)
            .toString(36);
          return {
            id: `demo-${emailHash}`,
            email: credentials.email,
            name: credentials.email.split("@")[0],
          };
        }
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/auth/signin",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET || "development-secret-change-in-production",
};

export async function getServerSession() {
  return await getNextAuthServerSession(authOptions);
}

