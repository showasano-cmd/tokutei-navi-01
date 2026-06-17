# Lovable Publish 詰まり記録
## 原因・対処・教訓（2026年6月9日）

> **対象プロジェクト：** Tokutei Gino Navigator（特定技能2号移行ナビ）  
> **技術スタック：** Lovable / React / TypeScript / TanStack Router / esbuild  
> **問題の性質：** 日本語テキストを含むmetaタグの複数行文字列によるビルドエラー

---

## 時系列サマリー

### Phase 1：最初のPublish失敗

**原因**

HTMLからReactへの変換時に、Lovableが自動生成したmetaタグのdescription属性に日本語の複数行文字列が入った。esbuildは本番ビルドで文字列の途中改行を「未終端の文字列」として扱いビルドを落とす。PreviewはこのエラーをスキップするためPreviewでは動いていた。

**試みた対処**

Lovableのチャットに「複数行文字列を1行にしろ」と指示 → LovableのAIが「修正した」と返答するが実際には直っていない、または別箇所に同じ問題を再生成する繰り返しが発生。

---

### Phase 2：Lovable自動追記との戦い

**原因**

LovableにはSEO自動管理機能があり、Publishのたびに`__root.tsx`のmetaタグを「最新化」しようとする。この機能が、正しく修正した内容の末尾に古い複数行エントリーを再追記し続けた。

具体的な挙動：

```
正しいエントリー（SITE_DESCRIPTION参照）
  ↓ Lovableが自動追記
壊れたエントリー（複数行インライン文字列）← ここでビルドが落ちる
```

チャット経由でもエディタ経由でも、次のPublish操作をトリガーに同じ追記が繰り返された。

**試みた対処（すべて不完全だった）**

- チャットで「削除しろ」と指示 → 削除しながら別の箇所に再生成
- 修正済みファイルを貼り付け → 次のPublish時にまた追記
- `SITE_DESCRIPTION`定数化 → 定数の下に再びインライン複数行を追記

---

### Phase 3：根本解決

**有効だった対処（この順序が重要）**

```
Step 1：チャットで __root.tsx の凍結を宣言させる

  "Do not touch __root.tsx at all from now on.
   Do not add, modify, append, or regenerate any content in __root.tsx
   under any circumstances. This file is frozen.
   Any change to __root.tsx is strictly forbidden."

  → LovableのAIが "frozen — I won't touch it" と返答

Step 2：エディタで正しいファイルを全選択 → 全削除 → 貼り付け

Step 3：クリーンビルドを実行してキャッシュをクリア
  （チャットで "Please run a clean build." と指示 or
   画面下部の "Run a clean build" ボタンを押す）

Step 4：Publish → 成功
```

---

## 正しい __root.tsx の構造（テンプレート）

日本語テキストを含むプロジェクトでは以下の構造を使う。

```tsx
// ✅ 正しい書き方：すべての文字列を定数として1行で定義する
const SITE_TITLE = "サイトタイトル";
const SITE_DESCRIPTION = "説明文をここに1行で書く。改行を入れてはいけない。";
const OG_IMAGE = "https://example.com/image.png";

// NOTE: Do not add, duplicate, or modify meta tags below. All meta is managed here only.
const META_TAGS = [
  { charSet: "utf-8" },
  { name: "viewport", content: "width=device-width, initial-scale=1" },
  { title: SITE_TITLE },
  { name: "description", content: SITE_DESCRIPTION },
  { name: "author", content: "Lovable" },
  { property: "og:title", content: SITE_TITLE },
  { property: "og:description", content: SITE_DESCRIPTION },
  { property: "og:type", content: "website" },
  { property: "og:image", content: OG_IMAGE },
  { name: "twitter:card", content: "summary" },
  { name: "twitter:site", content: "@Lovable" },
  { name: "twitter:title", content: SITE_TITLE },
  { name: "twitter:description", content: SITE_DESCRIPTION },
  { name: "twitter:image", content: OG_IMAGE },
] as const;

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [...META_TAGS],  // ← スプレッド展開することで自動追記の対象になりにくい
    links: [...],
  }),
  ...
});
```

