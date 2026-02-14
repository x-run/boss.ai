# Schema — boss.ai データモデル定義

> 最終更新: 2025-02 / Phase: MVP
> 定義元: `src/types/brief.ts`, `src/lib/storage.ts`, `src/lib/workers.ts`

## 1. Brief（ブリーフ / 動画要件書）

**定義**: `src/types/brief.ts`

```typescript
type Platform = "TikTok" | "Reels" | "YouTube" | "広告";
type Tone = "Energetic" | "Calm" | "Luxury" | "Casual";

interface Brief {
  purpose: Platform | "";      // 動画の用途（必須）
  duration: string;            // 動画の尺（例: "30", "60"）（必須）
  target: string;              // ターゲット層（必須）
  tones: Tone[];               // トーン / 雰囲気（1つ以上必須）
  concept: string;             // コンセプト（必須）
  details: string;             // 追加の詳細（任意）
  assets_url: string;          // 素材URL（必須 for ready）
  bgm_url: string;             // BGM URL（任意）
  logo_url: string;            // ロゴURL（任意）
  thumb_url: string;           // サムネイルURL（任意）
  font_note: string;           // フォント指示（任意）
}
```

### Readiness 判定（6項目）
| フィールド | ラベル | 条件 |
|-----------|--------|------|
| purpose | 用途 | 空でない |
| duration | 尺 | 空でない |
| target | ターゲット | 空でない |
| tones | トーン | 1つ以上 |
| concept | コンセプト | 空でない |
| assets_url | 素材URL | 空でない |

全項目が埋まると `ready`、未完了は `draft`。

## 2. Job（案件）

**定義**: `src/lib/storage.ts`
**localStorage キー**: `boss-jobs`

```typescript
type JobStatus = "draft" | "ready" | "in_progress" | "review" | "done";

interface Job {
  id: string;                  // crypto.randomUUID() or fallback
  createdAt: string;           // ISO 8601
  status: JobStatus;
  brief: Brief;                // 埋め込み
  requirements: {
    assetsRequired: boolean;   // 素材が必要か（常に true）
  };
}
```

### ステータス遷移
```
draft → ready    （Readiness 全項目充足時に自動昇格）
ready → in_progress → review → done   （将来: 手動 or AI制御）
```

### CRUD 関数
| 関数 | シグネチャ |
|------|-----------|
| `getAllJobs()` | `() => Job[]`（createdAt 降順） |
| `getJob(id)` | `(id: string) => Job \| null` |
| `createJob(brief)` | `(brief: Brief) => Job` |
| `updateJob(id, updates)` | `(id, Partial<Pick<Job, "brief" \| "status">>) => Job \| null` |
| `deleteJob(id)` | `(id: string) => void` |

## 3. Worker（ワーカー / 編集者）

**定義**: `src/lib/workers.ts`
**localStorage キー**: `boss-workers`

```typescript
type WorkerStatus = "available" | "busy" | "offline";
type PlatformTag = "TikTok" | "Reels" | "YouTube" | "Ads";
type ToolTag = "Premiere" | "CapCut" | "DaVinci" | "AfterEffects";
type StrengthTag = "Hook" | "Captions" | "Color" | "BeatSync" | "Thumbnail";

interface Worker {
  id: string;                  // "w_" + timestamp36 + random
  createdAt: number;           // Date.now()
  name: string;                // 必須
  timezone: string;            // デフォルト "Asia/Tokyo"
  status: WorkerStatus;        // 必須
  headline: string;            // 任意（一行自己紹介）
  capabilities: Capability[];  // 1つ以上必須
  authProvider?: string;       // 認証プロバイダー（"google" 等）
  authProviderId?: string;     // プロバイダー側のユーザーID（Google sub）
  avatarUrl?: string;          // プロフィール画像 URL or dataURL
  bio?: string;                // 自己紹介文（複数行）
  gender?: Gender;             // 性別
  locationText?: string;       // 居住地（例: "沖縄"）
  skills?: string[];           // ハッシュタグ風スキルタグ
  socials?: Socials;           // SNS リンク
  updatedAt?: string;          // ISO 8601 — 最終更新日時
}

type Gender = "male" | "female" | "other" | "na";

interface Socials {
  twitter?: string;
  instagram?: string;
  website?: string;
  youtube?: string;
  linkedin?: string;
}
```

## 4. Capability（スキル定義）

```typescript
interface Capability {
  id: string;                  // "cap_" + timestamp36
  type: "video_edit";          // 現在は固定
  platforms: PlatformTag[];    // 1つ以上必須
  tools: ToolTag[];            // 1つ以上必須
  strengths: StrengthTag[];    // 1つ以上必須
  portfolioUrls: string[];     // 任意（最大5つ、http/https のみ）
}
```

