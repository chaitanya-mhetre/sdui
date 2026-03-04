import { z } from 'zod';

const envSchema = z.object({
  DATABASE_URL: z.string().min(1),
  CLERK_SECRET_KEY: z.string().min(1),
  NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: z.string().min(1),
  CLERK_WEBHOOK_SECRET: z.string().min(1).optional(),
  NEXT_PUBLIC_APP_URL: z.string().optional(),
});

// Skip strict validation during `next build` — the build phase doesn't need
// runtime secrets. Validation runs on actual server startup (`next start`).
const isBuildPhase = process.env.NEXT_PHASE === 'phase-production-build';

export const env = isBuildPhase
  ? (process.env as unknown as z.infer<typeof envSchema>)
  : envSchema.parse(process.env);
