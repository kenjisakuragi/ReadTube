import nodemailer from 'nodemailer';
import { config } from '../config';
import { getSubscribersForChannel } from './subscription_manager';

const transporter = config.SMTP_HOST ? nodemailer.createTransport({
    host: config.SMTP_HOST,
    port: config.SMTP_PORT,
    secure: config.SMTP_SECURE,
    auth: {
        user: config.SMTP_USER,
        pass: config.SMTP_PASS,
    },
}) : null;

export async function sendChannelUpdate(
    channelId: string,
    channelName: string,
    videoTitle: string,
    htmlContent: string,
    baseUrl: string = config.BASE_URL
): Promise<void> {
    const subject = `【ReadTube】${videoTitle}`;
    const subscribers = await getSubscribersForChannel(channelId);

    if (subscribers.length === 0) {
        console.warn(`[Email] No subscribers found for ${channelName} (${channelId}). Skipping.`);
        return;
    }

    if (!transporter) {
        console.log(`[Email Mock] ${subscribers.length} subscribers would receive: ${subject}`);
        return;
    }

    for (const subscriber of subscribers) {
        try {
            // Add personalized unsubscribe link to the HTML content
            const unsubscribeUrl = `${baseUrl || 'https://readtube.jp'}/unsubscribe/${subscriber.token}`;

            // We look for the placeholder we set in email_renderer.ts
            // The placeholder is constructed as: `${base}/unsubscribe/TOKEN_PLACEHOLDER`
            // But since 'base' might vary, the robust way is to replace the entire href if possible,
            // or we simply look for the specific suffix we know we put there.

            // Simpler approach: In email_renderer, we set href to be something like "UNSUBSCRIBE_LINK_PLACEHOLDER" would be safer.
            // But based on my previous edit, it was `${base}/unsubscribe/TOKEN_PLACEHOLDER`.
            // So we will do a string replacement on that specific pattern.

            // Let's rely on a more unique token placeholder in the future, but for now:
            const htmlWithUnsubscribe = htmlContent.replace(
                /href="[^"]*\/unsubscribe\/TOKEN_PLACEHOLDER"/,
                `href="${unsubscribeUrl}"`
            );

            await transporter.sendMail({
                from: `"ReadTube Premium" <${config.EMAIL_FROM}>`,
                to: subscriber.email,
                subject: subject,
                html: htmlWithUnsubscribe,
            });
            console.log(`  > Sent to ${subscriber.email}`);
        } catch (error) {
            console.error(`  > Failed to send to ${subscriber.email}:`, error);
        }
    }
}
