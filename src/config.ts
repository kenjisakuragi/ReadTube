import { z } from 'zod';
import dotenv from 'dotenv';

dotenv.config();

export const ConfigSchema = z.object({
    GEMINI_API_KEY: z.string(),
    SMTP_HOST: z.string().optional(),
    SMTP_USER: z.string().optional(),
    SMTP_PASS: z.string().optional(),
    EMAIL_FROM: z.string().default('noreply@readtube.com'),
});

export const config = ConfigSchema.parse(process.env);

export const ChannelSchema = z.object({
    id: z.string(),
    name: z.string(),
    persona: z.string(), // Expert persona for this channel
});

export type Channel = z.infer<typeof ChannelSchema>;
