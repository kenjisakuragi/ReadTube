
import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';
dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

async function checkModels() {
    try {
        console.log("Checking Gemini Flash...");
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        const res = await model.generateContent("Hi");
        console.log("Flash works:", res.response.text());
    } catch (e: any) {
        console.error("FULL ERROR:", e);
    }
}

checkModels();
