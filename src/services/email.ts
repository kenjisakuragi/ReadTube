
import { Resend } from 'resend';
import { config } from '../config';
import { getSubscribersForChannel } from './subscription_manager';
import { renderWelcomeEmail } from './email_renderer';

// Use SMTP_PASS as the API Key for Resend SDK
const resend = config.SMTP_PASS ? new Resend(config.SMTP_PASS) : null;

// Rate limit helper: Resend free tier allows 2 req/sec
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

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

    if (!resend) {
        console.log(`[Email Mock] ${subscribers.length} subscribers would receive: ${subject}`);
        return;
    }

    for (const subscriber of subscribers) {
        try {
            const unsubscribeUrl = `${baseUrl || 'https://readtube.jp'}/unsubscribe/${subscriber.token}`;
            const htmlWithUnsubscribe = htmlContent.replace(
                /href="[^"]*\/unsubscribe\/TOKEN_PLACEHOLDER"/,
                `href="${unsubscribeUrl}"`
            );

            const fromField = config.EMAIL_FROM.includes('<')
                ? config.EMAIL_FROM
                : `ReadTube Premium <${config.EMAIL_FROM}>`;

            const { data, error } = await resend.emails.send({
                from: fromField,
                to: [subscriber.email],
                subject: subject,
                html: htmlWithUnsubscribe,
            });

            if (error) {
                console.error(`  > Failed to send to ${subscriber.email}:`, error);
            } else {
                console.log(`  > Sent to ${subscriber.email} (ID: ${data?.id})`);
            }

            // Wait 600ms between sends to respect rate limits
            await delay(600);
        } catch (error) {
            console.error(`  > Unexpected error sending to ${subscriber.email}:`, error);
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

    if (!resend) {
        console.log(`[Email Mock] Welcome email to ${toEmail}`);
        return;
    }

    try {
        const fromField = config.EMAIL_FROM.includes('<')
            ? config.EMAIL_FROM
            : `ReadTube Premium <${config.EMAIL_FROM}>`;

        const { data, error } = await resend.emails.send({
            from: fromField,
            to: [toEmail],
            subject: subject,
            html: htmlContent,
        });

        if (error) {
            console.error(`  > Failed to send welcome email to ${toEmail}:`, error);
        } else {
            console.log(`  > Welcome email sent to ${toEmail} (ID: ${data?.id})`);
        }
    } catch (error) {
        console.error(`  > Unexpected error sending welcome email:`, error);
    }
}
