'use client'

import { Suspense, useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'

function SuccessContent() {
    const searchParams = useSearchParams()
    const sessionId = searchParams.get('session_id')
    const [verified, setVerified] = useState(false)

    useEffect(() => {
        if (sessionId) {
            setVerified(true)
        }
    }, [sessionId])

    if (!verified) {
        return (
            <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center px-4">
                <div className="text-center">
                    <div className="w-8 h-8 border-4 border-[#FF0000] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                    <p className="text-slate-500">確認中...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center px-4">
            <div className="max-w-md w-full bg-white rounded-3xl border-2 border-slate-200 p-10 text-center shadow-xl">
                <div className="text-6xl mb-6">🎉</div>
                <h1 className="text-2xl font-black text-slate-900 mb-3">
                    Standardプランへようこそ！
                </h1>
                <p className="text-slate-500 mb-2 leading-relaxed">
                    お支払いが完了しました。<br />
                    全記事の無制限閲覧とデイリーダイジェストメールをお楽しみください。
                </p>
                <div className="bg-[#FF0000]/5 rounded-2xl p-6 mt-6 mb-8 text-left">
                    <h3 className="text-sm font-black text-[#FF0000] uppercase tracking-widest mb-3">利用可能な特典</h3>
                    <ul className="space-y-2 text-sm text-slate-700">
                        <li className="flex items-center gap-2">
                            <span className="text-[#FF0000] font-bold">✓</span>
                            <span>全記事を無制限に閲覧</span>
                        </li>
                        <li className="flex items-center gap-2">
                            <span className="text-[#FF0000] font-bold">✓</span>
                            <span>毎日ダイジェストメール配信</span>
                        </li>
                        <li className="flex items-center gap-2">
                            <span className="text-[#FF0000] font-bold">✓</span>
                            <span>過去アーカイブの閲覧</span>
                        </li>
                    </ul>
                </div>
                <div className="flex flex-col gap-3">
                    <a
                        href="/dashboard"
                        className="w-full bg-[#FF0000] text-white py-4 rounded-full font-bold text-lg hover:bg-[#CC0000] transition-all shadow-lg shadow-[#FF0000]/20 block"
                    >
                        レポートを読む →
                    </a>
                    <a
                        href="/"
                        className="w-full bg-slate-100 text-slate-700 py-3 rounded-full font-bold hover:bg-slate-200 transition-all block"
                    >
                        トップに戻る
                    </a>
                </div>
            </div>
        </div>
    )
}

export default function SubscribeSuccessPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center px-4">
                <div className="text-center">
                    <div className="w-8 h-8 border-4 border-[#FF0000] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                    <p className="text-slate-500">読み込み中...</p>
                </div>
            </div>
        }>
            <SuccessContent />
        </Suspense>
    )
}
