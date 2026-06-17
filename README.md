# 特定技能2号移行ナビ

**外食業 法人向け 特定技能2号移行可能性診断ツール**

---

## 本番URL

| 項目 | 内容 |
|---|---|
| **Production URL** | https://tokutei-navi-01.lovable.app |
| **プラットフォーム** | Lovable |
| **公開日** | 2026年6月9日 |
| **リポジトリ** | tokutei-navi-01（Private）|

---

## 概要

特定技能1号人材が在留期限内に2号へ移行できるかを即時診断するWebツール。

在留期限・日本語レベル・管理者実務経験の開始日を入力するだけで、N3取得と技能試験のスケジュールを照合し、2号移行の実現可能性を判定する。

---

## 診断の3要件

```
① 在留期限の満了日
② 現在の日本語レベル（JLPT / J.TEST）
③ 管理者相当の実務経験 開始日
```

---

## 出力内容

| セクション | 内容 |
|---|---|
| 総合判定 | ○ / △ / ✕ の3段階 |
| 現在地と残り期間 | 在留期限まで・N3有効機会・実務経験月数 |
| 3要件チェック | 各要件の充足状況と警告 |
| 移行タイムライン | JLPT・技能試験・実務経験の照合 |
| 80%特例ルート | 必要な場合のみ表示 |
| 投資対効果 | 採用・育成コストの可視化 |
| 今すぐ取るべきアクション | 優先順位付きの行動リスト |

---

## 次のステップへの導線

診断結果ページ下部に2つの診断へのリンクがある。

| ツール | URL |
|---|---|
| PreCheck（日本語能力診断） | https://precheck-de-01.lovable.app/ |
| インテグリティ分析 | https://tokutei-integrity-01.lovable.app/ |

---

## 技術スタック

| 項目 | 内容 |
|---|---|
| フレームワーク | React + TypeScript |
| ルーター | TanStack Router |
| ビルド | Lovable管理 |
| バックエンド | なし（クライアントサイドのみ）|

---

## リポジトリ構成

```
tokutei-navi-01/
├── src/
│   └── routes/
│       ├── __root.tsx        # SEOメタタグ管理（直接編集禁止）
│       └── index.tsx         # メインアプリケーション
├── lovable_prompt/
│   ├── initial_prompt.md     # Lovable初回投入プロンプト
│   └── publish_fix_prompt.md # Publishエラー修正時のプロンプト
├── publish_info/
│   └── production_url.md     # 本番URL・環境情報
├── runtime_rules/
│   ├── logic_lock_policy.md          # ロジック変更禁止ポリシー
│   └── lovable_publish_troubleshooting.md  # Publish詰まり記録
├── README.md
└── CONTRIBUTING.md
```

---

## 重要事項

- **`__root.tsx` は直接編集禁止**。SEOメタタグはここで一元管理されており、Lovableチャット経由での変更はビルドエラーの原因になる
- **Publish後に本番反映**される。Lovableで修正しただけでは本番URLに反映されない
- **診断ロジック（日付計算・JLPT日程・試験回数）は変更禁止**

詳細は `runtime_rules/logic_lock_policy.md` 参照。

---

## 関連リポジトリ

| リポジトリ | 用途 | 状態 |
|---|---|---|
| tokutei-navi-01 | 特定技能2号移行ナビ（本リポジトリ）| 稼働中 |
| tokutei-integrity-01 | インテグリティ分析 | 稼働中 |
| tokutei-gino-2go-navi | 旧リポジトリ | ARCHIVED |

---

*初版作成：2026年6月9日*
