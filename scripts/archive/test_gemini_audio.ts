
import { GoogleGenerativeAI } from "@google/generative-ai";
import { GoogleAIFileManager } from "@google/generative-ai/server";
import dotenv from "dotenv";
import path from "path";

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
const fileManager = new GoogleAIFileManager(process.env.GEMINI_API_KEY!);

async function transcribe() {
    const audioPath = path.resolve(process.cwd(), "test_audio.webm");

    console.log(`Uploading ${audioPath} to Gemini...`);
    try {
        const uploadResponse = await fileManager.uploadFile(audioPath, {
            mimeType: "audio/webm",
            displayName: "Rick Astley Audio",
        });

        console.log(`Uploaded file: ${uploadResponse.file.name}`);

        // Wait for processing if needed (small files are usually instant)

        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

        console.log("Generating transcript...");
        const result = await model.generateContent([
            {
                fileData: {
                    mimeType: uploadResponse.file.mimeType,
                    fileUri: uploadResponse.file.uri,
                },
            },
            { text: "Please transcribe this audio exactly. Just the text." },
        ]);

        console.log("TRANSCRIPT RESULT:");
        console.log("-----------------------------------------");
        console.log(result.response.text());
        console.log("-----------------------------------------");

    } catch (error: any) {
        console.error("Transcription failed:", error);
    }
}

transcribe();
