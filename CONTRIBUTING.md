# 開発・修正ガイドライン

## 基本方針

このリポジトリはLovableと連携している。
コードの直接編集よりも**Lovableチャット経由での修正**を優先する。

---

## 作業フロー

```
1. Claudeで仕様整理・修正プロンプト作成
      ↓
2. GPTでHTML/UIの検証（必要な場合）
      ↓
3. Lovableに修正プロンプトを投入
      ↓
4. Lovableプレビューで動作確認
      ↓
5. Publish（GitHubのmainに自動push）← 必須・手動
      ↓
6. 本番URLで最終確認
```

**注意：Publishを忘れると本番URLに反映されない。**

---

## 修正時の必須確認事項

### Lovableに修正を依頼する前に

- [ ] `runtime_rules/logic_lock_policy.md` を確認する
- [ ] 修正プロンプトの末尾に「Do NOT change」セクションを付記する
- [ ] `__root.tsx` に触れない指示になっているか確認する
- [ ] 診断ロジックに触れない指示になっているか確認する

### Lovableからの出力確認後に

- [ ] 診断結果が正常に表示されるか確認
- [ ] 「インテグリティ診断へ →」ボタンが別タブで開くか確認（https://tokutei-integrity-01.lovable.app/）
- [ ] 「別の人材を診断する」で初期化されるか確認
- [ ] ブラウザ印刷プレビュー（Cmd/Ctrl+P）で結果が正しく印刷されるか確認
- [ ] **Publishを実行したか確認**

---

## 変更禁止項目

詳細は `runtime_rules/logic_lock_policy.md` 参照。

**絶対に変更しないもの：**
- `__root.tsx`（SEOメタタグ管理ファイル）
- 診断ロジック（日付計算・JLPT日程・試験回数計算）
- `buildResultHtml` 関数の実装
- インテグリティ診断へのリンクURL（https://tokutei-integrity-01.lovable.app/）
- PreCheckへのリンクURL（https://precheck-de-01.lovable.app/）

---

## ブランチ運用

現在はmainブランチのみの運用。

Lovableが自動でmainにpushするため、手動でブランチを切る場合は事前に確認すること。

---

## ドキュメント更新ルール

| 変更内容 | 更新するファイル |
|---|---|
| 本番URLの変更 | `publish_info/production_url.md` |
| Lovableへの新規プロンプト投入 | `lovable_prompt/` に追加 |
| Publishエラー発生時 | `runtime_rules/lovable_publish_troubleshooting.md` |
| ロジック変更が必要になった場合 | `runtime_rules/logic_lock_policy.md` を先に確認 |
