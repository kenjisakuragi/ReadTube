import Link from 'next/link';
import channelsData from '@/data/channels.json';

interface Channel {
    id: string;
    name: string;
    persona: string;
}

export default function ChannelsPage() {
    const channels = channelsData as Channel[];

    return (
        <div className="min-h-screen bg-[#f8f5f2] text-[#1a1a1a] font-serif">
            <header className="py-6 border-b border-gray-300 px-4 md:px-12 flex justify-between items-center">
                <Link href="/" className="text-2xl font-bold tracking-tight">ReadTube</Link>
            </header>

            <main className="px-4 md:px-12 py-12">
                <h1 className="text-4xl font-bold mb-12">Channel Catalog</h1>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {channels.map((channel) => (
                        <div key={channel.id} className="bg-white border border-gray-200 p-8 flex flex-col justify-between hover:shadow-lg transition">
                            <div>
                                <div className="text-xs font-sans font-bold text-gray-500 tracking-widest mb-2">CHANNEL</div>
                                <h2 className="text-2xl font-bold mb-4">{channel.name}</h2>
                                <div className="mb-6">
                                    <div className="text-xs font-sans font-bold text-gray-500 tracking-widest mb-1">CURATED BY</div>
                                    <div className="inline-block bg-gray-100 px-3 py-1 rounded-full text-sm font-sans text-gray-700">
                                        🤖 {channel.persona}
                                    </div>
                                </div>
                                <p className="font-sans text-gray-600 mb-8">
                                    Get full reports and expert analysis on every new video from {channel.name}.
                                </p>
                            </div>
                            <button className="w-full bg-[#1a1a1a] text-white py-3 text-sm font-sans font-bold tracking-wider hover:bg-gray-800 transition">
                                SUBSCRIBE (FREE)
                            </button>
                        </div>
                    ))}
                </div>
            </main>
        </div>
    );
}
