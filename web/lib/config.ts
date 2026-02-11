import { z } from 'zod';

// Define schemas for validation
export const ChannelSchema = z.object({
    id: z.string(),
    name: z.string(),
    rssUrl: z.string().url(),
    persona: z.string(),
});

export type Channel = z.infer<typeof ChannelSchema>;

const ConfigSchema = z.object({
    SMTP_HOST: z.string().optional(),
    SMTP_PORT: z.coerce.number().default(587),
    SMTP_SECURE: z.coerce.boolean().default(false),
    SMTP_USER: z.string().optional(),
    SMTP_PASS: z.string().optional(),
    EMAIL_FROM: z.string().default('noreply@readtube.jp'),
    NEXT_PUBLIC_SUPABASE_URL: z.string().optional(),
    SUPABASE_SERVICE_KEY: z.string().optional(),
    BASE_URL: z.string().default('https://readtube.jp'),
});

// Next.js handles env loading, no need for dotenv here
export const config = ConfigSchema.parse(process.env);
