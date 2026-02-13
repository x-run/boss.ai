# Screens — boss.ai 画面一覧

> 最終更新: 2025-02 / Phase: MVP
>
> ステータス凡例:
> - ✅ 実装済み
> - 🚧 実装中（部分的に動作）
> - 📋 設計済み（ドキュメントのみ）
> - 💡 アイデア段階

---

## 1. Landing Page（LP）

| 項目 | 内容 |
|------|------|
| **パス** | `/` |
| **ファイル** | `src/pages/Landing.tsx`, `src/styles/landing.css` |
| **ステータス** | ✅ 実装済み |
| **Layout** | Layout 外（独自ナビ） |

### 構成要素
| セクション | ステータス | 説明 |
|-----------|-----------|------|
| ローダー | ✅ | 600ms のブランドローダー |
| ナビゲーション | ✅ | スクロールで `is-scrolled` 付与。「編集者登録」リンクあり |
| Hero | ✅ | バッジ + ヘッドライン（スロットアニメ）+ サブコピー |
| Hero CTA | ✅ | 「ブリーフを作成する」→ /brief/new、「編集者として登録する」→ /workers/new、「仕組みを見る」→ スクロール |
| Workflow | ✅ | 4ステップフロー（AI企画→人間編集→AI検品→Client納品） |
| Problem/Solution | ✅ | 3枚の課題→解決カード |
| Concept | ✅ | 「AIが、ボスになる。人間は、職人になる。」 |
| Footer | ✅ | ロゴ + コピーライト |

### インタラクション
- スクロールリビール（IntersectionObserver `useInView`）
- ヘッドラインのスロットマシンアニメーション
- Ambient orbs（背景グラデーション球）
- スムーズスクロール（ナビボタン→セクション）

---

## 2. ブリーフ作成

| 項目 | 内容 |
|------|------|
| **パス** | `/brief/new` |
| **ファイル** | `src/pages/BriefNew.tsx` |
| **ステータス** | ✅ 実装済み |
| **Layout** | 共通Layout |

### 構成要素
| 要素 | ステータス | 説明 |
|------|-----------|------|
| チャットスレッド | ✅ | AI との対話形式で Brief を埋める |
| 選択肢チップ | ✅ | 単一選択 / 複数選択 / カスタム入力 |
| ブリーフパネル | ✅ | 右サイドバー（デスクトップ）/ フローティング（モバイル） |
| 素材モーダル | ✅ | URL入力で素材・BGM・ロゴ・サムネイルを設定 |
| Job保存 | ✅ | 完了時にJobとしてlocalStorageに保存 |

### コンポーネント
- `components/brief/ChatThread.tsx` — メッセージリスト + 自動スクロール
- `components/brief/ChatMessage.tsx` — 個別メッセージ表示
- `components/brief/OptionChips.tsx` — インタラクティブ選択UI
- `components/brief/BriefPanel.tsx` — サマリーサイドパネル
- `components/brief/AssetModal.tsx` — 素材管理モーダル

### データフロー
```
BriefNew (state: brief, messages, step)
  → localStorage: "boss-brief-draft" (自動保存)
  → Job保存時: lib/storage.ts createJob(brief)
  → localStorage: "boss-jobs"
```

---

## 3. 案件一覧

| 項目 | 内容 |
|------|------|
| **パス** | `/jobs` |
| **ファイル** | `src/pages/Jobs.tsx` |
| **ステータス** | ✅ 実装済み |
| **Layout** | 共通Layout |

### 構成要素
| 要素 | ステータス | 説明 |
|------|-----------|------|
| ヘッダー | ✅ | タイトル + 「新規ブリーフ」ボタン |
| 空状態 | ✅ | 案件がない場合のプレースホルダー |
| Jobカード | ✅ | タイトル / 日付 / ステータスバッジ / 進捗バー / 未設定チップ |
| 削除ボタン | ✅ | confirm付き |

---

## 4. 案件詳細

| 項目 | 内容 |
|------|------|
| **パス** | `/jobs/:id` |
| **ファイル** | `src/pages/JobDetail.tsx` |
| **ステータス** | ✅ 実装済み |
| **Layout** | 共通Layout |

