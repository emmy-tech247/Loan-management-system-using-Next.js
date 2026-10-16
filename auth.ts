// auth.ts

import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import db from "@/lib/db";

export const { auth, signIn, signOut } = NextAuth({
  providers: [
    Credentials({
      credentials: {
        username: {},
        password: {},
      },

      async authorize(credentials) {
        if (!credentials?.username || !credentials?.password) {
          return null;
        }

        const username = String(credentials.username);
        const password = String(credentials.password);

        const member = await db.member.findFirst({
          where: {
            OR: [
              { email: username },
              { phone: username },
            ],
          },
        });

        if (!member) {
          return null;
        }

        const passwordMatches = await bcrypt.compare(
          password,
          member.password
        );

        if (!passwordMatches) {
          return null;
        }

        return {
          id: String(member.id),
          name: member.fullName,
          email: member.email ?? undefined,
        };
      },
    }),
  ],

  pages: {
    signIn: "/login",
  },

  session: {
    strategy: "jwt",
  },

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }

      return token;
    },

    async session({ session, token }) {
      if (session.user && token.id) {
        session.user.id = String(token.id);
      }

      return session;
    },
  },
});