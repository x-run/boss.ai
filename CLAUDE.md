# CLAUDE.md — boss.ai 開発ガイド

## プロジェクト概要

boss.ai は「AIがディレクションし、人間がクラフトする」動画制作プラットフォーム。
動画編集の仕事を依頼したい人（Client）と、編集したい人（Worker）を繋ぎ、
AIがプロジェクト管理・タスク分解・一次品質評価を自動で行う。

## ドキュメント駆動開発

**原則: ドキュメントを先に更新し、コードを後に書く。**

機能追加・変更時は以下の順序を守る:
1. `docs/` 配下の該当ドキュメントを更新（スキーマ変更 → SCHEMA.md、画面追加 → SCREENS.md）
2. コードを実装
3. 実装完了後に SCREENS.md のステータスを更新

主要ドキュメント:
- `docs/PRD.md` — プロダクト要件（ペルソナ、ユーザーストーリー、フェーズ計画）
- `docs/ARCHITECTURE.md` — 技術アーキテクチャ（スタック、ディレクトリ、データフロー）
- `docs/SCHEMA.md` — データモデル定義（型、localStorage キー、バリデーション）
- `docs/SCREENS.md` — 画面一覧と実装ステータス

## コマンド

```bash
npm run dev       # 開発サーバー (Vite)
npm run build     # tsc -b && vite build
npm run lint      # ESLint
npm run preview   # ビルド後プレビュー
```

## 技術スタック

- React 19 + TypeScript 5.9 + Vite 7
- Tailwind CSS 4（@tailwindcss/vite プラグイン）
- react-router v7（createBrowserRouter）
- 状態管理: React hooks + localStorage（バックエンド未導入）
- テストフレームワーク: 未導入

## ディレクトリ構造

```
src/
├── pages/          # ページコンポーネント（1ルート = 1ファイル）
├── components/     # 再利用コンポーネント（ドメイン別サブフォルダ）
├── lib/            # ビジネスロジック + CRUD（storage.ts, workers.ts）
├── types/          # 型定義
├── storage/        # 汎用 localStorage ユーティリティ
└── styles/         # ページ固有CSS（landing.css）
```

## コーディング規約

### TypeScript
- 厳密な型付け。`any` 禁止
- 型は `src/types/` または `src/lib/` のファイル先頭で定義
- discriminated union を活用（Message 型を参照）

### React
- 関数コンポーネント + hooks のみ
- ページは `export default function PageName()` で統一
- Alpine.js は使わない
- 外部状態管理ライブラリは導入しない（localStorage + hooks で統一）

### スタイリング
- Tailwind utility classes を className で直接記述
- ダークテーマ前提（背景: #050505 系、テキスト: neutral-400〜white）
- グラスモーフィズム: `bg-white/[0.025] border border-white/[0.06] rounded-2xl`
- ステータス badge: `px-2.5 py-1 rounded-full text-[10px] font-semibold border` + 色クラス
- ラベル: `text-[10px] font-mono tracking-[0.15em] uppercase text-neutral-600`
- ボタン(primary): `bg-white text-black hover:shadow-lg active:scale-[0.97]`
- ボタン(secondary): `bg-white/[0.04] text-neutral-400 border border-white/[0.06]`
- レスポンシブ: モバイルファースト、`sm:` / `md:` / `lg:` で拡張

### ファイル命名
- ページ: PascalCase（`WorkerNew.tsx`）
- ライブラリ: camelCase（`workers.ts`）
- 定数: SCREAMING_SNAKE_CASE（`STORAGE_KEY`）

### localStorage 規約
- キーは `boss-` プレフィックス統一（`boss-jobs`, `boss-workers`, `boss-brief-draft`）
- CRUD は `src/lib/` に集約。ページから直接 localStorage を触らない
- 汎用ヘルパーは `src/storage/kv.ts` の `load<T>()` / `save<T>()` を使う

## 既存ルート

| Path | Page | 説明 |
|------|------|------|
| `/` | Landing | LP（Layout外） |
| `/brief/new` | BriefNew | AI チャット式ブリーフ作成 |
| `/jobs` | Jobs | 案件一覧 |
| `/jobs/:id` | JobDetail | 案件詳細 |
| `/workers` | Workers | ワーカー一覧 |
| `/workers/new` | WorkerNew | ワーカー登録（4ステップ式） |
| `/workers/:id` | WorkerDetail | ワーカー詳細 |
| `/workers/register` | WorkerRegister | レガシースタブ（将来削除） |

## 注意事項

- バックエンドは未導入。全データは localStorage に保存
- デモ/営業用途を最優先。動くものを早く見せることが重要
- Landing ページは独立した CSS を持つ（`styles/landing.css`）。他ページとは分離
- `WorkerRegister.tsx` と `JobsList.tsx` はスタブ。将来削除予定
