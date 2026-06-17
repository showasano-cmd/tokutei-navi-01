# ロジック変更禁止ポリシー（Logic Lock Policy）

> このファイルは、アプリのコアロジックをLovableのAIが勝手に変更しないためのルールを定義する。  
> UI修正・デザイン変更の際に、計算ロジックや判定ロジックが意図せず書き換えられるのを防ぐ。

---

## 背景

LovableのAIはチャットの指示を「解釈」して実行するため、  
「ボタンの色を変えて」という指示に対してロジック部分まで書き換えることがある。  
特に複数回の修正を重ねた後に問題が顕在化しやすい。

---

## ロックするべきファイル・関数

本プロジェクトでロジック変更を禁止するファイルと関数を以下に記録する。  
（プロジェクト固有の内容をここに追記していく）

| ファイル名 | 関数名・対象 | 理由 |
|---|---|---|
| `__root.tsx` | metaタグ全体 | SEO自動管理との衝突防止 |
| （追記） | （追記） | （追記） |

---

## ロジックロックのプロンプト

ロジックを含むファイルを変更したくない場合、チャットの指示に以下を追加する：

```
Do not modify any calculation logic, judgment logic, or business rules.
Only change [変更したい箇所] and nothing else.
If you are unsure, ask me before making changes.
```

---

## UIのみ変更する場合の安全な指示の出し方

```
// ✅ 安全な指示の例
"Change the background color of the result section to light blue.
Do not modify any logic or data processing."

// ❌ 危険な指示の例（曖昧でロジックまで書き換えられる可能性がある）
"Make the result section look better."
"Improve the output display."
```

---

## ロジック変更が必要な場合のフロー

1. **変更内容をClaudeで事前に設計・レビューする**
2. **変更箇所を明示してLovableに指示する**
3. **変更後、必ず動作確認する**（計算結果・判定結果が変わっていないか）
4. **この `logic_lock_policy.md` のテーブルを更新する**

---

*作成日：2026年6月9日*
