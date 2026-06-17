# 初回Lovableプロンプト（Initial Prompt）

> 対象プロジェクト：特定技能2号移行ナビ（Tokutei Gino 2-go Migration Navigator）
> 記録日：2026年6月9日
> このファイルの2つのプロンプトを順番通りに使えば、同等のLovableアプリを再現できる。

---

## ⚠️ 使用上の注意（再現時に必ず冒頭に追加すること）

```
IMPORTANT: All Japanese text strings must be defined as single-line const 
variables at the top of the file. Never write Japanese text inline inside 
JSX attributes or meta tag content values. Do not use automatic SEO meta 
tag management. Do not insert line breaks inside any string literal.
```

---

## Prompt 1：初回生成プロンプト（HTMLからReactへの変換）

```
I am providing a complete, production-ready HTML file for a Japanese immigration diagnostic tool called "特定技能2号移行ナビ" (Tokutei Gino 2-go Migration Navigator). This tool is designed for Japanese food service companies (外食業) to assess whether their foreign workers (特定技能1号) can successfully transition to 特定技能2号 status before their 在留期限 (residence period expiry).

---

CRITICAL CONSTRAINTS — DO NOT MODIFY THE FOLLOWING:

1. ALL DIAGNOSTIC JAVASCRIPT LOGIC must remain completely unchanged. This includes:
   - JLPT valid opportunity calculation (applicationReadyDeadline = addM(coe, -2), accounting for result announcement ~2 months after exam + application preparation period)
   - Timeline sort logic (tlEntries.sort by .sort key)
   - All judgment thresholds (d, c counters and verdict conditions)
   - JP_TO_N3 month estimates
   - Default cost values (DEFAULT_RECRUIT = 800000, DEFAULT_MONTHLY = 250000)
   - Exam schedule logic (nextExam starting from addM(t,1) to avoid same-month display)
   - The 80% special route section conditional display (only shown when d>=1 or c>=2)

2. ALL OUTPUT TEXT (labels, messages, result copy) must remain in Japanese exactly as written. Do not translate or rephrase any Japanese strings.
   Exception to constraint #2: The Integrity Diagnosis CTA button text must be changed from the current alert-based button to display "インテグリティ診断（準備中）", and the button must be disabled and visually grayed out.

3. The existing CSS variable system (--bg, --sf, --bd, --tp, --ts, --th, --ac, --gr, --jl, etc.) must be preserved. Do not replace or rename variables.

4. The print stylesheet (@media print) must be preserved exactly. It currently hides: hero, form, rbtn-wrap, pw, cta-section, share-tools — and shows only the result card for clean PDF output.

---

WHAT I WANT YOU TO DO:

1. Convert this single HTML file into a Lovable React application with the following structure:
   - Preserve all visual design, color scheme, and layout exactly as in the HTML
   - Use Tailwind utility classes where appropriate, but defer to inline styles or CSS variables where Tailwind cannot replicate the exact design
   - Keep all fonts: Noto Sans JP and DM Mono (via Google Fonts)

2. Component structure (suggested, not mandatory):
   - HeroSection — static header with context bullets
   - DiagnosticForm — the 3 required inputs + optional cost inputs
   - ResultCard — full result display (all 5 layers + share tools + CTA section)
   - TimelineEntry — reusable timeline item component

3. The two CTA buttons at the bottom of results:
   - PreCheck button: already has a live URL (https://precheck-de-01.lovable.app/). Keep this as window.location.href navigation.
   - Integrity Diagnosis button: replace the current alert() with a disabled button displaying "インテグリティ診断（準備中）". The button must be visually distinct from active buttons (grayed out, not-allowed cursor). Do NOT use alert().

4. The "診断結果をコピー" (copy result) and "印刷 / PDF保存" (print) buttons must remain fully functional.

5. Mobile responsiveness: ensure the following multi-column grids collapse to a single column on screens narrower than 480px. The existing HTML does not fully handle this — implement the following behavior:

   @media (max-width: 480px) {
     .mrow, .roi-grid, .cta-grid, .cost-inputs, .share-tools {
       grid-template-columns: 1fr;
     }
   }

6. No authentication, no database, no backend. This is a fully client-side stateless tool. All state lives in React component state only.

---

KNOWN ISSUE ALREADY FIXED IN THE PROVIDED FILE:
- A garbled Japanese string combining "80%" and "合否発表と申請準備期間" has been corrected to read: '在留期限まで'+mCoe+'ヶ月。状況によっては80%特例ルートへの切り替えが必要です。'
  This fix is already in the file. No further change needed here.

---

WHAT SUCCESS LOOKS LIKE:
- A user inputs: 在留期限満了日, 日本語レベル (J.TEST Band or JLPT), 管理者実務経験開始日
- Optional: 採用費用 and 月次コスト for ROI calculation
- Clicks "2号移行の可能性を診断する"
- Sees a full diagnostic result with: verdict header, 5 numbered layers (01–05), a sorted timeline, share/print buttons, and two CTA cards
- Can print or save as PDF using browser print — result only, no form or navigation chrome
- On mobile (< 480px), all grid layouts display as single column without overflow or horizontal scroll

Please start by rendering the form and hero section, then implement the diagnostic logic and result display.
```

---

## Prompt 2：ロジックバグ修正プロンプト

```
There is a single logic bug to fix in the diagnostic result display. Do not change anything else.

---

THE BUG:
In the result rendering section, the "N3有効機会" metric in layer 01 displays `jlptsBefore.length` (the raw count of JLPT dates that fall before the residence expiry deadline). This value does not account for the study preparation period, so it shows "2回" even when the actual usable opportunity is zero.

However, layer 02 and the timeline (layer 03) correctly use `firstN3` (which does account for study preparation time) and display "有効なJLPT受験機会がありません" when `firstN3` is null.

This causes a direct contradiction: layer 01 says "2回" while layers 02 and 03 say "none available."

---

THE FIX:
In the layer 01 metric display, change the N3有効機会 value from:
  jlptsBefore.length
to:
  firstN3 ? 1 : 0

This makes the displayed count consistent with the actual usable opportunity that layers 02 and 03 already calculate correctly.

The color class logic should also be updated to match:
  was:   jlptsBefore.length === 0 ? 'd' : jlptsBefore.length === 1 ? 'c' : 'o'
  fix:   firstN3 ? 'o' : 'd'

No other changes. Do not touch any other logic, text, layout, or component.
```

---

## プロンプト送信後の注意事項

- Prompt 1 の送信時に、元のHTMLファイル（`tokutei_navi_vX_final.html`）を添付する
- Prompt 2 はPreviewで矛盾表示（レイヤー01と02・03の食い違い）を確認した後に送信する
- Prompt 2 の後、`__root.tsx` のSEOメタタグ問題が発生した場合は `lovable_prompt/publish_fix_prompt.md` の手順に従う

---

## プロンプト記録のルール

- バージョンアップ時は上書きではなく、日付付きで追記する
- 例：`## Prompt 3（2026年X月X日）：○○機能の追加`
- 大きな機能追加・UI変更のたびに記録を更新する

---

*記録日：2026年6月9日*
*対象：Lovable + TanStack Router + esbuild + 特定技能2号移行ナビ*