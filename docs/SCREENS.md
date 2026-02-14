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
| ナビゲーション | ✅ | スクロールで `is-scrolled` 付与。探す/仕事一覧/依頼主向け/編集者向け + 認証切替CTA |
| Hero | ✅ | バッジ + ヘッドライン（スロットアニメ）+ サブコピー |
| Hero CTA | ✅ | 「ブリーフを作成する」→ /brief/new、「編集者として登録する」→ /login、「仕組みを見る」→ スクロール |
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

## 3. 案件一覧（Bounty Board スタイル）

| 項目 | 内容 |
|------|------|
| **パス** | `/jobs` |
| **ファイル** | `src/pages/Jobs.tsx` |
| **ステータス** | ✅ 実装済み |
| **Layout** | 共通Layout |
| **デザイン参考** | rentahuman.ai/bounties |

### 構成要素
| 要素 | ステータス | 説明 |
|------|-----------|------|
| ヘッダー | ✅ | 「Task Bounties」タイトル + 説明 + 「新規ブリーフ」ボタン |
| 統計カード | ✅ | Total / Open / Active / Done の4つのカウンター |
| 検索バー | ✅ | コンセプト・ターゲット・詳細でフリーテキスト検索 |
| フィルターチップ | ✅ | Status (Draft/Open/In Progress/Review/Completed) + Platform (TikTok/Reels/YouTube/広告) |
| 空状態 | ✅ | フィルタ結果0件 / 案件未登録時で文言切替 |
| Bountyカード | ✅ | ステータス色アクセントバー + タイトル + ターゲット + 経過時間 |
| カード仕様タグ | ✅ | Platform badge + Duration + Tone pills + 素材有無 |
| 進捗バー | ✅ | Readiness% + 未設定フィールドチップ |
| アクション | ✅ | 詳細リンク + 削除ボタン（カード全体クリッカブル） |

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

### 構成要素（Habitica風プロフィール）
| 要素 | ステータス | 説明 |
|------|-----------|------|
| パンくずナビ | ✅ | Workers / {name} · 登録日時 · timezone |
| ProfileHeader | ✅ | Avatar（丸+ランク色ring）+ 名前 + Editor Class + LV + XPバー |
| StatsGrid | ✅ | 6ステータス（Speed/Quality/Consistency/Communication/Reliability/Taste）メーター |
| SkillsPanel | ✅ | worker の capabilities から生成。スキル名 + 習熟度バー |
| BadgesPanel | ✅ | バッジチップ（3〜5個）+ Equipment スロット（4枠、レアリティ付き） |
| ActivityLog | ✅ | XP delta 履歴（5件、仮データ） |
| Portfolio セクション | ✅ | URLリスト（外部リンク） |
| 削除ボタン | ✅ | confirm付き |

### コンポーネント
- `components/worker/ProfileHeader.tsx` — Avatar + LV + XP bar + Editor Class
- `components/worker/StatsGrid.tsx` — 6ステータスメーター（hover で浮き + 発光）
- `components/worker/SkillsPanel.tsx` — スキル一覧 + proficiency bar
- `components/worker/BadgesPanel.tsx` — バッジ + Equipment スロット（rarity 表示）
- `components/worker/ActivityLog.tsx` — XP 獲得履歴

### 仮データ生成
- `lib/workerProfile.ts` の `deriveProfile(worker)` で全UIデータを生成
- worker.id を seed にした seeded PRNG（mulberry32）で毎回同じ値を返却
- 後でスキーマに移行可能な `DerivedProfile` 型で分離

---

## 8. ログイン

| 項目 | 内容 |
|------|------|
| **パス** | `/login` |
| **ファイル** | `src/pages/Login.tsx` |
| **ステータス** | ✅ 実装済み |
| **Layout** | 共通Layout |

### 構成要素
| 要素 | ステータス | 説明 |
|------|-----------|------|
| ヘッダー | ✅ | boss.ai ロゴ + "Worker Registration" テキスト |
| Google Sign-In ボタン | ✅ | GIS renderButton で描画 |
| 説明テキスト | ✅ | Googleアカウントで認証後、ワーカー登録へ進む旨の案内 |
| リダイレクト | ✅ | ログイン済みの場合 /workers/new or /workers/:id へ自動遷移 |

