import { Account, NextAuthOptions, Profile } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google"
import prisma from "@repo/db";
import bcrypt from "bcrypt";
import { credentialsSchema } from "../zodSchema/authSchema";
import { JWT } from "next-auth/jwt";
import jwt from "jsonwebtoken"

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
          if (!process.env.SALT_ROUNDS || !process.env.JWT_SECRET) return null

          if (!credentials?.email || !credentials?.password || !credentials?.type) return null;

          const parsedData = credentialsSchema.safeParse(credentials);
          if (!parsedData.success) return null;

          const { email, password, type } = parsedData.data;

          const existingAccount = await prisma.account.findUnique({
            where: {
              email,
              type: "User"
            },
            include: {
              token: true,
              user: true,
            }
          });

          if (existingAccount) {
            if (existingAccount.authType != "Email") return null
          }

          if (existingAccount) {
            const validPassword = await bcrypt.compare(
              password,
              existingAccount.password?.toString() || "",
            );

            if (validPassword) {
              const payload = {
                id: existingAccount.id,
                email: existingAccount.email,
                authType: existingAccount.authType,
                type: existingAccount.type,
                verified: existingAccount.verified,
                user: existingAccount.user
              };

              const sessionToken = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '15m' });
              const refreshToken = jwt.sign(payload, process.env.JWT_SECRET + existingAccount.token?.version, { expiresIn: '30d' });

              const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 30); // expires in 30 days

              const updatedAccount = await prisma.token.upsert({
                where: {
                  accountId: existingAccount.id,
                },
                update: {
                  sessionToken,
                  refreshToken,
                  expiresAt,
                },
                create: {
                  sessionToken,
                  refreshToken,
                  expiresAt,
                  accountId: existingAccount.id,
                },
              });

              return updatedAccount
            }

            return null;
          }

          const saltRounds = parseInt(process.env.SALT_ROUNDS || '10', 10)
          const hashedPassword = await bcrypt.hash(password, saltRounds);

          const account = await prisma.account.create({
            data: {
              email,
              password: hashedPassword,
              type,
              authType: "Email"
            },
          });

          await prisma.user.create({
            data: {
              accountId: account.id
            }
          })

          return account;
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
    async signIn({ account, profile, credentials }) {
      console.log(account, profile, credentials)
      if (account && profile) {

      }

      return true
    },
    async jwt({ token, account }: { token: JWT, account: Account | null }) {

      return token
    },
    async session({ token, session }: any) {
      session.user.id = token.sub

      return session
    }
  }
};
