import nodemailer from 'nodemailer';
import { config } from '../config';

// For MVP, we might want to just log to console if no SMTP config is present.
const transporter = config.SMTP_HOST ? nodemailer.createTransport({
    host: config.SMTP_HOST,
    port: 587,
    secure: false, // true for 465, false for other ports
    auth: {
        user: config.SMTP_USER,
        pass: config.SMTP_PASS,
    },
}) : null;

export async function sendChannelUpdate(
    channelName: string,
    videoTitle: string,
    htmlContent: string
): Promise<void> {

    const subject = `【完全版】${videoTitle}の全貌と、そこから学ぶ戦略`;

    if (!transporter) {
        console.log("--- MOCK EMAIL SEND ---");
        console.log(`To: [Subscribers of ${channelName}]`);
        console.log(`Subject: ${subject}`);
        console.log("Content Preview:");
        console.log(htmlContent.substring(0, 500) + "...");
        console.log("--- END MOCK EMAIL ---");
        // In a real app, we would loop through subscribers here.
        return;
    }

    // TODO: Implement actual sending logic to list of subscribers
    // For now, send to a test address if configured, or just log.
    console.log(`[Email Service] Would send email for ${channelName}: ${subject}`);
}