### データフロー
```
Login
  → GIS callback(credential)
  → decodeJwtPayload(credential)
  → saveSession({ provider: "google", idToken, user, createdAt })
  → navigate("/workers/new") or navigate("/workers/:id")
```

### 認証ガード（/workers/new）
- 未ログイン → `/login` へリダイレクト
- ログイン済み + Worker 登録済み（ownerUserId一致） → `/workers/:id` へリダイレクト
- ログイン済み + 未登録 → フォーム表示

---

## 9. 編集者ブラウズ（マーケットプレイス）

| 項目 | 内容 |
|------|------|
| **パス** | `/browse` |
| **ファイル** | `src/pages/WorkerBrowse.tsx` |
| **ステータス** | ✅ 実装済み |
| **Layout** | 共通Layout |

### 構成要素
| 要素 | ステータス | 説明 |
|------|-----------|------|
| ヘッダー | ✅ | タイトル + 登録ワーカー数 |
| 検索バー | ✅ | 名前・ヘッドラインでフリーテキスト検索 |
| フィルターチップ | ✅ | Platform / Status / Strength でフィルタリング |
| ワーカーカードグリッド | ✅ | レスポンシブ 1→2→3 列グリッド |
| ワーカーカード | ✅ | Avatar + LV + EditorClass + Status + Stats mini-bar + Tags |
| 空状態 | ✅ | フィルタ結果0件 / ワーカー未登録時 |
| 認証ガード | ✅ | 未ログイン時 → `/login` リダイレクト |

### カードレイアウト
```
┌─────────────────────────────────┐
│ Avatar(ring+LV)  Name  [Status]│
│ EditorClass · Headline          │
│                                 │
│ ████ Speed   ████ Quality       │
│ ████ Consist ████ Comms         │
│                                 │
│ [TikTok] [Reels] [YouTube]     │
│ [Hook] [Color] [BeatSync]      │
│                                 │
│ 🏅 Badge1  🏅 Badge2           │
│                                 │
│         [ プロフィールを見る ]   │
└─────────────────────────────────┘
```

### データフロー
```
WorkerBrowse
  → lib/auth.ts loadSession() — 認証チェック
  → lib/workers.ts getAllWorkers() — 全ワーカー取得
  → lib/workerProfile.ts deriveProfile(w) — 各カード用プロフィール生成
  → フィルタ・検索はクライアントサイドで処理
```

---

## 10. 依頼主向けページ（スタブ）

| 項目 | 内容 |
|------|------|
| **パス** | `/clients` |
| **ファイル** | `src/pages/Clients.tsx` |
| **ステータス** | 🚧 スタブ実装 |
| **Layout** | 共通Layout |

### 構成要素
| 要素 | ステータス | 説明 |
|------|-----------|------|
| ヘッダー | ✅ | タイトル + 説明文 |
| 3ステップ説明 | ✅ | ブリーフ→AI管理→納品の流れ |
| CTAボタン | ✅ | 「ブリーフを作成する」→ /brief/new |

---

## 11. 編集者向けページ（スタブ）

| 項目 | 内容 |
|------|------|
| **パス** | `/editors` |
| **ファイル** | `src/pages/Editors.tsx` |
| **ステータス** | 🚧 スタブ実装 |
| **Layout** | 共通Layout |

### 構成要素
| 要素 | ステータス | 説明 |
|------|-----------|------|
| ヘッダー | ✅ | タイトル + 説明文 |
| 3つのメリット | ✅ | 案件獲得・スキル可視化・RPGプロフィール |
| CTAボタン | ✅ | 「編集者として登録する」→ /login |

---

## 12. ワーカー領域（/app）

### WorkerLayout

| 項目 | 内容 |
|------|------|
| **ファイル** | `src/layouts/WorkerLayout.tsx` |
| **ステータス** | ✅ 実装済み |
| **認証ガード** | 未ログイン → /login、Worker 未登録 → /workers/new |

### WorkerNav（`src/components/nav/WorkerNav.tsx`）
| リンク | パス | スタイル |
|--------|------|---------|
| 仕事一覧 | `/jobs` | テキストリンク |
| 編集者一覧 | `/workers` | テキストリンク |
| 認証 | `/app/verification` | テキストリンク |
| ダッシュボード | `/app/dashboard` | 右端・背景色付きボタン（active: 白背景黒文字） |

---

## 12a. ダッシュボード（プロフィール編集）