```tsx
// ❌ 悪い書き方：インラインに日本語を直接書く（複数行になるとビルドが落ちる）
{ name: "description", content: "特定技能1号人材は在留期限内に2号へ間に合いますか？
在留期限・日本語証明・管理者実務経験の開始日を入力するだけで..." }
//                                                              ↑ここで改行するとエラー
```

---

## 教訓：今後Lovableで同じことが起きたときの対処フロー

```
Publishエラーが出たら
  ↓
エラーメッセージのファイル名と行番号を確認
  ↓
該当ファイルをエディタで直接開いて問題箇所を特定
  ↓
チャットで「該当ファイルを触るな・凍結する」と宣言させる
  ↓
正しいコードをClaudeで生成してもらう
  ↓
エディタで全選択 → 全削除 → 貼り付け（チャット経由ではなく直接）
  ↓
クリーンビルドを実行（"Run a clean build"）
  ↓
Publish
```

---

## 構造的な理解

| 項目 | 内容 |
|---|---|
| **PreviewとPublishの違い** | Previewはホットリロードでビルドエラーの一部をスキップする。Publishは本番ビルド（esbuild）で厳格にチェックするため、Previewで動いていてもPublishで落ちることがある |
| **Lovableのチャット指示の限界** | チャット経由の修正指示は「AIが理解して実行する」ため、意図と異なる変更や追加が発生しやすい。特に繰り返し失敗している箇所はチャットに任せず直接エディタで編集する |
| **SEO自動管理機能の干渉** | LovableはPublish時にSEO関連のmetaタグを自動的に「最適化」しようとする。日本語テキストを含む場合はこの機能が複数行文字列を再生成してビルドを壊す。凍結宣言が有効な抑止手段になる |
| **キャッシュの問題** | ファイルが正しくなってもesbuildのキャッシュが残っていると古いエラーが再現することがある。ファイル修正後は必ずクリーンビルドを実行する |
| **日本語テキストの取り扱い** | esbuildは文字列途中の改行を許容しない。日本語の長い文字列はインライン記述を避け、必ず定数（`const`）として1行で定義し、参照する形にする |

---

## 再発防止：最初のLovableプロンプトに含めるべき一文

今後Lovableで日本語テキストを含むプロジェクトをPublishする場合は、**最初のプロンプトの冒頭**に以下を含めることで同じ問題を回避できる。

```
IMPORTANT: All Japanese text strings must be defined as single-line const 
variables at the top of the file. Never write Japanese text inline inside 
JSX attributes or meta tag content values. Do not use automatic SEO meta 
tag management. Do not insert line breaks inside any string literal.
```

---

## Google Drive / GPT への共有用サマリー（コピペ用）

```
【Lovable Publish エラー 再発防止メモ】

問題：日本語テキストを含むmetaタグの複数行文字列でesbuildがビルドエラー。
　　　LovableのSEO自動管理がPublishのたびに複数行エントリーを再追記する。

解決手順：
1. チャットで __root.tsx を凍結宣言させる
   "This file is frozen. Any change is strictly forbidden."
2. エディタで正しいファイルを全選択→全削除→貼り付け
3. クリーンビルドを実行
4. Publish

予防策：
- 日本語テキストはすべて const で1行定義し、インライン記述しない
- meta配列は META_TAGS = [...] as const で外出しし、head()内は meta: [...META_TAGS] のみにする
- 最初のプロンプトに "Do not use automatic SEO meta tag management" を含める

PreviewとPublishは別物：
Previewで動いていてもPublishで落ちることがある（esbuildの厳格度が異なる）
```

---

*作成日：2026年6月9日*  
*対象：Lovable + TanStack Router + esbuild + 日本語テキストを含むプロジェクト全般*
