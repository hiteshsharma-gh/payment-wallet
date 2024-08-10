import { z } from "zod";

export const credentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8, "password should be more than 8 characters").max(20, "password should be less than 20 characters"),
  type: z.enum(["User", "Merchant"])
})
