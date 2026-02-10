
import ytdl from '@distube/ytdl-core';
import fs from 'fs';
import path from 'path';

async function testDownload() {
    const videoId = 'M6_V6HqY-OE';
    const url = `https://www.youtube.com/watch?v=${videoId}`;
    const outputPath = path.resolve(process.cwd(), 'temp_audio.mp4');

    console.log(`Downloading audio for ${videoId}...`);
    try {
        // Download audio only. mp4/m4a is usually safe.
        const stream = ytdl(url, {
            filter: 'audioonly',
            quality: 'lowestaudio' // lowest for faster test
        });

        const writer = fs.createWriteStream(outputPath);
        stream.pipe(writer);

        writer.on('finish', () => {
            console.log(`Success! Saved to ${outputPath}`);
            const stats = fs.statSync(outputPath);
            console.log(`File size: ${stats.size} bytes`);
        });

        writer.on('error', (err) => {
            console.error('Writer error:', err);
        });

    } catch (error: any) {
        console.error('Download failed:', error.message);
    }
}

testDownload();