### 構成要素
| 要素 | ステータス | 説明 |
|------|-----------|------|
| ステータスバッジ + 進捗バー | ✅ | |
| Readinessチェックリスト | ✅ | 各フィールドの ✓/✗ 表示 |
| Brief サマリー | ✅ | key-value 形式で表示 |
| 素材URL入力 | ✅ | バリデーション付き |
| 削除ボタン | ✅ | confirm付き |

---

## 5. ワーカー一覧

| 項目 | 内容 |
|------|------|
| **パス** | `/workers` |
| **ファイル** | `src/pages/Workers.tsx` |
| **ステータス** | ✅ 実装済み |
| **Layout** | 共通Layout |

### 構成要素
| 要素 | ステータス | 説明 |
|------|-----------|------|
| ヘッダー | ✅ | タイトル + 「Workerを登録」ボタン |
| 空状態 | ✅ | ワーカーがいない場合のプレースホルダー |
| Workerカード | ✅ | 名前 / headline / ステータス pill / platform タグ / strength タグ |
| 詳細リンク | ✅ | カード全体がクリッカブル → `/workers/:id` |
| 削除ボタン | ✅ | confirm付き |

---

## 6. ワーカー登録（4ステップ式）

| 項目 | 内容 |
|------|------|
| **パス** | `/workers/new` |
| **ファイル** | `src/pages/WorkerNew.tsx` |
| **ステータス** | ✅ 実装済み |
| **Layout** | 共通Layout |

### ステップ構成
| Step | 名前 | 内容 | バリデーション |
|------|------|------|--------------|
| 1 | Profile | name(必須), status(3択), timezone, headline | name が空でない |
| 2 | Capability | platforms, tools, strengths（各複数選択チップ） | 各1つ以上 |
| 3 | Portfolio | URL入力+追加（最大5つ、http/https検証） | なし（任意） |
| 4 | Review | サマリー表示 + completeness% + missing chips | readiness 100% |

### レイアウト
```
Desktop:
┌─────────────────────┬──────────┐
│ Stepper + Form      │ Preview  │  grid-cols-[1fr_320px]
│                     │ Card     │
└─────────────────────┴──────────┘

Mobile:
┌─────────────────────┐
│ Stepper + Form      │  縦積み
├─────────────────────┤
│ Preview Card        │
└─────────────────────┘
```

### インタラクション
- 上部プログレスバー + "Step X / 4"
- ステップバッジ（active/complete/チェックアイコン）
- チップ: hover で浮く + 発光、選択済みは emerald + チェック
- ステップ切替: フェード + スライドアニメーション（CSS keyframes）
- 保存時: toast 表示 → 1.2s 後に `/workers` へ遷移

---

## 7. ワーカー詳細

| 項目 | 内容 |
|------|------|
| **パス** | `/workers/:id` |
| **ファイル** | `src/pages/WorkerDetail.tsx` |
| **ステータス** | ✅ 実装済み |
| **Layout** | 共通Layout |

### 構成要素
| 要素 | ステータス | 説明 |
|------|-----------|------|
| パンくずナビ | ✅ | Workers / {name} |
| プロフィールカード | ✅ | 名前 / headline / 日時 / timezone / ステータス |
| アサインヒント | ✅ | 「案件アサインの候補ワーカー」バッジ |
| Capability セクション | ✅ | platforms / tools / strengths タグ表示 |
| Portfolio セクション | ✅ | URLリスト（外部リンク） |
| 削除ボタン | ✅ | confirm付き |

---

## 8. レガシー / 未使用画面

| パス | ファイル | ステータス | 備考 |
|------|---------|-----------|------|
| `/workers/register` | `WorkerRegister.tsx` | 🗑️ 削除予定 | スタブ。WorkerNew に置き換え済み |
| — | `JobsList.tsx` | 🗑️ 削除予定 | 未使用。Jobs.tsx が本体 |

---

## 9. 将来の画面計画

| 画面 | パス（案） | Phase | 説明 |
|------|-----------|-------|------|
| Worker ダッシュボード | `/dashboard` | v1 | 受注案件一覧、進行中タスク |
| 案件マッチング | `/jobs/:id/match` | v1 | AI が提案する Worker 候補リスト |
| 納品・レビュー | `/jobs/:id/review` | v1 | 納品物プレビュー + AI評価 + 承認UI |
| 設定 | `/settings` | v1 | プロフィール編集、通知設定 |
| ログイン/サインアップ | `/login`, `/signup` | v1 | 認証フロー |
ああああああ
