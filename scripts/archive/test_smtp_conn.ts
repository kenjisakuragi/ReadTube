import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config();

async function testConn() {
    console.log("Testing SMTP connection to:", process.env.SMTP_HOST);
    const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT || 587),
        secure: process.env.SMTP_SECURE === 'true',
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
        },
    });

    try {
        await transporter.verify();
        console.log("✅ Connection verified successfully!");
    } catch (err: any) {
        console.error("❌ Connection failed:", err.message);
    }
}

testConn();
