# Publish修正プロンプト集（Publish Fix Prompts）

> Publishエラー発生時にLovableのチャットへ送ったプロンプトを記録する。  
> 「何が効いたか・何が効かなかったか」を残すことで、次回の対処を高速化する。

---

## ✅ 有効だったプロンプト

### 1. ファイル凍結宣言（最重要・必ず最初に実行）

```
Do not touch __root.tsx at all from now on.
Do not add, modify, append, or regenerate any content in __root.tsx
under any circumstances. This file is frozen.
Any change to __root.tsx is strictly forbidden.
```

→ LovableのAIが `"frozen — I won't touch it"` と返答したことを確認してから次へ進む。

---

### 2. クリーンビルド指示

```
Please run a clean build.
```

→ または画面下部の `"Run a clean build"` ボタンを直接押す。

---

### 3. 複数行文字列の修正指示（補助的）

```
In __root.tsx, all string values in meta tags must be single-line.
Do not use line breaks inside any string literal.
Define all Japanese text as const variables at the top of the file.
```

⚠️ **注意**：この指示だけでは不十分。AIが「修正した」と言っても実際には直っていないことがある。  
エディタで直接確認・修正すること。

---

## ❌ 効果がなかったプロンプト（やってはいけない）

| プロンプト | 問題点 |
|---|---|
| `"Delete the duplicate meta tags"` | 削除しながら別の箇所に再生成する |
| `"Fix the build error in __root.tsx"` | 「修正した」と返答するが実際には直っていない |
| `"Make sure all strings are single-line"` | 次のPublish時にまた複数行を追記する |
| 修正済みファイルをチャットに貼り付け | 次のPublish時にまた上書き追記される |

---

## 実際の修正フロー（2026年6月9日実施）

```
1. チャットで凍結宣言 → AIが "frozen" と返答
2. エディタで __root.tsx を全選択 → 全削除 → 正しいコードを貼り付け
3. クリーンビルドを実行
4. Publish → 成功
```

---

*作成日：2026年6月9日*