### Worker Readiness 判定（5項目）
| フィールド | ラベル | 条件 |
|-----------|--------|------|
| name | Name | 空でない |
| status | Status | 設定済み |
| capability.platforms | Platforms | 1つ以上 |
| capability.tools | Tools | 1つ以上 |
| capability.strengths | Strengths | 1つ以上 |

### CRUD 関数
| 関数 | シグネチャ |
|------|-----------|
| `getAllWorkers()` | `() => Worker[]` |
| `getWorker(id)` | `(id: string) => Worker \| null` |
| `createWorker(data)` | `(Omit<Worker, "id" \| "createdAt">) => Worker` |
| `updateWorker(id, updates)` | `(id, Partial<Omit<Worker, "id" \| "createdAt">>) => Worker \| null` |
| `deleteWorker(id)` | `(id: string) => void` |
| `findWorkerByAuth(provider, providerId)` | `(string, string) => Worker \| null` |
| `upsertWorkerByAuth(profile)` | `(AuthProfile) => Worker` |

## 5. Session（認証セッション）

**定義**: `src/lib/auth.ts`
**localStorage キー**: `boss-session`

```typescript
interface GoogleUser {
  sub: string;                 // Google ユーザー ID
  email: string;               // メールアドレス
  name: string;                // 表示名
  picture: string;             // プロフィール画像 URL
}

interface Session {
  provider: "google";          // 認証プロバイダー（現在は Google のみ）
  idToken: string;             // Google ID Token（未検証、デコード用のみ）
  user: GoogleUser;            // デコード済みユーザー情報
  createdAt: number;           // Date.now() — セッション作成日時
}
```

### CRUD 関数
| 関数 | シグネチャ | 説明 |
|------|-----------|------|
| `loadSession()` | `() => Session \| null` | localStorage から読み込み |
| `saveSession(session)` | `(Session) => void` | localStorage に保存 |
| `clearSession()` | `() => void` | localStorage から削除 |
| `decodeJwtPayload(token)` | `(string) => GoogleUser` | JWT ペイロード部を atob でデコード |

## 6. Message（チャットメッセージ）

**定義**: `src/types/brief.ts`
ブリーフ作成のAIチャットUIで使用する discriminated union。

```typescript
// AI からのテキストメッセージ
interface AiTextMessage {
  id: string;
  role: "ai";
  type: "text";
  text: string;
}

// AI からの選択肢メッセージ
interface AiOptionsMessage {
  id: string;
  role: "ai";
  type: "options";
  text: string;
  key: string;               // Brief のどのフィールドに対応するか
  multi: boolean;            // 複数選択可能か
  answered: boolean;         // ユーザーが回答済みか
  options?: { label: string; value: string }[];
  customInput?: "duration" | "target" | null;
}

// ユーザーの回答メッセージ
interface UserMessage {
  id: string;
  role: "user";
  text: string;
}

type Message = AiTextMessage | AiOptionsMessage | UserMessage;
```

## 7. BriefStore（ブリーフ作成の永続化状態）

**localStorage キー**: `boss-brief-draft`

```typescript
interface BriefStore {
  brief: Brief;
  messages: Message[];
  step: number;               // 現在のステップ index
  done: boolean;              // 全ステップ完了フラグ
}
```

## 8. 定数一覧

### PlatformTag
`"TikTok"`, `"Reels"`, `"YouTube"`, `"Ads"`

### ToolTag
`"Premiere"`, `"CapCut"`, `"DaVinci"`, `"AfterEffects"`

### StrengthTag
`"Hook"`, `"Captions"`, `"Color"`, `"BeatSync"`, `"Thumbnail"`

### タイムゾーン
`"Asia/Tokyo"`, `"America/New_York"`, `"America/Los_Angeles"`, `"Europe/London"`, `"Europe/Berlin"`, `"Asia/Shanghai"`, `"Asia/Singapore"`

## 9. 将来のスキーマ拡張（v1 計画）

### Job への追加フィールド
```typescript
// v1 で追加予定
interface Job {
  // ... 既存フィールド
  assignedWorkerId?: string;   // アサインされた Worker
  deliverables?: Deliverable[];// 納品物
  aiScore?: number;            // AI 一次評価スコア (0-100)
  clientApproved?: boolean;    // Client の最終承認
}
```

### Worker への追加フィールド
```typescript
// v1 で追加予定
interface Worker {
  // ... 既存フィールド
  email?: string;              // 認証用
  rating?: number;             // 累積評価 (0-5)
  completedJobs?: number;      // 完了案件数
  activeJobIds?: string[];     // 進行中の案件
}
```
