# 本番環境情報（Production URL）

## 本番URL

```
https://tokutei-navi-01.lovable.app/
```

---

## 環境詳細

| 項目 | 内容 |
|---|---|
| **Platform** | Lovable |
| **Build** | esbuild（Lovable管理） |
| **Framework** | React + TypeScript |
| **Router** | TanStack Router |
| **Backend** | なし（クライアントサイドのみ） |
| **認証** | なし |
| **データ保存** | なし（すべてクライアント計算） |
| **印刷/PDF** | 対応済み |
| **公開日** | 2026年6月9日 |

---

## デプロイ手順（Lovable）

1. Lovableエディタを開く
2. 右上の **Publish** ボタンを押す
3. エラーが出た場合 → `runtime_rules/lovable_publish_troubleshooting.md` の手順に従う

---

## ⚠️ Publish前チェックリスト

- [ ] `__root.tsx` に複数行文字列が含まれていないか確認
- [ ] クリーンビルドを実行（"Run a clean build"）
- [ ] Previewで動作確認済み

---

*作成日：2026年6月9日*