| 項目 | 内容 |
|------|------|
| **パス** | `/app/dashboard` |
| **ファイル** | `src/pages/Dashboard.tsx` |
| **ステータス** | ✅ 実装済み |
| **Layout** | WorkerLayout |

### 構成要素
| 要素 | ステータス | 説明 |
|------|-----------|------|
| 認証ガード | ✅ | WorkerLayout で認証チェック + Dashboard でも二重チェック |
| Worker 解決 | ✅ | session.user.sub → findWorkerByAuth で現在ユーザーの Worker を取得 |
| Profile Hero Banner | ✅ | グラデーション背景 + アバター + 名前 + ステータス + 完了率バー |
| タブナビゲーション | ✅ | Profile / Skills / Social Links の3タブ |
| 基本情報フォーム | ✅ | name / headline / bio(textarea) / gender(select) / locationText / status |
| スキルタグ入力 | ✅ | Enter で追加、×で削除。サジェスト付き |
| SNS リンク | ✅ | twitter / instagram / website / youtube / linkedin。URL バリデーション |
| Floating Save Bar | ✅ | 画面下部固定。最終保存日時 + Save Changes ボタン |
| Toast | ✅ | 保存成功時に emerald トースト表示 |

### レイアウト
```
┌──────────────────────────────────────────────────────┐
│ [boss.ai | 仕事一覧  編集者一覧  認証  [Dashboard]] │ ← WorkerNav
├──────────────────────────────────────────────────────┤
│ ┌──────────────────────────────────────┐             │
│ │         Profile Hero Banner          │             │
│ └──────────────────────────────────────┘             │
│ [Profile] [Skills] [Social Links]                    │ ← tabs
│ ┌──────────────────────────────────────┐             │
│ │  Tab Content (form fields)           │             │
│ └──────────────────────────────────────┘             │
│ ┌──────────────────────────────────────┐             │
│ │  Last saved: ...    [Save Changes]   │             │ ← floating bar
│ └──────────────────────────────────────┘             │
└─────────────────��────────────────────────────────────┘
```

### データフロー
```
WorkerLayout
  → lib/auth.ts loadSession() — 認証チェック
  → lib/workers.ts findWorkerByAuth() — Worker 存在確認

Dashboard
  → lib/auth.ts loadSession() — 認証チェック
  → lib/workers.ts findWorkerByAuth("google", session.user.sub) — Worker 取得
  → フォーム編集 → updateWorker(id, updates) — localStorage に保存
  → updatedAt を ISO 8601 で自動付与
```

---

## 12b. プロフィール表示

| 項目 | 内容 |
|------|------|
| **パス** | `/app/profile` |
| **ファイル** | `src/pages/AppProfile.tsx` |
| **ステータス** | ✅ 実装済み |
| **Layout** | WorkerLayout |
| **説明** | ログイン中ワーカーの公開プロフィール表示（WorkerDetail を再利用） |

---

## 13. 認証マーク取得（スタブ）

| 項目 | 内容 |
|------|------|
| **パス** | `/app/verification` |
| **ファイル** | `src/pages/Verification.tsx` |
| **ステータス** | 🚧 スタブ実装 |
| **Layout** | WorkerLayout |

### 構成要素
| 要素 | ステータス | 説明 |
|------|-----------|------|
| アイコン | ✅ | 認証バッジ SVG（emerald） |
| タイトル | ✅ | 「認証マーク取得」 |
| 説明文 | ✅ | 本人確認・スキル認証の説明 |
| Coming Soon | ✅ | 準備中バッジ |

---

## 14. レガシー / 未使用画面

| パス | ファイル | ステータス | 備考 |
|------|---------|-----------|------|
| `/workers/register` | `WorkerRegister.tsx` | 🗑️ 削除予定 | スタブ。WorkerNew に置き換え済み |
| — | `JobsList.tsx` | 🗑️ 削除予定 | 未使用。Jobs.tsx が本体 |

---

## 15. 将来の画面計画

| 画面 | パス（案） | Phase | 説明 |
|------|-----------|-------|------|
| 案件マッチング | `/jobs/:id/match` | v1 | AI が提案する Worker 候補リスト |
| 納品・レビュー | `/jobs/:id/review` | v1 | 納品物プレビュー + AI評価 + 承認UI |
| 設定 | `/settings` | v1 | プロフィール編集、通知設定 |

