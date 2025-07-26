import { z } from 'zod';

export const SourceSchema = z.object({
  name: z.string(),
  year: z.number(),
  value: z.number().optional(),
  uncertainty: z.number().optional(),
  url: z.string().url().optional()
});

export const ConstantSchema = z.object({
  id: z.string().regex(/^[a-z_]+$/),
  symbol: z.string(),
  name: z.string(),
  description: z.string(),
  unit: z.string(),
  formula: z.string(),
  dependencies: z.array(z.string()).default([]),
  category: z.enum(['fundamental', 'derived', 'composite']),
  sources: z.array(SourceSchema),
  accuracyTarget: z.number().positive(),
  metadata: z.object({
    pdgId: z.string().optional(),
    codataId: z.string().optional()
  }).optional()
});

export type Constant = z.infer<typeof ConstantSchema>;
export type Source = z.infer<typeof SourceSchema>; 