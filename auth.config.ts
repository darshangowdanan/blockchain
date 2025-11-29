import { compare } from "bcryptjs";
import CredentialsProvider from "next-auth/providers/credentials";
import type { NextAuthOptions } from "next-auth";

import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";

export const authConfig: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },

      async authorize(credentials) {
        await connectDB();

        const user = await User.findOne({ email: credentials?.email });
        if (!user) throw new Error("No user found");

        const isValid = await compare(credentials!.password, user.password);
        if (!isValid) throw new Error("Invalid password");

        // DO NOT CHANGE (your original return)
        return {
          id: user._id.toString(),
          name: user.full_name,
          email: user.email,
        };
      },
    }),
  ],

  session: {
    strategy: "jwt", // keep your current strategy
  },

  // ONLY NEW PART — does NOT break anything
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;       // attach user.id
        token.email = user.email; // attach user.email
        token.name = user.name;   // attach user.name
      }
      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        // session.user.id = token.id as string;
        session.user.email = token.email as string;
        session.user.name = token.name as string;
      }
      return session;
    },
  },

  pages: {
    signIn: "/signin",
  },

  secret: process.env.NEXTAUTH_SECRET,
};
