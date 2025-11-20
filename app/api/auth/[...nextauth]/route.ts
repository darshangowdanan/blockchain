import NextAuth from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { compare } from "bcryptjs"
import { connectDB } from "@/lib/mongodb"
import User from "@/models/User"

const handler = NextAuth({
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },

      async authorize(credentials) {
        await connectDB()

        const user = await User.findOne({ email: credentials?.email })
        if (!user) throw new Error("No user found")

        const passwordMatch = await compare(
          credentials!.password,
          user.password
        )

        if (!passwordMatch) throw new Error("Invalid password")

        return {
          id: user._id.toString(),
          name: user.full_name,
          email: user.email,
        }
      },
    }),
  ],

  session: {
    strategy: "jwt",
  },

  pages: {
    signIn: "/signin",
  },

  secret: process.env.NEXTAUTH_SECRET,
})

export { handler as GET, handler as POST }
