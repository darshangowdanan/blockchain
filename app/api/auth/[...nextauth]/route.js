import NextAuth from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { compare } from "bcryptjs"
import pool from "@/lib/db"

const handler = NextAuth({
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const { email, password } = credentials

        // Check if user exists
        const result = await pool.query("SELECT * FROM users WHERE email = $1", [email])
        const user = result.rows[0]
        if (!user) throw new Error("User not found")

        // Compare password
        const valid = await compare(password, user.password_hash)
        if (!valid) throw new Error("Invalid password")

        // Return user object
        return { id: user.id, name: user.full_name, email: user.email }
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/SignIn",
  },
  secret: process.env.NEXTAUTH_SECRET,
})

export { handler as GET, handler as POST }
