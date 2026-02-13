# Architecture — boss.ai 技術アーキテクチャ

> 最終更新: 2025-02 / Phase: MVP

## 1. 技術スタック

| レイヤー | 技術 | バージョン |
|----------|------|-----------|
| UI | React | 19.2 |
| 型 | TypeScript | 5.9 |
| ビルド | Vite | 7.3 |
| スタイル | Tailwind CSS | 4.1（@tailwindcss/vite） |
| ルーティング | react-router | 7.13 |
| 状態管理 | React hooks + localStorage | — |
| バックエンド | **なし（MVP）** | — |
| ホスティング | 静的デプロイ想定（Vercel 等） | — |

## 2. ディレクトリ構造

```
boss.ai/
├── CLAUDE.md                 # 開発ガイド（AI向け）
├── docs/                     # ドキュメント駆動開発の中核
│   ├── PRD.md               # プロダクト要件定義書
│   ├── ARCHITECTURE.md      # 本ファイル
│   ├── SCHEMA.md            # データモデル定義
│   └── SCREENS.md           # 画面一覧・ステータス
├── public/
├── src/
│   ├── main.tsx             # エントリーポイント
│   ├── App.tsx              # RouterProvider ラッパー
│   ├── router.tsx           # ルート定義
│   ├── Layout.tsx           # アプリ共通レイアウト（ナビ + Outlet）
│   ├── index.css            # Tailwind imports + グローバルCSS
│   ├── pages/               # ページコンポーネント
│   │   ├── Landing.tsx      # LP（Layout外、独自CSS）
│   │   ├── BriefNew.tsx     # ブリーフ作成（AIチャットUI）
│   │   ├── Jobs.tsx         # 案件一覧
│   │   ├── JobDetail.tsx    # 案件詳細
│   │   ├── Workers.tsx      # ワーカー一覧
│   │   ├── WorkerNew.tsx    # ワーカー登録（4ステップ）
│   │   ├── WorkerDetail.tsx # ワーカー詳細
│   │   ├── WorkerRegister.tsx # (レガシースタブ)
│   │   └── JobsList.tsx     # (未使用スタブ)
│   ├── components/          # 再利用コンポーネント
│   │   └── brief/           # ブリーフ作成関連
│   │       ├── ChatThread.tsx
│   │       ├── ChatMessage.tsx
│   │       ├── OptionChips.tsx
│   │       ├── BriefPanel.tsx
│   │       └── AssetModal.tsx
│   ├── lib/                 # ビジネスロジック + CRUD
│   │   ├── storage.ts       # Job CRUD（boss-jobs）
│   │   └── workers.ts       # Worker CRUD（boss-workers）
│   ├── types/               # 共有型定義
│   │   └── brief.ts         # Brief, Message, StepDef
│   ├── storage/             # 汎用ストレージユーティリティ
│   │   └── kv.ts            # load<T>, save<T>, remove
│   └── styles/
│       └── landing.css      # LP専用カスタムCSS
├── package.json
├── tsconfig.json
├── vite.config.ts
└── eslint.config.js
```

## 3. ルーティング構造

```
createBrowserRouter
├── "/" → Landing            (Layout外。LP専用。独自nav)
└── Layout                   (共通ナビ + <Outlet />)
    ├── "/brief/new"  → BriefNew
    ├── "/jobs"       → Jobs
    ├── "/jobs/:id"   → JobDetail
    ├── "/workers"    → Workers
    ├── "/workers/new"→ WorkerNew
    ├── "/workers/:id"→ WorkerDetail
    ├── "/workers/register" → WorkerRegister (レガシー)
    └── "*"           → Navigate to "/"
```

**設計方針**:
- LP は Layout の外。独自のナビ・スタイルを持つ
- アプリ内ページは全て Layout でラップ（共通ナビ h-14）
- ルートは浅く保つ。ネスト最大2階層

## 4. データフロー

### MVP（現在）: localStorage 直結

```
[React Component]
    ↓ setState + save()
[src/lib/*.ts]     ← ビジネスロジック + バリデーション
    ↓ JSON.stringify
[localStorage]     ← boss-jobs, boss-workers, boss-brief-draft
    ↓ load()
[React Component]  ← useState + useEffect で読み込み
```

