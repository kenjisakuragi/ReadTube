import nodemailer from 'nodemailer';
import { config } from './config';
import { getSubscribersForChannel } from './subscription_manager';
import { renderWelcomeEmail } from './email_renderer';

const transporter = config.SMTP_HOST ? nodemailer.createTransport({
    host: config.SMTP_HOST,
    port: config.SMTP_PORT,
    secure: config.SMTP_SECURE,
    auth: {
        user: config.SMTP_USER,
        pass: config.SMTP_PASS,
    },
}) : null;

// Kept for compatibility but not strictly needed for web app actions
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

export async function sendWelcomeEmail(
    toEmail: string,
    channelNames: string[],
    unsubscribeToken: string,
    baseUrl: string = config.BASE_URL
): Promise<void> {
    const subject = `【ReadTube】登録が完了しました`;
    const unsubscribeUrl = `${baseUrl || 'https://readtube.jp'}/unsubscribe/${unsubscribeToken}`;
    const htmlContent = renderWelcomeEmail(channelNames, unsubscribeUrl);

    if (!transporter) {
        console.log(`[Email Mock] Welcome email to ${toEmail}`);
        console.log(`  Channels: ${channelNames.join(', ')}`);
        return;
    }

    try {
        await transporter.sendMail({
            from: `"ReadTube Premium" <${config.EMAIL_FROM}>`,
            to: toEmail,
            subject: subject,
            html: htmlContent,
        });
        console.log(`  > Welcome email sent to ${toEmail}`);
    } catch (error) {
        console.error(`  > Failed to send welcome email to ${toEmail}:`, error);
    }
}
