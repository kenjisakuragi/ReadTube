'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function Home() {
  const [email, setEmail] = useState('')
  const [selectedChannels, setSelectedChannels] = useState<string[]>([])
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [message, setMessage] = useState('')

  const channels = [
    { id: 'UCxxxx', name: 'Y Combinator', description: 'スタートアップ・起業家向けコンテンツ' },
    { id: 'UCyyyy', name: 'Lex Fridman', description: 'AI・哲学・テクノロジー対談' },
  ]

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault()
    setStatus('loading')
    setMessage('')

    try {
      // 1. ユーザー作成または取得
      const unsubscribeToken = crypto.randomUUID()
      const { data: userData, error: userError } = await supabase
        .from('users')
        .upsert({ email, unsubscribe_token: unsubscribeToken }, { onConflict: 'email' })
        .select()
        .single()

      if (userError) throw userError

      // 2. チャンネル購読登録
      const subscriptions = selectedChannels.map(channelId => ({
        user_id: userData.id,
        channel_id: channelId
      }))

      const { error: subError } = await supabase
        .from('subscriptions')
        .upsert(subscriptions, { onConflict: 'user_id,channel_id' })

      if (subError) throw subError

      setStatus('success')
      setMessage('登録完了！選択したチャンネルの最新レポートをメールでお届けします。')
      setEmail('')
      setSelectedChannels([])
    } catch (error: any) {
      setStatus('error')
      setMessage(error.message || '登録に失敗しました。もう一度お試しください。')
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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto text-center mb-16">
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
            ReadTube
          </h1>
          <p className="text-xl md:text-2xl text-slate-300 mb-4">
            YouTubeの動画を、プロのライターが書いた記事として読む
          </p>
          <p className="text-lg text-slate-400">
            AIが動画を解析し、鋭い切り口の日本語レポートをメールでお届けします
          </p>
        </div>

        {/* Subscription Form */}
        <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-2xl p-8">
          <h2 className="text-2xl font-bold text-slate-900 mb-6">
            無料で購読を開始
          </h2>

          <form onSubmit={handleSubscribe} className="space-y-6">
            {/* Email Input */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-2">
                メールアドレス
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent text-slate-900"
                placeholder="your@email.com"
              />
            </div>

            {/* Channel Selection */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-3">
                購読するチャンネルを選択
              </label>
              <div className="space-y-3">
                {channels.map(channel => (
                  <div
                    key={channel.id}
                    onClick={() => toggleChannel(channel.id)}
                    className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${selectedChannels.includes(channel.id)
                        ? 'border-slate-900 bg-slate-50'
                        : 'border-slate-200 hover:border-slate-400'
                      }`}
                  >
                    <div className="flex items-start">
                      <input
                        type="checkbox"
                        checked={selectedChannels.includes(channel.id)}
                        onChange={() => { }}
                        className="mt-1 mr-3"
                      />
                      <div>
                        <h3 className="font-semibold text-slate-900">{channel.name}</h3>
                        <p className="text-sm text-slate-600">{channel.description}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={status === 'loading' || selectedChannels.length === 0}
              className="w-full bg-slate-900 text-white py-3 px-6 rounded-lg font-semibold hover:bg-slate-800 disabled:bg-slate-400 disabled:cursor-not-allowed transition-colors"
            >
              {status === 'loading' ? '登録中...' : '無料で購読する'}
            </button>

            {/* Status Message */}
            {message && (
              <div className={`p-4 rounded-lg ${status === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
                }`}>
                {message}
              </div>
            )}
          </form>

          {/* Footer Links */}
          <div className="mt-6 text-center text-sm text-slate-600">
            <a href="/privacy" className="hover:underline">プライバシーポリシー</a>
            {' • '}
            <span>いつでも配信停止できます</span>
          </div>
        </div>

        {/* Features */}
        <div className="max-w-4xl mx-auto mt-16 grid md:grid-cols-3 gap-8 text-white">
          <div className="text-center">
            <div className="text-4xl mb-4">🎯</div>
            <h3 className="font-bold text-lg mb-2">鋭い切り口</h3>
            <p className="text-slate-400">プロのテックライターのような、読み応えのある解説</p>
          </div>
          <div className="text-center">
            <div className="text-4xl mb-4">⚡</div>
            <h3 className="font-bold text-lg mb-2">最新情報を即座に</h3>
            <p className="text-slate-400">新着動画を自動解析し、メールでお届け</p>
          </div>
          <div className="text-center">
            <div className="text-4xl mb-4">🎁</div>
            <h3 className="font-bold text-lg mb-2">完全無料</h3>
            <p className="text-slate-400">すべての機能を無料でご利用いただけます</p>
          </div>
        </div>
      </div>
    </div>
  )
}
