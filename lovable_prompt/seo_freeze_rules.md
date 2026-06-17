# SEOメタタグ凍結ルール（SEO Freeze Rules）

> このファイルは `__root.tsx` のSEOメタタグ管理ルールを定義する。  
> LovableのSEO自動管理機能との衝突を防ぐための永続的なルール。

---

## なぜ凍結が必要か

LovableにはPublish時にSEO関連のmetaタグを「最適化」する自動機能がある。  
日本語テキストを含む場合、この機能が複数行文字列を再生成し、esbuildのビルドを落とす。

**再現した問題の具体的な挙動：**

```
正しいエントリー（SITE_DESCRIPTION参照）
  ↓ LovableがPublish時に自動追記
壊れたエントリー（複数行インライン文字列）← ここでビルドが落ちる
```

---

## 凍結ルール（絶対ルール）

1. **`__root.tsx` はチャット経由で変更しない**
2. **変更が必要な場合は必ずエディタで直接編集する**
3. **変更後は必ずクリーンビルドを実行してからPublishする**
4. **LovableのSEO自動管理機能は無効化する**（プロンプトで明示的に禁止する）

---

## 正しい `__root.tsx` のメタタグ構造

```tsx
// ✅ すべての文字列を定数として1行で定義する
const SITE_TITLE = "サイトタイトル";
const SITE_DESCRIPTION = "説明文を1行で書く。改行を入れてはいけない。";
const OG_IMAGE = "https://example.com/image.png";

// NOTE: Do not add, duplicate, or modify meta tags below.
// All meta is managed here only.
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
    meta: [...META_TAGS],
    links: [...],
  }),
  ...
});
```

---

## やってはいけない書き方

```tsx
// ❌ インラインに日本語を直接書く（複数行になるとビルドが落ちる）
{ name: "description", content: "特定技能1号人材は在留期限内に2号へ間に合いますか？
在留期限・日本語証明・管理者実務経験の開始日を入力するだけで..." }
//                                                              ↑ここで改行するとエラー
```

---

## 新しいLovableプロジェクトを始める際の予防策

プロンプトの冒頭に必ず含める：

```
IMPORTANT: All Japanese text strings must be defined as single-line const 
variables at the top of the file. Never write Japanese text inline inside 
JSX attributes or meta tag content values. Do not use automatic SEO meta 
tag management. Do not insert line breaks inside any string literal.
```

---

*作成日：2026年6月9日*