### v1（将来）: API 層の挿入

```
[React Component]
    ↓
[src/lib/*.ts]     ← インターフェース維持
    ↓ fetch() に差し替え
[API Server]       ← REST or tRPC
    ↓
[PostgreSQL]
```

**移行戦略**: `src/lib/` の関数シグネチャを維持したまま、内部を `fetch()` に差し替える。
ページコンポーネントは変更不要にする。

## 5. データ永続化（MVP）

| localStorage キー | 型 | 管理ファイル |
|---|---|---|
| `boss-jobs` | `Job[]` | `src/lib/storage.ts` |
| `boss-workers` | `Worker[]` | `src/lib/workers.ts` |
| `boss-brief-draft` | `BriefStore` | `src/pages/BriefNew.tsx` |

## 6. レイアウトパターン

### 共通ナビ（Layout.tsx）
```
┌──────────────────────────────────────┐
│ boss.ai │ ブリーフ作成 案件一覧 ...  │  h-14, backdrop-blur
├──────────────────────────────────────┤
│                                      │
│  <Outlet />                          │  flex-1, overflow-y-auto
│                                      │
└──────────────────────────────────────┘
```

### ページ共通
- コンテンツ幅: `max-w-3xl mx-auto px-4 sm:px-6 py-10`
- ヘッダー: モノラベル + h1 + アクションボタン
- カード: `bg-white/[0.025] border border-white/[0.06] rounded-2xl p-5`

### LP（Landing.tsx）
- Layout 外の独立ページ
- 独自ナビ（スクロール連動 `is-scrolled`）
- セクション: Hero → Workflow → Problem/Solution → Concept → Footer
- `styles/landing.css` にカスタムアニメーション
- IntersectionObserver でスクロールリビール

## 7. コンポーネント設計方針

### 現在の分割粒度
- **ページ**: 1ルート = 1ファイル。ローカルstate + CRUD呼び出し
- **コンポーネント**: `components/{ドメイン}/` 配下。ブリーフ関連のみ分割済み
- **Worker系**: 現在は各ページに直書き。共通化は必要になったら行う

### 将来の分割指針
- 3回以上再利用されるUI要素を抽出（StatusBadge, TagList, GlassCard 等）
- ドメインロジックは `src/lib/` に閉じ込め、コンポーネントは表示に専念
- コンポーネントフォルダは `components/{ドメイン}/` で整理

## 8. デザイントークン

```css
/* src/index.css @theme */
--font-sans: "Inter", "Noto Sans JP", system-ui, sans-serif;
--font-mono: "JetBrains Mono", monospace;
--color-surface: #050505;
--color-surface-elevated: #0a0a0a;
--color-border: rgba(255, 255, 255, 0.06);
```

### カラーパレット
| 用途 | クラス |
|------|--------|
| 背景(base) | `bg-[#050505]`, `bg-[#0a0a0a]` |
| テキスト(primary) | `text-white` |
| テキスト(secondary) | `text-neutral-400` |
| テキスト(muted) | `text-neutral-600` ~ `text-neutral-700` |
| アクセント(成功) | `emerald-400/500` |
| アクセント(警告) | `amber-400/500` |
| アクセント(情報) | `blue-400/500` |
| アクセント(強調) | `purple-400/500` |
| アクセント(エラー) | `red-400/500` |

### ステータスバッジ色
| ステータス | クラス |
|-----------|--------|
| available / ready / 完了系 | `bg-emerald-500/15 text-emerald-400 border-emerald-500/20` |
| busy / draft / 警告系 | `bg-amber-500/15 text-amber-400 border-amber-500/20` |
| offline / neutral | `bg-neutral-500/15 text-neutral-400 border-neutral-500/20` |
| in_progress / 情報系 | `bg-blue-500/15 text-blue-400 border-blue-500/20` |
| review / 強調系 | `bg-purple-500/15 text-purple-400 border-purple-500/20` |
| エラー / 未入力 | `bg-red-500/10 text-red-400/70 border-red-500/10` |
