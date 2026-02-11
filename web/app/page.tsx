'use client'

import { useState, useMemo } from 'react'
import { supabase } from '@/lib/supabase'
import channelsData from '../../config/channels.json'
import { registerUser } from './actions'

interface Channel {
  id: string
  name: string
  description: string
  genre: string
  thumbnail?: string
  subscribers?: string
  videoCount?: string
}

export default function Home() {
  const [email, setEmail] = useState('')
  const [selectedChannels, setSelectedChannels] = useState<string[]>([])
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [message, setMessage] = useState('')

  const channels = channelsData as Channel[]

  // Group by genre
  const genres = useMemo(() => {
    const map = new Map<string, Channel[]>()
    channels.forEach(ch => {
      const list = map.get(ch.genre) || []
      list.push(ch)
      map.set(ch.genre, list)
    })
    return Array.from(map.entries())
  }, [channels])

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault()
    if (selectedChannels.length === 0) {
      setMessage('購読するチャンネルを1つ以上選択してください。')
      setStatus('error')
      return
    }

    setStatus('loading')
    setMessage('')

    try {
      // Call Server Action
      const result = await registerUser(email, selectedChannels)

      if (!result.success) {
        throw new Error(result.message || '登録処理に失敗しました。')
      }

      setStatus('success')
      setMessage('登録完了！登録確認メールをお送りしました。')
      setEmail('')
      setSelectedChannels([])
    } catch (error: any) {
      setStatus('error')
      setMessage(error.message || '登録に失敗しました。')
    }
  }

  const toggleChannel = (channelId: string) => {
    setSelectedChannels(prev =>
      prev.includes(channelId)
        ? prev.filter(id => id !== channelId)
        : [...prev, channelId]
    )
  }

  return (
    <div className="min-h-screen bg-[#F9F9F9] text-[#0F0F0F] selection:bg-[#FF0000]/10">
      {/* Header / Brand */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-1 cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            <div className="bg-[#FF0000] p-1 rounded-lg shadow-sm">
              <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z" />
              </svg>
            </div>
            <span className="text-2xl font-black tracking-tighter text-[#0F0F0F]" style={{ fontFamily: '"YouTube Sans", "Roboto", sans-serif' }}>
              ReadTube
            </span>
          </div>

          <div className="hidden md:flex items-center gap-4">
            <span className="text-sm font-medium text-slate-500">YouTubeの知性を、記事として読む</span>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-40 pb-20 px-4 bg-white">
        <div className="container mx-auto text-center max-w-3xl">
          <div className="inline-flex items-center gap-2 bg-[#FF0000]/5 text-[#FF0000] px-4 py-1.5 rounded-full text-sm font-bold mb-8">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#FF0000] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#FF0000]"></span>
            </span>
            Premium Intelligence Service
          </div>
          <h1 className="text-4xl md:text-6xl font-black mb-6 tracking-tight leading-[1.1] text-slate-900">
            トップクリエイターの知見を<br />
            <span className="text-[#FF0000]">1分で読める記事</span>に。
          </h1>
          <p className="text-lg md:text-xl text-slate-600 leading-relaxed mb-12 max-w-2xl mx-auto">
            動画を見る時間がない。でも知見は欲しい。<br />
            最新動画をAIが解析し、鋭い日本語レポートを毎晩お届けします。
          </p>

          <form onSubmit={handleSubscribe} className="max-w-xl mx-auto">
            <div className="flex flex-col md:flex-row gap-3 p-2 bg-[#F2F2F2] rounded-[2rem] focus-within:bg-white focus-within:ring-2 focus-within:ring-[#FF0000]/20 transition-all border border-transparent focus-within:border-[#FF0000]/30">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="メールアドレスを入力"
                className="flex-1 bg-transparent rounded-full px-6 py-4 outline-none text-lg font-medium"
              />
              <button
                type="submit"
                disabled={status === 'loading' || selectedChannels.length === 0}
                className="bg-[#FF0000] text-white px-10 py-4 rounded-full font-bold hover:bg-[#CC0000] transition-all disabled:bg-slate-300 disabled:text-slate-500 active:scale-95 text-lg shadow-lg shadow-[#FF0000]/20"
              >
                無料購読を開始
              </button>
            </div>
            {selectedChannels.length === 0 && (
              <p className="mt-4 text-sm font-bold text-[#FF0000]">
                ステップ 1: 下のリストから気になるチャンネルを選択してください
              </p>
            )}
          </form>
        </div>
      </section>

      {/* Channels Grid */}
      <main className="container mx-auto px-4 py-20 max-w-7xl">
        <div className="space-y-20">
          {genres.map(([genre, genreChannels]) => (
            <section key={genre} className="space-y-8">
              <div className="flex items-center gap-4">
                <h2 className="text-2xl font-black text-slate-900 pl-4 border-l-8 border-[#FF0000]">{genre}</h2>
                <div className="flex-1 h-px bg-slate-200"></div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {genreChannels.map(channel => (
                  <div
                    key={channel.id}
                    onClick={() => toggleChannel(channel.id)}
                    className={`group relative bg-white border-2 rounded-2xl overflow-hidden cursor-pointer transition-all duration-300 hover:shadow-xl ${selectedChannels.includes(channel.id)
                      ? 'border-[#FF0000] ring-4 ring-[#FF0000]/5'
                      : 'border-slate-100'
                      }`}
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
                        <div className="w-full h-full flex items-center justify-center text-4xl">📚</div>
                      )}

                      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>

                      {selectedChannels.includes(channel.id) && (
                        <div className="absolute top-4 right-4 bg-[#FF0000] text-white w-10 h-10 rounded-full flex items-center justify-center shadow-lg border-4 border-white">
                          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path>
                          </svg>
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="p-5 space-y-3">
                      <h3 className="font-bold text-slate-900 group-hover:text-[#FF0000] transition-colors leading-tight">
                        {channel.name}
                      </h3>

                      <div className="flex flex-wrap gap-2 text-[10px] font-black uppercase tracking-widest text-[#FF0000]">
                        {channel.subscribers && (
                          <span className="bg-[#FF0000]/5 px-2 py-0.5 rounded">購読者 {channel.subscribers}</span>
                        )}
                        {channel.videoCount && channel.videoCount !== 'NA' && (
                          <span className="bg-slate-100 text-slate-500 px-2 py-0.5 rounded">{channel.videoCount} VIDEO</span>
                        )}
                      </div>

                      <p className="text-slate-500 text-sm line-clamp-2 leading-relaxed h-10">
                        {channel.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          ))}
        </div>

        {/* Status Message */}
        {message && (
          <div className={`fixed bottom-8 right-8 z-50 px-8 py-5 rounded-2xl shadow-2xl font-black border-2 backdrop-blur-md ${status === 'success' ? 'bg-white border-[#FF0000] text-[#FF0000]' : 'bg-[#FF0000] border-[#FF0000] text-white'
            }`}>
            <div className="flex items-center gap-3 text-lg">
              {status === 'success' ? '🚀' : '⚠️'}
              {message}
            </div>
          </div>
        )}
      </main>

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
            <a href="/privacy" className="hover:text-[#FF0000] transition-colors">プライバシーポリシー</a>
            <span className="hidden md:inline">•</span>
            <span>いつでも配信停止可能</span>
            <span className="hidden md:inline">•</span>
            <span>AIによる自動要約レポート</span>
          </div>
          <p className="mt-12 text-[10px] text-slate-300 uppercase tracking-[0.4em] font-black">&copy; 2026 READTUBE CORE INTELLIGENCE.</p>
        </div>
      </footer>
    </div>
  )
}
