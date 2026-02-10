# ReadTube - YouTubeを記事として読む

AIがYouTube動画を解析し、プロのライターが書いたような日本語レポートをメールで配信する無料SaaSサービスです。

## アーキテクチャ

```
web/          - Next.jsフロントエンド（ランディングページ、購読管理）
src/          - バックエンド処理（動画解析、メール配信）
.github/      - GitHub Actions（自動実行）
```

## セットアップ

### 1. 環境変数の設定

#### バックエンド（ルートディレクトリの `.env`）
```env
GEMINI_API_KEY=your_gemini_api_key
SMTP_HOST=smtp.gmail.com
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
EMAIL_FROM=noreply@yourdomain.com
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_KEY=your_supabase_service_key
BASE_URL=https://your-readtube-app.vercel.app
```

#### フロントエンド（`web/.env.local`）
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 2. Supabaseのセットアップ

Supabaseプロジェクトを作成し、以下のSQLを実行してください：

```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  unsubscribe_token TEXT UNIQUE NOT NULL
);

CREATE TABLE subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  channel_id TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, channel_id)
);
```

### 3. ローカル開発

#### フロントエンド
```bash
cd web
npm install
npm run dev
```

#### バックエンド（テスト実行）
```bash
npx ts-node scripts/run_pipeline.ts [VIDEO_ID]
```

## デプロイ

### フロントエンド
Vercelにデプロイ（推奨）:
```bash
cd web
vercel
```

### バックエンド
GitHub Actionsで自動実行。以下のSecretsを設定：
- `GEMINI_API_KEY`
- `SMTP_HOST`, `SMTP_USER`, `SMTP_PASS`, `EMAIL_FROM`
- `SUPABASE_URL`, `SUPABASE_SERVICE_KEY`
- `BASE_URL`

## ライセンス
MIT
