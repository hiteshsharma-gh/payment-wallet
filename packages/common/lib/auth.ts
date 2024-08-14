import { Account, NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google"
import prisma from "@repo/db";
import bcrypt from "bcrypt";
import { credentialsSchema } from "../zodSchema/authSchema";
import { JWT } from "next-auth/jwt";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: {
          label: "email",
          type: "text",
          placeholder: "johndoe@example.com",
        },
        password: {
          label: "password",
          type: "password",
          placeholder: "password",
        },
        type: {
          label: "type",
          type: "text",
          placeholder: "User or Merchant",
        },
      },
      async authorize(
        credentials: Record<"email" | "password" | "type", string> | undefined,
      ) {
        try {
          if (!credentials?.email || !credentials?.password || !credentials?.type) return null;

          const parsedData = credentialsSchema.safeParse(credentials);
          if (!parsedData.success) return null;

          const { email, password, type } = parsedData.data;

          const existingAccount = await prisma.account.findUnique({
            where: { email },
          });

          if (existingAccount) {
            if (existingAccount.authType != "Email") return null
          }

          if (existingAccount) {
            const validPassword = await bcrypt.compare(
              password,
              String(existingAccount.password),
            );
            if (validPassword) return existingAccount;

            return null;
          }

          const saltRounds = parseInt(process.env.SALT_ROUNDS || '10', 10)
          const hashedPassword = await bcrypt.hash(password, saltRounds);

          const user = await prisma.account.create({
            data: {
              email,
              password: hashedPassword,
              type,
              authType: "Email"
            },
          });

          return user;
        } catch (error) {
          console.error("Error creating user:", error);

          return null;
        }
      },
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || ""
    })
  ],
  secret: process.env.JWT_SECRET || "",
  callbacks: {
    async signIn(params: any) {
      console.log(params)

      return true
    },
    async jwt({ token, account }: { token: JWT, account: Account | null }) {
      console.log(token, account)

      return token
    },
    async session({ token, session }: any) {
      console.log(token, session)
      session.user.id = token.sub

      return session
    }
  }
};
