import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials"
import { z } from "zod";
import prisma from "@repo/db"
import bcrypt from "bcrypt"

export const credentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8, "password should be more than 8 characters").max(20, "password should be less than 20 characters"),
  type: z.enum(["User", "Merchant"])
})

export type Credentials = z.infer<typeof credentialsSchema>

const saltRounds = process.env.SALT_ROUNDS

export const authOption: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: "email", type: "text", placeholder: "johndoe@example.com" },
        password: { label: "password", type: "password", placeholder: "password" },
        type: { label: "type", type: "text", placeholder: "User or Merchant" }
      },
      async authorize(credentials: Credentials | undefined) {
        if (!credentials?.email || !credentials?.password || !credentials?.type) return null;

        const parsedData = credentialsSchema.safeParse(credentials);
        if (!parsedData.success) return null

        const { email, password, type } = parsedData.data;

        const existingAccount = await prisma.account.findUnique({
          where: { email },
        });

        if (existingAccount?.auth_type != "Credentials") return null

        if (existingAccount) {
          const validPassword = await bcrypt.compare(password, String(existingAccount.password));
          if (validPassword) return existingAccount;

          return null;
        }

        try {
          const hashedPassword = await bcrypt.hash(password, Number(saltRounds));

          const user = await prisma.user.create({
            data: { email, password: hashedPassword },
          });

          return user;
        } catch (error) {
          console.error('Error creating user:', error);

          return null
        }
      }
    })
  ]
}
