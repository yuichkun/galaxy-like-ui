import { z } from "zod";

export const UserSchema = z.object({
  id: z.string(),
  name: z.string(),
  skills: z.record(z.string(), z.number().min(0)),
  scores: z.object({
    e_score: z.number().min(0).max(5),
    i_score: z.number().min(0).max(5),
    b_score: z.number().min(0).max(5),
  }),
  companies: z.array(z.string()),
  avatar: z.string().url(),
});

export type ValidatedUser = z.infer<typeof UserSchema>;

export function validateUsers(data: unknown[]): ValidatedUser[] {
  const arraySchema = z.array(UserSchema);
  return arraySchema.parse(data);
}
