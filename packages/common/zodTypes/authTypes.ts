import { z } from "zod";
import { credentialsSchema } from "../zodSchema/authSchema";

export type CredentialsType = z.infer<typeof credentialsSchema>
