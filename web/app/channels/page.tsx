'use client'

import { useState, useMemo } from 'react'
import channelsData from '@/data/channels.json'
import { registerUser } from '@/app/actions'

interface Channel {
    id: string
    name: string
    genre: string
    thumbnail?: string
    subscribers?: string
    descriptionJa?: string
}

export default function ChannelsPage() {
    const channels = channelsData as Channel[]
    const [subscribingChannel, setSubscribingChannel] = useState<string | null>(null)
    const [email, setEmail] = useState('')
    const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
    const [message, setMessage] = useState('')
    const [searchQuery, setSearchQuery] = useState('')
    const [selectedGenre, setSelectedGenre] = useState<string>('all')

    // Unique genres
    const allGenres = useMemo(() => {
        const set = new Set<string>()
        channels.forEach(ch => set.add(ch.genre))
        return Array.from(set)
    }, [channels])

    // Filtered channels
    const filteredChannels = useMemo(() => {
        return channels.filter(ch => {
            const matchesGenre = selectedGenre === 'all' || ch.genre === selectedGenre
            const query = searchQuery.toLowerCase()
            const matchesSearch = !query
                || ch.name.toLowerCase().includes(query)
                || (ch.descriptionJa || '').toLowerCase().includes(query)
                || ch.genre.toLowerCase().includes(query)
            return matchesGenre && matchesSearch
        })
    }, [channels, selectedGenre, searchQuery])

    // Group filtered channels by genre
    const genres = useMemo(() => {
        const map = new Map<string, Channel[]>()
        filteredChannels.forEach(ch => {
            const list = map.get(ch.genre) || []
            list.push(ch)
            map.set(ch.genre, list)
        })
        return Array.from(map.entries())
    }, [filteredChannels])

    const handleSubscribe = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!subscribingChannel || !email) return

        setStatus('loading')
        setMessage('')

        try {
            const result = await registerUser(email, [subscribingChannel])
            if (!result.success) {
                throw new Error(result.message || '登録処理に失敗しました。')
            }
            setStatus('success')
            setMessage('登録完了！確認メールをお送りしました。')
            setTimeout(() => {
                setSubscribingChannel(null)
                setEmail('')
                setStatus('idle')
                setMessage('')
            }, 3000)
        } catch (error: any) {
            setStatus('error')
            setMessage(error.message || '登録に失敗しました。')
        }
    }

    const channelName = subscribingChannel
        ? channels.find(ch => ch.id === subscribingChannel)?.name
        : ''

    return (
        <div className="min-h-screen bg-[#F9F9F9] text-[#0F0F0F]">
            {/* Header */}
            <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200">
                <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                    <a href="/" className="flex items-center gap-1">
                        <div className="bg-[#FF0000] p-1 rounded-lg shadow-sm">
                            <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z" />
                            </svg>
                        </div>
                        <span className="text-2xl font-black tracking-tighter text-[#0F0F0F]" style={{ fontFamily: '"YouTube Sans", "Roboto", sans-serif' }}>
                            ReadTube
                        </span>
                    </a>
                    <div className="hidden md:flex items-center gap-4">
                        <a href="/dashboard" className="text-sm font-bold text-slate-500 hover:text-[#FF0000] transition-colors">最新レポート</a>
                        <span className="text-slate-300">|</span>
                        <span className="text-sm font-medium text-[#FF0000]">チャンネル一覧</span>
                    </div>
                </div>
            </header>

            {/* Page Content */}
            <main className="pt-28 pb-20 px-4">
                <div className="container mx-auto max-w-7xl">
                    {/* Page Header */}
                    <div className="text-center mb-12">
                        <h1 className="text-3xl md:text-4xl font-black text-slate-900 mb-4">
                            対象チャンネル
                        </h1>
                        <p className="text-lg text-slate-500 max-w-2xl mx-auto">
                            世界トップクラスのYouTubeチャンネルをAIが毎日解析。<br />
                            気になるチャンネルを購読して、日本語レポートを受け取りましょう。
                        </p>
                    </div>

                    {/* Search & Genre Filter */}
                    <div className="mb-12 space-y-4">
                        {/* Search Box */}
                        <div className="max-w-xl mx-auto">
                            <div className="relative">
                                <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder="チャンネル名・キーワードで検索..."
                                    className="w-full pl-12 pr-4 py-3.5 bg-white border-2 border-slate-100 rounded-2xl outline-none text-base font-medium focus:border-[#FF0000]/30 focus:ring-4 focus:ring-[#FF0000]/5 transition-all placeholder:text-slate-400"
                                />
                                {searchQuery && (
                                    <button
                                        onClick={() => setSearchQuery('')}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                                    >
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Genre Tabs */}
                        <div className="flex justify-center">
                            <div className="flex gap-2 overflow-x-auto pb-1">
                                <button
                                    onClick={() => setSelectedGenre('all')}
                                    className={`px-5 py-2.5 rounded-full text-sm font-bold whitespace-nowrap transition-all ${selectedGenre === 'all'
                                        ? 'bg-[#FF0000] text-white shadow-lg shadow-[#FF0000]/20'
                                        : 'bg-white text-slate-600 border-2 border-slate-100 hover:border-[#FF0000]/30'
                                        }`}
                                >
                                    すべて
                                </button>
                                {allGenres.map(genre => (
                                    <button
                                        key={genre}
                                        onClick={() => setSelectedGenre(genre)}
                                        className={`px-5 py-2.5 rounded-full text-sm font-bold whitespace-nowrap transition-all ${selectedGenre === genre
                                            ? 'bg-[#FF0000] text-white shadow-lg shadow-[#FF0000]/20'
                                            : 'bg-white text-slate-600 border-2 border-slate-100 hover:border-[#FF0000]/30'
                                            }`}
                                    >
                                        {genre}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Result count */}
                        {(searchQuery || selectedGenre !== 'all') && (
                            <p className="text-center text-sm text-slate-400 font-medium">
                                {filteredChannels.length} チャンネル
                                {filteredChannels.length === 0 && ' — 条件に一致するチャンネルがありません'}
                            </p>
                        )}
                    </div>

                    {/* Channels by Genre */}
                    <div className="space-y-16">
                        {genres.map(([genre, genreChannels]) => (
                            <section key={genre} className="space-y-8">
                                <div className="flex items-center gap-4">
                                    <h2 className="text-2xl font-black text-slate-900 pl-4 border-l-8 border-[#FF0000]">{genre}</h2>
                                    <div className="flex-1 h-px bg-slate-200"></div>
                                    <span className="text-sm font-bold text-slate-400">{genreChannels.length} チャンネル</span>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {genreChannels.map(channel => (
                                        <div
                                            key={channel.id}
                                            className="group bg-white border-2 border-slate-100 rounded-2xl overflow-hidden hover:shadow-xl hover:border-slate-200 transition-all duration-300"
                                        >
                                            {/* Thumbnail */}
                                            <div className="aspect-[16/9] relative overflow-hidden bg-slate-100">
                                                {channel.thumbnail ? (
                                                    <img
                                                        src={channel.thumbnail}
                                                        alt={channel.name}
                                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                                                    />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-4xl bg-slate-50">📚</div>
                                                )}
                                                <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
                                                {/* Genre Badge */}
                                                <div className="absolute top-3 left-3">
                                                    <span className="bg-[#FF0000] text-white text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full shadow-lg">
                                                        {channel.genre}
                                                    </span>
                                                </div>
                                            </div>

                                            {/* Content */}
                                            <div className="p-5 space-y-3">
                                                <div className="flex items-center justify-between">
                                                    <h3 className="text-lg font-bold text-slate-900 group-hover:text-[#FF0000] transition-colors leading-tight">
                                                        {channel.name}
                                                    </h3>
                                                    {channel.subscribers && (
                                                        <span className="text-[10px] font-black text-[#FF0000] bg-[#FF0000]/5 px-2 py-0.5 rounded whitespace-nowrap">
                                                            {channel.subscribers}人
                                                        </span>
                                                    )}
                                                </div>

                                                <p className="text-slate-500 text-sm leading-relaxed line-clamp-2 min-h-[2.5rem]">
                                                    {channel.descriptionJa || channel.name}
                                                </p>

                                                {/* Subscribe Button */}
                                                <button
                                                    onClick={() => setSubscribingChannel(channel.id)}
                                                    className="w-full mt-2 bg-[#FF0000] text-white py-3 rounded-full text-sm font-bold hover:bg-[#CC0000] transition-all shadow-lg shadow-[#FF0000]/20 active:scale-95"
                                                >
                                                    ＋ 購読する
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </section>
                        ))}
                    </div>

                    {/* Empty state */}
                    {filteredChannels.length === 0 && (
                        <div className="text-center py-20">
                            <div className="text-5xl mb-4">🔍</div>
                            <h3 className="text-xl font-black text-slate-900 mb-2">チャンネルが見つかりません</h3>
                            <p className="text-slate-500 mb-6">別のキーワードやジャンルで検索してみてください。</p>
                            <button
                                onClick={() => { setSearchQuery(''); setSelectedGenre('all') }}
                                className="text-[#FF0000] font-bold hover:underline"
                            >
                                フィルターをリセット
                            </button>
                        </div>
                    )}
                </div>
            </main>

            {/* Footer */}
            <footer className="bg-white py-20 text-center border-t border-slate-200">
                <div className="container mx-auto px-4">
                    <div className="flex items-center justify-center gap-1 mb-8">
                        <div className="bg-[#FF0000] p-1 rounded-lg">
                            <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z" />
                            </svg>
                        </div>
                        <span className="text-2xl font-black tracking-tighter text-slate-900" style={{ fontFamily: '"YouTube Sans", sans-serif' }}>
                            ReadTube
                        </span>
                    </div>
                    <div className="flex flex-col md:flex-row justify-center items-center gap-4 md:gap-8 text-sm font-bold text-slate-400">
                        <a href="/" className="hover:text-[#FF0000] transition-colors">トップ</a>
                        <span className="hidden md:inline">•</span>
                        <a href="/privacy" className="hover:text-[#FF0000] transition-colors">プライバシーポリシー</a>
                        <span className="hidden md:inline">•</span>
                        <a href="/#pricing" className="hover:text-[#FF0000] transition-colors">料金プラン</a>
                    </div>
                    <p className="mt-12 text-[10px] text-slate-300 uppercase tracking-[0.4em] font-black">&copy; 2026 READTUBE CORE INTELLIGENCE.</p>
                </div>
            </footer>

            {/* Subscribe Modal */}
            {subscribingChannel && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
                    {/* Backdrop */}
                    <div
                        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                        onClick={() => {
                            if (status !== 'loading') {
                                setSubscribingChannel(null)
                                setEmail('')
                                setStatus('idle')
                                setMessage('')
                            }
                        }}
                    />

                    {/* Modal */}
                    <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-md p-8">
                        {status === 'success' ? (
                            <div className="text-center py-8">
                                <div className="text-5xl mb-4">🎉</div>
                                <h3 className="text-xl font-black text-slate-900 mb-2">登録完了！</h3>
                                <p className="text-slate-500">確認メールをお送りしました。</p>
                            </div>
                        ) : (
                            <>
                                <button
                                    onClick={() => {
                                        setSubscribingChannel(null)
                                        setEmail('')
                                        setStatus('idle')
                                        setMessage('')
                                    }}
                                    className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition-colors"
                                >
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>

                                <div className="text-center mb-6">
                                    <div className="inline-flex items-center gap-2 bg-[#FF0000]/10 text-[#FF0000] px-4 py-1.5 rounded-full text-sm font-bold mb-4">
                                        ✉️ 無料購読
                                    </div>
                                    <h3 className="text-xl font-black text-slate-900">
                                        {channelName} を購読
                                    </h3>
                                    <p className="text-sm text-slate-500 mt-2">
                                        最新動画のAIレポートをメールでお届けします
                                    </p>
                                </div>

                                <form onSubmit={handleSubscribe} className="space-y-4">
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                        placeholder="メールアドレスを入力"
                                        className="w-full px-5 py-4 bg-[#F2F2F2] rounded-2xl outline-none text-base font-medium focus:ring-2 focus:ring-[#FF0000]/20 focus:bg-white transition-all border border-transparent focus:border-[#FF0000]/30"
                                    />
                                    <button
                                        type="submit"
                                        disabled={status === 'loading'}
                                        className="w-full bg-[#FF0000] text-white py-4 rounded-full font-bold text-lg hover:bg-[#CC0000] transition-all shadow-lg shadow-[#FF0000]/20 active:scale-95 disabled:bg-slate-300 disabled:shadow-none"
                                    >
                                        {status === 'loading' ? (
                                            <span className="flex items-center justify-center gap-2">
                                                <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                                </svg>
                                                登録中...
                                            </span>
                                        ) : '無料で購読開始'}
                                    </button>
                                </form>

                                {message && (
                                    <p className={`mt-4 text-center text-sm font-bold ${status === 'error' ? 'text-[#FF0000]' : 'text-slate-500'}`}>
                                        {message}
                                    </p>
                                )}

                                <p className="text-center text-xs text-slate-400 mt-4">
                                    いつでも配信停止可能 · <a href="/privacy" className="underline hover:text-[#FF0000]">プライバシーポリシー</a>
                                </p>
                            </>
                        )}
                    </div>
                </div>
            )}
        </div>
    )
}
