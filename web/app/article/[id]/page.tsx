'use client'

import { useEffect, useState } from 'react'
import { useParams, useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { marked } from 'marked'

interface VideoArticle {
    id: number
    video_id: string
    channel_id: string
    title: string
    content: string
    summary: string
    transcript: string | null
    status: string
    published_at: string
    created_at: string
    title_ja?: string
}

export default function ArticlePage() {
    const params = useParams()
    const searchParams = useSearchParams()
    const videoId = params.id as string
    const token = searchParams.get('token')

    const [article, setArticle] = useState<VideoArticle | null>(null)
    const [loading, setLoading] = useState(true)
    const [hasAccess, setHasAccess] = useState(false)
    const [freeArticlesUsed, setFreeArticlesUsed] = useState(0)
    const [upgradeEmail, setUpgradeEmail] = useState('')
    const [upgradeStatus, setUpgradeStatus] = useState<'idle' | 'loading' | 'error'>('idle')
    const [upgradeError, setUpgradeError] = useState('')
    const [upgradePlan, setUpgradePlan] = useState<'single' | 'allaccess'>('single')

    const handleUpgrade = async (e: React.FormEvent) => {
        e.preventDefault()
        setUpgradeStatus('loading')
        setUpgradeError('')
        try {
            const body: Record<string, string> = { email: upgradeEmail, plan: upgradePlan }
            if (upgradePlan === 'single' && article?.channel_id) {
                body.channelId = article.channel_id
            }
            const res = await fetch('/api/stripe/checkout', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body),
            })
            const data = await res.json()
            if (data.url) {
                window.location.href = data.url
            } else {
                throw new Error(data.error || 'エラーが発生しました')
            }
        } catch (err: any) {
            setUpgradeStatus('error')
            setUpgradeError(err.message)
        }
    }

    useEffect(() => {
        async function loadArticle() {
            // Fetch the article
            const { data, error } = await supabase
                .from('videos')
                .select('*')
                .eq('video_id', videoId)
                .single()

            if (error || !data) {
                setLoading(false)
                return
            }

            setArticle(data)

            // Extract Japanese title from content
            const jaMatch = data.content?.match(/^#\s+(.+)$/m)
            if (jaMatch) {
                data.title_ja = jaMatch[1]
            }

            // Check access
            if (token) {
                // Token-based access (from email link)
                const { data: user } = await supabase
                    .from('users')
                    .select('id, subscription_tier, subscribed_channel_id')
                    .eq('unsubscribe_token', token)
                    .single()

                if (user) {
                    if (user.subscription_tier === 'allaccess') {
                        setHasAccess(true)
                    } else if (user.subscription_tier === 'single' && user.subscribed_channel_id === data.channel_id) {
                        setHasAccess(true)
                    } else {
                        // Free user or single plan for different channel: check monthly article count
                        const count = getMonthlyReadCount(user.id)
                        setFreeArticlesUsed(count)
                        if (count < 3) {
                            setHasAccess(true)
                            incrementReadCount(user.id)
                        }
                    }
                }
            } else {
                // No token: check localStorage for anonymous free reads
                const readCount = getAnonymousReadCount()
                setFreeArticlesUsed(readCount)
                if (readCount < 3) {
                    setHasAccess(true)
                    incrementAnonymousReadCount()
                }
            }

            setLoading(false)
        }

        loadArticle()
    }, [videoId, token])

    // Anonymous read tracking via localStorage
    function getAnonymousReadCount(): number {
        if (typeof window === 'undefined') return 0
        const key = `readtube_reads_${new Date().getFullYear()}_${new Date().getMonth()}`
        const stored = localStorage.getItem(key)
        return stored ? JSON.parse(stored).length : 0
    }

    function incrementAnonymousReadCount() {
        if (typeof window === 'undefined') return
        const key = `readtube_reads_${new Date().getFullYear()}_${new Date().getMonth()}`
        const stored = localStorage.getItem(key)
        const reads: string[] = stored ? JSON.parse(stored) : []
        if (!reads.includes(videoId)) {
            reads.push(videoId)
            localStorage.setItem(key, JSON.stringify(reads))
        }
    }

    // Placeholder functions for server-side read tracking
    function getMonthlyReadCount(userId: number): number {
        // TODO: Implement server-side tracking
        return 0
    }

    function incrementReadCount(userId: number) {
        // TODO: Implement server-side tracking
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-8 h-8 border-4 border-[#FF0000] border-t-transparent rounded-full animate-spin" />
                    <p className="text-slate-500 font-medium">読み込み中...</p>
                </div>
            </div>
        )
    }

    if (!article) {
        return (
            <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center">
                <div className="text-center">
                    <h1 className="text-2xl font-black text-slate-900 mb-2">記事が見つかりません</h1>
                    <p className="text-slate-500">この動画のレポートはまだ作成されていません。</p>
                    <a href="/" className="inline-block mt-6 text-[#FF0000] font-bold hover:underline">← トップに戻る</a>
                </div>
            </div>
        )
    }

    const videoUrl = `https://www.youtube.com/watch?v=${article.video_id}`
    const publishedDate = article.published_at
        ? new Date(article.published_at).toLocaleDateString('ja-JP', { year: 'numeric', month: 'long', day: 'numeric' })
        : ''

    return (
        <div className="min-h-screen bg-[#FAFAFA]">
            {/* Header */}
            <header className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-200">
                <div className="container mx-auto px-4 h-14 flex items-center justify-between">
                    <a href="/" className="flex items-center gap-1">
                        <div className="bg-[#FF0000] p-1 rounded-lg">
                            <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z" />
                            </svg>
                        </div>
                        <span className="text-xl font-black tracking-tighter text-[#0F0F0F]">ReadTube</span>
                    </a>

                    {!hasAccess && (
                        <a
                            href="/#pricing"
                            className="bg-[#FF0000] text-white px-5 py-2 rounded-full text-sm font-bold hover:bg-[#CC0000] transition-all shadow-sm"
                        >
                            プランを見る
                        </a>
                    )}
                </div>
            </header>

            {/* Article */}
            <article className="pt-24 pb-20 px-4">
                <div className="max-w-3xl mx-auto">
                    {/* Hero Thumbnail */}
                    <div className="w-full aspect-video rounded-2xl overflow-hidden mb-8 bg-slate-100 shadow-lg">
                        <img
                            src={`https://img.youtube.com/vi/${article.video_id}/maxresdefault.jpg`}
                            alt={article.title_ja || article.title}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                                (e.target as HTMLImageElement).src = `https://img.youtube.com/vi/${article.video_id}/hqdefault.jpg`
                            }}
                        />
                    </div>

                    {/* Meta */}
                    <div className="flex items-center gap-3 mb-6 text-sm text-slate-500">
                        {publishedDate && <time>{publishedDate}</time>}
                        <span>•</span>
                        <span>AI レポート</span>
                    </div>

                    {/* Content */}
                    {hasAccess ? (
                        <>
                            <div
                                className="article-body"
                                dangerouslySetInnerHTML={{ __html: marked(article.content || '') as string }}
                            />

                            {/* Source Video Link */}
                            <div className="mt-16 p-6 bg-white rounded-2xl border border-slate-200 flex items-center gap-4">
                                <div className="bg-[#FF0000] p-3 rounded-xl">
                                    <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M10 15l5.19-3L10 9v6m11.56-7.83c.13.47.22 1.1.28 1.9.07.8.1 1.49.1 2.09L22 12c0 2.19-.16 3.8-.44 4.83-.25.9-.83 1.48-1.73 1.73-.47.13-1.33.22-2.65.28-1.3.07-2.49.1-3.59.1L12 19c-4.19 0-6.8-.16-7.83-.44-.9-.25-1.48-.83-1.73-1.73-.13-.47-.22-1.1-.28-1.9-.07-.8-.1-1.49-.1-2.09L2 12c0-2.19.16-3.8.44-4.83.25-.9.83-1.48 1.73-1.73.47-.13 1.33-.22 2.65-.28 1.3-.07 2.49-.1 3.59-.1L12 5c4.19 0 6.8.16 7.83.44.9.25 1.48.83 1.73 1.73z" />
                                    </svg>
                                </div>
                                <div className="flex-1">
                                    <p className="text-sm text-slate-500 font-medium">元の動画を見る</p>
                                    <p className="font-bold text-slate-900">{article.title_ja || article.title}</p>
                                </div>
                                <a
                                    href={videoUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="bg-slate-100 text-slate-700 px-5 py-2.5 rounded-full text-sm font-bold hover:bg-slate-200 transition-all"
                                >
                                    YouTubeで見る →
                                </a>
                            </div>
                        </>
                    ) : (
                        <>
                            {/* Partial content + Paywall */}
                            <div
                                className="article-body"
                                dangerouslySetInnerHTML={{
                                    __html: marked(getPreviewContent(article.content || '')) as string
                                }}
                            />

                            {/* Blur overlay */}
                            <div className="relative -mt-32">
                                <div className="h-32 bg-gradient-to-t from-[#FAFAFA] to-transparent" />
                            </div>

                            {/* Paywall CTA */}
                            <div className="relative bg-white rounded-3xl border-2 border-slate-200 p-10 text-center shadow-xl -mt-4">
                                <div className="inline-flex items-center gap-2 bg-[#FF0000]/10 text-[#FF0000] px-4 py-1.5 rounded-full text-sm font-bold mb-6">
                                    🔒 この記事の続きを読むには
                                </div>
                                <h2 className="text-2xl font-black text-slate-900 mb-3">
                                    月3本まで無料で読めます
                                </h2>
                                <p className="text-slate-500 mb-2">
                                    今月の無料枠: <span className="font-black text-[#FF0000]">{freeArticlesUsed}/3本</span> 使用済み
                                </p>
                                <p className="text-slate-400 text-sm mb-6">
                                    このチャンネルの記事を無制限に読むには
                                </p>

                                {/* Plan Selection Tabs */}
                                <div className="flex gap-2 justify-center mb-6">
                                    <button
                                        onClick={() => setUpgradePlan('single')}
                                        className={`px-5 py-2 rounded-full text-sm font-bold transition-all ${upgradePlan === 'single' ? 'bg-[#FF0000] text-white shadow-lg shadow-[#FF0000]/20' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                                    >
                                        Single — ¥500/月
                                    </button>
                                    <button
                                        onClick={() => setUpgradePlan('allaccess')}
                                        className={`px-5 py-2 rounded-full text-sm font-bold transition-all ${upgradePlan === 'allaccess' ? 'bg-slate-900 text-white shadow-lg' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                                    >
                                        All Access — ¥2,980/月
                                    </button>
                                </div>
                                <p className="text-xs text-slate-400 mb-6">
                                    {upgradePlan === 'single'
                                        ? 'このチャンネルの全記事が無制限 + ダイジェストメール'
                                        : '全チャンネルの記事が無制限 + ダイジェストメール + アーカイブ'}
                                </p>

                                <form onSubmit={handleUpgrade} className="max-w-sm mx-auto space-y-3 mb-6">
                                    <input
                                        type="email"
                                        value={upgradeEmail}
                                        onChange={(e) => setUpgradeEmail(e.target.value)}
                                        required
                                        placeholder="メールアドレスを入力"
                                        className="w-full px-5 py-4 bg-[#F2F2F2] rounded-2xl outline-none text-base font-medium focus:ring-2 focus:ring-[#FF0000]/20 focus:bg-white transition-all border border-transparent focus:border-[#FF0000]/30"
                                    />
                                    <button
                                        type="submit"
                                        disabled={upgradeStatus === 'loading'}
                                        className={`w-full text-white px-8 py-4 rounded-full font-bold text-lg transition-all shadow-lg disabled:bg-slate-300 disabled:shadow-none ${upgradePlan === 'single' ? 'bg-[#FF0000] hover:bg-[#CC0000] shadow-[#FF0000]/20' : 'bg-slate-900 hover:bg-slate-700'}`}
                                    >
                                        {upgradeStatus === 'loading' ? 'Stripeに接続中...' : upgradePlan === 'single' ? `Singleプランに登録 — ¥500/月` : `All Accessに登録 — ¥2,980/月`}
                                    </button>
                                </form>

                                {upgradeError && (
                                    <p className="text-sm font-bold text-[#FF0000] mb-4">{upgradeError}</p>
                                )}

                                <a
                                    href="/"
                                    className="inline-block bg-slate-100 text-slate-700 px-8 py-3 rounded-full font-bold hover:bg-slate-200 transition-all"
                                >
                                    無料で登録する
                                </a>
                                <p className="text-xs text-slate-400 mt-4">いつでもキャンセル可能 · Stripeによる安全な決済</p>
                            </div>
                        </>
                    )}
                </div>
            </article>

            {/* Footer */}
            <footer className="bg-white py-12 text-center border-t border-slate-200">
                <div className="container mx-auto px-4">
                    <a href="/" className="inline-flex items-center gap-1 mb-4">
                        <div className="bg-[#FF0000] p-1 rounded-lg">
                            <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z" />
                            </svg>
                        </div>
                        <span className="text-lg font-black tracking-tighter text-slate-900">ReadTube</span>
                    </a>
                    <div className="flex justify-center gap-6 text-sm text-slate-400 font-medium">
                        <a href="/" className="hover:text-[#FF0000] transition-colors">トップ</a>
                        <span>•</span>
                        <a href="https://forms.gle/Vus1fFKvrSD78bn87" target="_blank" rel="noopener noreferrer" className="hover:text-[#FF0000] transition-colors">チャンネルリクエスト</a>
                        <span>•</span>
                        <a href="/privacy" className="hover:text-[#FF0000] transition-colors">プライバシーポリシー</a>
                        <span>•</span>
                        <span>© 2026 ReadTube</span>
                    </div>
                </div>
            </footer>
        </div>
    )
}

/**
 * Extract the first ~30% of the article for preview (up to and including the first ## section)
 */
function getPreviewContent(markdown: string): string {
    const lines = markdown.split('\n')
    const result: string[] = []
    let foundFirstH2 = false
    let foundSecondH2 = false

    for (const line of lines) {
        if (line.startsWith('## ') && foundFirstH2) {
            foundSecondH2 = true
            break
        }
        if (line.startsWith('## ')) {
            foundFirstH2 = true
        }
        result.push(line)
    }

    return result.join('\n')
}
