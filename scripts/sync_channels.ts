import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

const CHANNELS_LIST_PATH = path.resolve(process.cwd(), 'config/channels_list.txt');
const CHANNELS_JSON_PATH = path.resolve(process.cwd(), 'config/channels.json');

async function sync() {
    console.log("🚀 Syncing channels from channels_list.txt...");

    if (!fs.existsSync(CHANNELS_LIST_PATH)) {
        console.error("Error: config/channels_list.txt not found.");
        return;
    }

    const existingChannels: any[] = fs.existsSync(CHANNELS_JSON_PATH)
        ? JSON.parse(fs.readFileSync(CHANNELS_JSON_PATH, 'utf-8'))
        : [];

    const channelsMap = new Map<string, any>();
    existingChannels.forEach(c => channelsMap.set(c.id, c));

    const content = fs.readFileSync(CHANNELS_LIST_PATH, 'utf-8');
    const lines = content.split('\n');

    let currentGenre = 'その他';
    const finalChannels: any[] = [];

    const isWindows = process.platform === 'win32';
    const ytdlpCmd = isWindows && fs.existsSync(path.resolve(process.cwd(), 'yt-dlp.exe'))
        ? path.resolve(process.cwd(), 'yt-dlp.exe')
        : 'yt-dlp';

    for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed) continue;

        if (trimmed.startsWith('#')) {
            currentGenre = trimmed.replace('#', '').trim();
            continue;
        }

        if (trimmed.startsWith('http')) {
            console.log(`  > Processing: ${trimmed}`);
            try {
                // Get ID first to check if exists
                const channelId = execSync(`${ytdlpCmd} --get-id --playlist-items 0 "${trimmed}"`, { encoding: 'utf-8', stdio: ['ignore', 'pipe', 'ignore'] }).trim();

                const existing = channelsMap.get(channelId);

                if (existing) {
                    console.log(`    ℹ️  Channel ${existing.name} already exists. Updating genre/meta...`);
                    existing.genre = currentGenre;
                    finalChannels.push(existing);
                } else {
                    // Fetch full info for new channel
                    const output = execSync(`${ytdlpCmd} --print "%(channel_id)s|%(channel)s|%(thumbnails.-1.url)s" --playlist-items 1 "${trimmed}"`, { encoding: 'utf-8', stdio: ['ignore', 'pipe', 'ignore'] }).trim();
                    const [id, name, thumbnail] = output.split('|');

                    finalChannels.push({
                        id: id,
                        name: name,
                        persona: `Expert Analyst in ${currentGenre}`,
                        genre: currentGenre,
                        thumbnail: thumbnail,
                        description: `YouTube's leading insights for ${currentGenre}.`
                    });
                    console.log(`    ✅ Added new: ${name}`);
                }
            } catch (e: any) {
                console.error(`    ❌ Failed: ${e.message}`);
            }
        }
    }

    fs.writeFileSync(CHANNELS_JSON_PATH, JSON.stringify(finalChannels, null, 2));
    console.log(`\n🎉 Sync complete! Total channels: ${finalChannels.length}`);
}

sync().catch(console.error);
