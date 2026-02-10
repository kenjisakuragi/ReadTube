
import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';
dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

async function test() {
    try {
        console.log("Testing Gemini API with Key:", process.env.GEMINI_API_KEY ? "FOUND" : "MISSING");
        const result = await model.generateContent("Hello, world!");
        console.log("Response:", result.response.text());
    } catch (e: any) {
        console.error("Gemini API Error details:");
        console.error(JSON.stringify(e, null, 2));
        console.error(e.message);
    }
}

test().catch(console.error);
