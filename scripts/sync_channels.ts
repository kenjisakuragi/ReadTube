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
    const ytdlpPath = path.resolve(process.cwd(), 'bin', 'yt-dlp.exe');
    const ytdlpCmd = isWindows && fs.existsSync(ytdlpPath)
        ? ytdlpPath
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

                // Fetch full info for new or existing (to update counts)
                const output = execSync(`${ytdlpCmd} --print "%(channel_id)s|%(channel)s|%(thumbnails.-1.url)s|%(channel_follower_count)s|%(playlist_count)s" --playlist-items 1 "${trimmed}"`, { encoding: 'utf-8', stdio: ['ignore', 'pipe', 'ignore'] }).trim();
                const [id, name, thumbnail, subs, vcount] = output.split('|');

                const formatCount = (count: string) => {
                    const n = parseInt(count);
                    if (isNaN(n)) return count;
                    if (n >= 10000) return (n / 10000).toFixed(1) + '万';
                    return n.toLocaleString();
                };

                const channelData = {
                    id: id,
                    name: name,
                    persona: existing?.persona || `Expert Analyst in ${currentGenre}`,
                    genre: currentGenre,
                    thumbnail: thumbnail,
                    description: existing?.description || `YouTube's leading insights for ${currentGenre}.`,
                    subscribers: formatCount(subs),
                    videoCount: formatCount(vcount)
                };

                finalChannels.push(channelData);
                console.log(`    ✅ Processed: ${name} (Subs: ${channelData.subscribers}, Videos: ${channelData.videoCount})`);
            } catch (e: any) {
                console.error(`    ❌ Failed: ${e.message}`);
            }
        }
    }

    fs.writeFileSync(CHANNELS_JSON_PATH, JSON.stringify(finalChannels, null, 2));
    console.log(`\n🎉 Sync complete! Total channels: ${finalChannels.length}`);
}

sync().catch(console.error);
