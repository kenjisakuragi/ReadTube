import nodemailer from 'nodemailer';
import { config } from '../config';
import { getSubscribersForChannel } from './subscription_manager';

const transporter = config.SMTP_HOST ? nodemailer.createTransport({
    host: config.SMTP_HOST,
    port: 587,
    secure: false,
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
    baseUrl: string = 'https://readtube.example.com'
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
            // Add unsubscribe link to the HTML content
            const unsubscribeUrl = `${baseUrl}/unsubscribe/${subscriber.token}`;
            const htmlWithUnsubscribe = htmlContent.replace(
                '<a href="#">配信を停止する (Unsubscribe)</a>',
                `<a href="${unsubscribeUrl}">配信を停止する (Unsubscribe)</a>`
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
