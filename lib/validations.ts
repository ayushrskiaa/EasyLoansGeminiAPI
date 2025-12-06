import { z } from "zod";

export const productFilterSchema = z.object({
  bank: z.string().optional(),
  minApr: z.coerce.number().min(0).max(100).optional(),
  maxApr: z.coerce.number().min(0).max(100).optional(),
  minIncome: z.coerce.number().min(0).optional(),
  minCreditScore: z.coerce.number().min(300).max(850).optional(),
  type: z.enum(["personal", "education", "vehicle", "home", "credit_line", "debt_consolidation"]).optional(),
});

export const aiAskSchema = z.object({
  productId: z.string().uuid(),
  message: z.string().min(1).max(1000),
  history: z.array(
    z.object({
      role: z.enum(["user", "assistant", "system"]),
      content: z.string(),
    })
  ).optional().default([]),
});

export type ProductFilterInput = z.infer<typeof productFilterSchema>;
export type AiAskInput = z.infer<typeof aiAskSchema>;

