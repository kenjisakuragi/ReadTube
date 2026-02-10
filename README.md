# ReadTube Premium Pipeline

YouTubeの動画をAI（Gemini 2.0 Flash）が解析し、プロフェッショナルな日本語レポートとしてメール配信する自動化システムです。

## 主な機能

- **堅牢な字幕取得**: `yt-dlp` を使用し、ブロックを回避しながら字幕を抽出。
- **マルチモーダル解析**: 字幕がない場合は動画の音声を直接Geminiにアップロードして解析。
- **プレミアム・ライティング**: プロのテックライターのような、鋭く読み応えのある日本語記事を自動生成。
- **リッチなメール配信**: サムネイル画像付きの洗練されたデザインでレポートを配信。

## セットアップ

### 1. 環境変数の設定
`.env` ファイルを作成し、以下の情報を設定してください。

```env
GEMINI_API_KEY=your_gemini_api_key
SMTP_HOST=your_smtp_host
SMTP_USER=your_smtp_user
SMTP_PASS=your_smtp_pass
EMAIL_FROM=noreply@yourdomain.com
```

### 2. ローカルでの実行
最新の動画を1本テスト解析する場合：
```bash
npx ts-node scripts/run_pipeline.ts [VIDEO_ID]
```

全チャンネルの新規動画をチェックする場合：
```bash
npx ts-node src/index.ts
```

## GitHub Actions での運用

リポジトリをGitHubにプッシュした後、以下の **Repository Secrets** を設定してください。

1. `GEMINI_API_KEY` (必須)
2. `SMTP_HOST`
3. `SMTP_USER`
4. `SMTP_PASS`
5. `EMAIL_FROM`

設定後、毎日 00:00 UTC に自動実行され、新規動画があればレポートが生成・配信されます。
また、GitHub Actionsの画面から `Run workflow` を選ぶことで、特定の動画IDを指定して手動実行することも可能です。
