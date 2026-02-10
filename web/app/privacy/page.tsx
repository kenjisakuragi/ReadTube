export default function PrivacyPage() {
    return (
        <div className="min-h-screen bg-white">
            <div className="container mx-auto px-4 py-16 max-w-4xl">
                <h1 className="text-4xl font-bold text-slate-900 mb-8">プライバシーポリシー</h1>

                <div className="prose prose-slate max-w-none">
                    <section className="mb-8">
                        <h2 className="text-2xl font-bold text-slate-900 mb-4">1. 収集する情報</h2>
                        <p className="text-slate-700 mb-4">
                            ReadTubeは、サービス提供のために以下の情報を収集します：
                        </p>
                        <ul className="list-disc pl-6 text-slate-700 space-y-2">
                            <li>メールアドレス（ニュースレター配信のため）</li>
                            <li>購読チャンネル情報（コンテンツのパーソナライズのため）</li>
                            <li>配信ログ（サービス改善のため）</li>
                        </ul>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-2xl font-bold text-slate-900 mb-4">2. 情報の利用目的</h2>
                        <p className="text-slate-700 mb-4">
                            収集した情報は以下の目的で利用します：
                        </p>
                        <ul className="list-disc pl-6 text-slate-700 space-y-2">
                            <li>YouTubeチャンネルの最新動画レポートの配信</li>
                            <li>サービスの改善および新機能の開発</li>
                            <li>ユーザーサポート</li>
                        </ul>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-2xl font-bold text-slate-900 mb-4">3. 第三者への提供</h2>
                        <p className="text-slate-700 mb-4">
                            以下の場合を除き、ユーザーの同意なく第三者に個人情報を提供することはありません：
                        </p>
                        <ul className="list-disc pl-6 text-slate-700 space-y-2">
                            <li>法令に基づく場合</li>
                            <li>人の生命、身体または財産の保護のために必要がある場合</li>
                        </ul>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-2xl font-bold text-slate-900 mb-4">4. 利用するサービス</h2>
                        <p className="text-slate-700 mb-4">
                            ReadTubeは以下のサービスを利用しています：
                        </p>
                        <ul className="list-disc pl-6 text-slate-700 space-y-2">
                            <li><strong>Supabase</strong>: データベース管理（米国）</li>
                            <li><strong>Google Gemini API</strong>: AI解析（米国）</li>
                            <li><strong>メール配信サービス</strong>: ニュースレター送信</li>
                        </ul>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-2xl font-bold text-slate-900 mb-4">5. 配信停止</h2>
                        <p className="text-slate-700 mb-4">
                            配信されるメールに記載されている「配信停止」リンクから、いつでも購読を解除できます。
                        </p>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-2xl font-bold text-slate-900 mb-4">6. お問い合わせ</h2>
                        <p className="text-slate-700 mb-4">
                            プライバシーポリシーに関するご質問は、以下までお問い合わせください：
                        </p>
                        <p className="text-slate-700">
                            ReadTube運営事務局<br />
                            Email: privacy@readtube.example.com
                        </p>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-2xl font-bold text-slate-900 mb-4">7. 改定</h2>
                        <p className="text-slate-700 mb-4">
                            本プライバシーポリシーは、必要に応じて改定することがあります。
                            重要な変更がある場合は、サービス上で通知いたします。
                        </p>
                    </section>

                    <p className="text-sm text-slate-500 mt-12">
                        最終更新日: {new Date().toLocaleDateString('ja-JP')}
                    </p>
                </div>

                <div className="mt-12 text-center">
                    <a
                        href="/"
                        className="inline-block bg-slate-900 text-white py-3 px-8 rounded-lg hover:bg-slate-800 transition-colors"
                    >
                        トップページに戻る
                    </a>
                </div>
            </div>
        </div>
    )
}
