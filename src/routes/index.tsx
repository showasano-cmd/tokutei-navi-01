import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "特定技能2号 間に合うか診断" },
      { name: "description", content: "特定技能1号から2号への移行可能性を、在留期限・日本語証明・管理者実務経験から即時診断します。" },
      { property: "og:title", content: "特定技能2号 間に合うか診断" },
      { property: "og:description", content: "外食業 法人向け 特定技能2号移行ナビ — 無料診断ツール" },
    ],
  }),
  component: Index,
});

// ── 定数 ──────────────────────────────────
const JLPT_SCH = [{ m: 7, d: 6 }, { m: 12, d: 7 }];
const JP_TO_N3: Record<string, number> = {
  n3: 0, jtest_b: 0, jtest_c: 0,
  jtest_cd: 4, jtest_d: 8, jtest_ef: 16,
  n4: 6, n5: 14,
};
const JP_LABEL: Record<string, string> = {
  n3: "N3取得済み",
  jtest_b: "J.TEST A〜B（N2相当）",
  jtest_c: "J.TEST B〜C（N3〜N2相当）",
  jtest_cd: "J.TEST C〜D（N3境界）",
  jtest_d: "J.TEST D〜E（N4相当）",
  jtest_ef: "J.TEST E〜F（N5以下）",
  n4: "JLPT N4",
  n5: "JLPT N5 / 未受験",
};

function tod() { const d = new Date(); d.setHours(0, 0, 0, 0); return d; }
function addM(d: Date, n: number) { const r = new Date(d); r.setMonth(r.getMonth() + n); return r; }
function mDiff(a: Date, b: Date) { return (b.getFullYear() - a.getFullYear()) * 12 + (b.getMonth() - a.getMonth()); }
function fmt(d: Date) { return d.getFullYear() + "年" + (d.getMonth() + 1) + "月"; }

function nextJLPT(after: Date, n = 8) {
  const res: Date[] = []; const y = after.getFullYear();
  for (let i = y; i <= y + 4 && res.length < n; i++)
    for (const s of JLPT_SCH) { const dt = new Date(i, s.m - 1, s.d); if (dt > after) res.push(dt); if (res.length >= n) break; }
  return res;
}
const EXAM_M = [3, 6, 9, 12];
function nextExam(after: Date, n = 8) {
  const res: Date[] = []; const y = after.getFullYear();
  for (let i = y; i <= y + 3 && res.length < n; i++)
    for (const m of EXAM_M) { const dt = new Date(i, m - 1, 20); if (dt > after) res.push(dt); if (res.length >= n) break; }
  return res;
}

const escHtml = (str: string) =>
  String(str).replace(/[&<>"']/g, (ch) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[ch] as string));

function buildResultHtml(opts: {
  personName: string; coeV: string; jp: string; expV: string;
  recruitInput: number | null; monthlyInput: number | null;
}): string {
  const { personName, coeV, jp, expV, recruitInput, monthlyInput } = opts;
  const personLabel = personName.trim() ? personName.trim() : "未入力";
  const t = tod();
  const coe = new Date(coeV);
  const exp = new Date(expV);
  const mCoe = mDiff(t, coe);
  const expSoFar = Math.max(0, mDiff(exp, t));
  const expAtCoe = mDiff(exp, coe);
  const expOk = expAtCoe >= 24;
  const expShort = Math.max(0, 24 - expAtCoe);
  const needN3M = JP_TO_N3[jp] || 0;
  const n3ok = needN3M === 0;
  const n3ready = addM(t, needN3M);
  const jlpts = nextJLPT(t, 8);
  const applicationReadyDeadline = addM(coe, -2);
  const jlptsBefore = jlpts.filter((d) => addM(d, 2) <= applicationReadyDeadline);
  const firstN3 = n3ok ? null : (jlptsBefore.find((d) => d >= n3ready) || null);
  const examSearchFrom = addM(t, 1);
  const exams = nextExam(examSearchFrom, 8);
  const examsBefore = exams.filter((d) => d <= coe);
  const examCount = examsBefore.length;

  const issues: { l: string; t: string }[] = []; let d = 0, c = 0;

  if (mCoe < 0) { issues.push({ l: "danger", t: "在留期限がすでに切れています。在留管理の専門家に至急相談が必要です。" }); d++; }
  else if (mCoe < 6) { issues.push({ l: "danger", t: "在留期限まで" + mCoe + "ヶ月。N3取得と技能試験の両方が在留期限前に間に合わない可能性が極めて高い状況です。" }); d++; }
  else if (mCoe < 12) { issues.push({ l: "caution", t: "在留期限まで" + mCoe + "ヶ月。状況によっては80%特例ルートへの切り替えが必要です。" }); c++; }
  else { issues.push({ l: "ok", t: "在留期限まで" + mCoe + "ヶ月。計画的に動けば通常ルートでの2号移行が現実的です。" }); }

  if (n3ok) {
    issues.push({ l: "ok", t: "N3（日本語）要件はクリア済みです。在留資格申請時の日本語証明書を確保してください。" });
  } else {
    if (!firstN3) {
      issues.push({ l: "danger", t: "N3取得にはあと" + needN3M + "ヶ月の学習が必要ですが、合否発表と申請準備期間を考慮すると有効なJLPT受験機会がありません。特例ルートを検討してください。" }); d++;
    } else {
      const mToN3 = mDiff(t, firstN3);
      if (mToN3 <= mCoe * 0.6) {
        issues.push({ l: "caution", t: "N3未取得です。最短受験機会は" + fmt(firstN3) + "。今すぐ学習計画を立ち上げ、J.TEST等で進捗を定期確認してください。" }); c++;
      } else {
        issues.push({ l: "caution", t: "N3未取得。最短受験は" + fmt(firstN3) + "ですが、在留期限まで余裕がありません。学習の開始と加速が急務です。" }); c++;
      }
    }
  }

  if (examCount === 0) {
    issues.push({ l: "danger", t: "技能試験の受験機会が在留期限前にありません（または非常に限られています）。早急に状況を確認してください。" }); d++;
  } else if (examCount <= 1) {
    issues.push({ l: "caution", t: "技能試験の受験機会は在留期限前に" + examCount + "回のみです。テキスト4分野（接客全般・店舗運営・食の安全衛生・食品表示）の学習を今すぐ開始してください。" }); c++;
  } else {
    issues.push({ l: "ok", t: "技能試験は在留期限前に" + examCount + "回受験できる見込みです（推定）。合格率は約5〜6割のため、早めの準備が重要です。" });
  }

  if (!expOk) {
    if (expShort > 12) {
      issues.push({ l: "danger", t: "管理者相当の実務経験が在留期限までに" + expShort + "ヶ月不足します。今すぐ副店長・サブリーダー等の辞令を発行し記録してください。" }); d++;
    } else {
      issues.push({ l: "caution", t: "管理者相当の実務経験が在留期限までに" + expShort + "ヶ月不足する見込みです。辞令発行日と役割の記録を早急に整備してください。" }); c++;
    }
  } else {
    issues.push({ l: "ok", t: expSoFar >= 24 ? "管理者相当の実務経験は現時点で2年以上を満たしています（現時点" + expSoFar + "ヶ月経過）。" : "管理者相当の実務経験は在留期限時点で2年以上を満たせる見込みです（現時点" + expSoFar + "ヶ月経過）。" });
  }

  let vc: string, icon: string, vl: string, vs: string;
  if (d >= 2) { vc = "vd"; icon = "✕"; vl = "通常ルートでの2号移行は困難な状況です"; vs = "複数の要件で深刻な不足が確認されました。80%特例ルートへの切り替えと早期の専門家相談を強く推奨します。"; }
  else if (d === 1 || c >= 2) { vc = "vc"; icon = "△"; vl = "今すぐ具体的な行動計画が必要です"; vs = "要注意の項目があります。今すぐ動き始めれば間に合う可能性がありますが、放置すると危険な状態です。"; }
  else { vc = "vo"; icon = "○"; vl = "計画的に進めれば2号移行は実現可能です"; vs = "現時点では大きな問題は見られません。ただし無計画のまま放置すると状況は変わります。"; }

  type TL = { sort: number; dot: string; line: string; date: string; label: string; note: string; chip: string | null };
  const tlEntries: TL[] = [];
  tlEntries.push({ sort: t.getTime(), dot: "now", line: "dash", date: "現在（" + fmt(t) + "）", label: "診断完了・行動開始", note: "ここから逆算して動き始めることがすべての起点です", chip: null });

  if (!n3ok) {
    if (needN3M > 0) {
      tlEntries.push({ sort: n3ready.getTime(), dot: "n3", line: "solid", date: fmt(n3ready) + "ごろ", label: "N3受験準備が整う目安", note: "現在の日本語レベルから推定" + needN3M + "ヶ月の学習期間。J.TESTで月次進捗を確認してください", chip: null });
    }
    if (firstN3) {
      tlEntries.push({ sort: firstN3.getTime(), dot: "n3", line: "solid", date: fmt(firstN3), label: "JLPT N3 受験（最短）", note: "合否発表と申請準備期間を考慮した最短の有効受験機会です", chip: "n3" });
    } else {
      tlEntries.push({ sort: addM(t, needN3M).getTime(), dot: "n3", line: "dash", date: "—", label: "N3有効受験機会なし", note: "合否発表と申請準備期間を考慮すると、特例ルートの確認が必要です", chip: null });
    }
  } else {
    tlEntries.push({ sort: t.getTime() + 1, dot: "n3", line: "solid", date: "取得済み", label: "N3要件クリア", note: "在留資格申請時に合格証書のコピーが必要です", chip: "n3" });
  }

  if (examsBefore.length > 0) {
    const firstExam = examsBefore[0];
    const secondExam = examsBefore[1] || null;
    tlEntries.push({ sort: firstExam.getTime(), dot: "exam", line: "solid", date: fmt(firstExam), label: "技能試験 第1回受験（推定）", note: "4分野（接客全般・店舗運営・食の安全衛生・食品表示）の学習を今すぐ開始してください。受験回数は年4回開催想定の推定値です。", chip: "exam" });
    if (secondExam) tlEntries.push({ sort: secondExam.getTime(), dot: "exam", line: "solid", date: fmt(secondExam), label: "技能試験 第2回（不合格時の再受験）", note: "80%以上取得の場合は特例ルート申請の候補になります", chip: "exam" });
  }

  const expCompleteDate = addM(exp, 24);
  if (expSoFar >= 24) {
    tlEntries.push({ sort: t.getTime() + 3, dot: "exp", line: "solid", date: "現時点", label: "実務経験2年 要件クリア済み", note: "辞令日・役割・業務記録を申請時に説明できる形で保管してください", chip: "exp" });
  } else if (expOk) {
    tlEntries.push({ sort: expCompleteDate.getTime(), dot: "exp", line: "solid", date: fmt(expCompleteDate), label: "実務経験2年 達成見込み", note: "副店長・サブリーダー等の辞令と業務記録を継続してください", chip: "exp" });
  } else {
    tlEntries.push({ sort: expCompleteDate.getTime(), dot: "exp", line: "dash", date: fmt(expCompleteDate), label: "実務経験2年（在留期限を超過）", note: "辞令発行日と役割記録の整備が急務です", chip: "exp" });
  }

  if (d >= 1 || c >= 2) {
    tlEntries.push({ sort: t.getTime() + 2, dot: "route", line: "solid", date: "要件確認次第", label: "80%特例ルートの検討", note: "技能試験80%以上かつN3取得後、最長1年の在留延長申請が可能（2025年10月17日以降は両方必須）", chip: "route" });
  }

  tlEntries.push({ sort: coe.getTime(), dot: "goal", line: "dash", date: fmt(coe), label: "在留期限日", note: "この日までに在留資格変更申請の完了が必要です", chip: "goal" });

  tlEntries.sort((a, b) => (a.sort ?? 0) - (b.sort ?? 0));
  const needsSpecialRoute = (d >= 1 || c >= 2);

  const DEFAULT_RECRUIT = 800000;
  const DEFAULT_MONTHLY = 250000;
  const recruitCost = recruitInput ?? DEFAULT_RECRUIT;
  const monthlyCost = monthlyInput ?? DEFAULT_MONTHLY;
  const totalInvest = recruitCost + (monthlyCost * expSoFar);
  const roiFormatted = totalInvest.toLocaleString();
  const isDefault = !recruitInput && !monthlyInput;
  const costNote = isDefault
    ? `概算値使用（採用費 ${DEFAULT_RECRUIT.toLocaleString()}円 ＋ 月次 ${DEFAULT_MONTHLY.toLocaleString()}円 × ${expSoFar}ヶ月）`
    : `入力値使用（採用費 ${recruitCost.toLocaleString()}円 ＋ 月次 ${monthlyCost.toLocaleString()}円 × ${expSoFar}ヶ月）`;

  const actions: string[] = [];
  if (!expOk) actions.push("辞令を今すぐ発行：副店長・サブリーダー等の役職を辞令で記録する（実務経験のカウント開始）");
  if (!n3ok) actions.push("日本語能力の現在地を確認：PreCheckでN3〜N4相当の日本語能力保持状況を概算し、必要に応じてDEPS等で不足量と学習計画を精査する");
  if (!n3ok && firstN3) actions.push("JLPT N3の受験準備：" + fmt(firstN3) + "の受験に向けて本人が申込む。会社は必要に応じて受験費用補助・受験日程・結果提出を確認する");
  if (examCount > 0) actions.push("技能試験の学習開始：4分野テキストの読み込みを開始し、受験時は企業マイページからの申込手順を別途確認する");
  if (needsSpecialRoute) actions.push("80%特例ルートを並走確認：技能試験80%以上＋N3取得で最長1年延長申請の対象になり得るかを専門家と確認する");

  const chipMap: Record<string, string> = { n3: "N3", exam: "技能試験", exp: "実務経験", goal: "在留期限", route: "特例ルート" };
  const teHtml = (dot: string, line: string, date: string, label: string, note: string, chip: string | null) => {
    const ch = chip ? `<span class="chip chip-${chip}">${chipMap[chip] || chip}</span>` : "";
    return `<div class="te"><div class="tel"><div class="tedot dot-${dot}"></div><div class="teline line-${line}"></div></div><div class="tebody"><div class="tedate">${date}</div><div class="telabel">${label}${ch}</div>${note ? `<div class="tenote">${note}</div>` : ""}</div></div>`;
  };

  let html = `<div class="rh ${vc}">
    <div class="rtag">特定技能2号移行診断 — ${JP_LABEL[jp]}</div>
    <div class="rv"><div class="rvi">${icon}</div><div class="rvl">${vl}</div></div>
    <div class="rvs">${vs}</div>
    <div class="result-meta">対象人材：${escHtml(personLabel)} ／ 診断日：${fmt(t)} ／ 在留期限：${fmt(coe)}</div>
  </div>`;

  html += `<div class="layer">
    <div class="lhead"><div class="lnum">01</div><div class="ltitle">現在地と残り期間</div></div>
    <div class="mrow">
      <div class="met"><div class="mlb">在留期限まで</div><div class="mv ${mCoe < 6 ? "d" : mCoe < 12 ? "c" : "o"}">${Math.max(0, mCoe)}<span class="mu">ヶ月</span></div></div>
      <div class="met"><div class="mlb">N3有効機会</div><div class="mv ${firstN3 ? "o" : "d"}">${firstN3 ? 1 : 0}<span class="mu">回</span></div></div>
      <div class="met"><div class="mlb">実務経験</div><div class="mv ${expSoFar < 6 ? "d" : expSoFar < 18 ? "c" : "o"}">${expSoFar}<span class="mu">ヶ月</span></div></div>
    </div>
    <div class="basis-note">判定色の目安：在留期限まで6ヶ月未満は赤、12ヶ月未満は黄、12ヶ月以上は緑を基本表示しています。N3有効機会は、JLPT受験日だけでなく合否発表と申請準備期間を考慮した概算です。実際の判断では技能試験機会・管理者実務経験の不足月数も合わせて確認してください。</div>
  </div>`;

  html += `<div class="layer">
    <div class="lhead"><div class="lnum">02</div><div class="ltitle">3要件のチェック</div></div>
    <div class="ilist">${issues.map((i) => `<div class="ii ${i.l}"><div class="idot"></div><div>${i.t}</div></div>`).join("")}</div>
  </div>`;

  html += `<div class="layer">
    <div class="lhead"><div class="lnum">03</div><div class="ltitle">移行タイムライン（試験スケジュール照合）</div></div>
    <div class="tl">${tlEntries.map((e) => teHtml(e.dot, e.line, e.date, e.label, e.note, e.chip)).join("")}</div>
  </div>`;

  let roiLayerNo = "04";
  if (needsSpecialRoute) {
    html += `<div class="layer">
      <div class="lhead"><div class="lnum">04</div><div class="ltitle">80%特例ルートの確認</div></div>
      <div class="route-detail">
        <div class="route-detail-title">通常ルートが厳しい場合の確認事項</div>
        <div class="route-steps">
          <div class="route-step"><span class="route-step-num">1</span><span>技能試験で合格基準点の8割以上を取得できる可能性を確認する。</span></div>
          <div class="route-step"><span class="route-step-num">2</span><span>日本語能力N3以上の取得状況、または最短取得見込みを確認する。</span></div>
          <div class="route-step"><span class="route-step-num">3</span><span>在留期限内に通常ルートが難しい場合、最長1年の在留延長措置の対象になり得るかを専門家と確認する。</span></div>
        </div>
        <div class="route-detail-note">注：この診断は制度確認の入口です。実際の申請可否は、最新の制度要件・在留状況・雇用契約・実務経験証跡をもとに個別確認してください。</div>
      </div>
    </div>`;
    roiLayerNo = "05";
  }

  html += `<div class="layer">
    <div class="lhead"><div class="lnum">${roiLayerNo}</div><div class="ltitle">投資対効果の可視化</div></div>
    <div class="roi-grid">
      <div class="roi-card">
        <div class="roi-label">これまでの投資推計</div>
        <div class="roi-value">約 ${roiFormatted}円</div>
        <div class="roi-sub">${costNote}</div>
      </div>
      <div class="roi-card">
        <div class="roi-label">2号移行失敗時のリスク</div>
        <div class="roi-value">回収困難リスク</div>
        <div class="roi-sub">採用・育成コストの回収が難しくなり、再採用・引き継ぎコストが追加発生</div>
      </div>
      <div class="roi-card">
        <div class="roi-label">技能試験 受験機会</div>
        <div class="roi-value ${examCount === 0 ? "d" : examCount <= 1 ? "c" : "o"}" style="color:inherit">${examCount}<span style="font-size:13px;font-weight:400"> 回</span></div>
        <div class="roi-sub">年4回開催と仮定した推定値。実際の日程は最新の試験スケジュールで要確認</div>
      </div>
      <div class="roi-card">
        <div class="roi-label">管理者実務経験</div>
        <div class="roi-value">${expSoFar}ヶ月 / 24ヶ月</div>
        <div class="roi-sub">${expSoFar >= 24 ? "現時点で要件クリア済み" : (expOk ? "在留期限時点で要件達成見込み" : "あと" + expShort + "ヶ月不足")}</div>
      </div>
    </div>
  </div>`;

  html += `<div class="acts">
    <div class="alb">今すぐ取るべきアクション</div>
    ${actions.map((a, i) => `<div class="act"><span class="act-num">${i + 1}</span><span>${a}</span></div>`).join("")}
  </div>
  <div class="share-tools">
    <button type="button" class="tool-btn primary" data-action="copy">診断結果をコピー</button>
    <button type="button" class="tool-btn" data-action="print">印刷 / PDF保存</button>
  </div>
  <div class="cta-section">
    <div class="cta-label">次のステップ：2つの診断で投資判断を確定させる</div>
    <div class="cta-sub">この診断は「間に合うか」の時間軸を示しています。「誰に投資すべきか」の判断にはさらに2つの診断が必要です。</div>
    <div class="cta-grid">
      <div class="cta-card cta-primary">
        <div class="cta-card-icon">📊</div>
        <div class="cta-card-title">PreCheck<br>日本語能力診断</div>
        <div class="cta-card-body">短時間で日本語能力の初期現在地を確認。2号移行に向けた精査が必要な人材を早期に切り分けます。</div>
        <button type="button" class="cta-btn cta-btn-primary" data-action="precheck">日本語能力を診断する →</button>
      </div>
      <div class="cta-card cta-secondary">
        <div class="cta-card-icon">🎯</div>
        <div class="cta-card-title">インテグリティ診断<br>投資可否の判断</div>
        <div class="cta-card-body">現場動画シナリオへの「判断＋理由」で管理職素養を測定。この人材に投資継続すべきかをスコアで判断。</div>
        <a class="cta-btn cta-btn-primary" href="https://tokutei-integrity-01.lovable.app/" target="_blank" rel="noopener noreferrer">インテグリティ診断 →</a>
      </div>
    </div>
  </div>`;

  return html;
}

function Index() {
  const [personName, setPersonName] = useState("");
  const [coeDate, setCoeDate] = useState("");
  const [jpLv, setJpLv] = useState("");
  const [expStart, setExpStart] = useState("");
  const [recruitInput, setRecruitInput] = useState("");
  const [monthlyInput, setMonthlyInput] = useState("");
  const [resultHtml, setResultHtml] = useState<string | null>(null);
  const resultRef = useRef<HTMLDivElement>(null);

  // jp level tag
  let jpTag: React.ReactNode = null;
  if (jpLv) {
    const needM = JP_TO_N3[jpLv] || 0;
    if (needM === 0) jpTag = <span className="info-tag info-tag-gr">✓ N3要件クリア済み</span>;
    else if (needM <= 6) jpTag = <span className="info-tag info-tag-or">△ N3まで推定{needM}ヶ月の学習が必要</span>;
    else jpTag = <span className="info-tag info-tag-rd">✕ N3まで推定{needM}ヶ月以上の学習が必要</span>;
  }

  // cost preview
  let costPreview = "";
  let costHasValue = false;
  const r = parseInt(recruitInput) || null;
  const m = parseInt(monthlyInput) || null;
  if (r || m) {
    const rc = r || 800000; const mc = m || 250000;
    if (expStart) {
      const t = new Date(); t.setHours(0, 0, 0, 0);
      const exp = new Date(expStart);
      const mos = Math.max(0, (t.getFullYear() - exp.getFullYear()) * 12 + (t.getMonth() - exp.getMonth()));
      const total = rc + (mc * mos);
      costPreview = "現時点の投資推計：約 " + total.toLocaleString() + "円（採用費 " + rc.toLocaleString() + "円 ＋ " + mc.toLocaleString() + "円/月 × " + mos + "ヶ月）";
      costHasValue = true;
    } else {
      costPreview = "実務経験開始日を入力すると推計が表示されます";
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!coeDate || !jpLv || !expStart) { alert("3項目すべて入力してください"); return; }
    const html = buildResultHtml({
      personName, coeV: coeDate, jp: jpLv, expV: expStart,
      recruitInput: parseInt(recruitInput) || null,
      monthlyInput: parseInt(monthlyInput) || null,
    });
    setResultHtml(html);
    setTimeout(() => resultRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 0);
  };

  const doReset = () => {
    setPersonName(""); setCoeDate(""); setJpLv(""); setExpStart("");
    setRecruitInput(""); setMonthlyInput(""); setResultHtml(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // result action handlers (event delegation since result is innerHTML)
  useEffect(() => {
    if (!resultHtml || !resultRef.current) return;
    const el = resultRef.current;
    const onClick = (ev: MouseEvent) => {
      const target = (ev.target as HTMLElement).closest("[data-action]") as HTMLElement | null;
      if (!target) return;
      const action = target.dataset.action;
      if (action === "copy") {
        const text = (el.innerText || "").trim() + "\n\nPowered by J.TEST VIETNAM ー 特定技能 外食業 法人向け無料診断";
        if (navigator.clipboard?.writeText) {
          navigator.clipboard.writeText(text).then(() => alert("診断結果をコピーしました"));
        } else {
          const ta = document.createElement("textarea");
          ta.value = text; document.body.appendChild(ta); ta.select(); document.execCommand("copy"); document.body.removeChild(ta);
          alert("診断結果をコピーしました");
        }
      } else if (action === "print") {
        window.print();
      } else if (action === "precheck") {
        window.location.href = "https://precheck-de-01.lovable.app/";
      }
    };
    el.addEventListener("click", onClick);
    return () => el.removeEventListener("click", onClick);
  }, [resultHtml]);

  return (
    <div className="tg-app">
      <div className="hero">
        <div className="hero-eyebrow">特定技能2号移行ナビ — 無料診断ツール</div>
        <div className="hero-pill">🏢 外食業 法人向け</div>
        <h1 className="hero-title">特定技能1号人材は<br />在留期限内に2号へ<br />間に合いますか？</h1>
        <div className="hero-sub">在留期限・日本語証明・管理者実務経験の開始日を入力するだけで、N3取得と技能試験の試験スケジュールと照合し、2号移行の実現可能性を即時診断します。</div>
        <div className="ctx">
          <div className="ctx-row"><div className="ctx-dot"></div><div>コロナ禍以降に入国した特定技能1号の在留期限が2025〜2026年に集中到来</div></div>
          <div className="ctx-row"><div className="ctx-dot"></div><div>継続雇用には1号→2号移行の検討が必要。N3取得・技能試験・実務経験の3つが同時進行で必要</div></div>
          <div className="ctx-row"><div className="ctx-dot"></div><div>誰が・いつ・何をすべきかのタイムライン管理を誰もしていないのが現状</div></div>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="wrap">
          <div className="fc">
            <div className="fsl">人材情報を入力（1名分）</div>

            <div className="fi">
              <label>氏名または社員番号（任意）</label>
              <div className="fh">診断結果を社内共有・印刷する際の識別用です。空欄でも診断できます。</div>
              <input type="text" value={personName} onChange={(e) => setPersonName(e.target.value)} placeholder="例：EMP001 / Nguyen Van A" />
            </div>

            <div className="fi">
              <label>① 在留期限の満了日</label>
              <div className="fh">在留カードに記載されている期限日を入力してください</div>
              <input type="date" value={coeDate} onChange={(e) => setCoeDate(e.target.value)} required />
            </div>

            <div className="fi">
              <label>② 現在の日本語レベル</label>
              <div className="fh">直近のJ.TEST Band または JLPT 取得状況を選択してください</div>
              <div className="sw">
                <select value={jpLv} onChange={(e) => setJpLv(e.target.value)} required>
                  <option value="">選択してください</option>
                  <optgroup label="J.TEST（推奨：随時確認可能）">
                    <option value="jtest_b">J.TEST A〜Bレベル（N2〜N1相当）</option>
                    <option value="jtest_c">J.TEST B〜Cレベル（N3〜N2相当）</option>
                    <option value="jtest_cd">J.TEST C〜Dレベル（N3〜N4相当）★N3境界</option>
                    <option value="jtest_d">J.TEST D〜Eレベル（N4〜N5相当）</option>
                    <option value="jtest_ef">J.TEST E〜Fレベル（N5以下）</option>
                  </optgroup>
                  <optgroup label="JLPT（取得証明書がある場合）">
                    <option value="n3">JLPT N3以上 取得済み</option>
                    <option value="n4">JLPT N4 取得済み</option>
                    <option value="n5">JLPT N5 / 未受験</option>
                  </optgroup>
                </select>
              </div>
              <div style={{ marginTop: ".4rem" }}>{jpTag}</div>
            </div>

            <div className="fi" style={{ marginBottom: 0 }}>
              <label>③ 管理者相当の実務経験 開始日</label>
              <div className="fh">副店長・サブリーダー等の辞令を発行した日。未発行の場合は今日の日付を入力してください（要件：通算2年以上）</div>
              <input type="date" value={expStart} onChange={(e) => setExpStart(e.target.value)} required />
            </div>
          </div>

          <div className="cost-optional-card">
            <div className="cost-header">
              <span className="cost-title">投資コスト</span>
              <span className="cost-optional-badge">任意・空欄OK</span>
            </div>
            <div className="cost-hint">入力すると投資推計が<span className="cost-hint-em">実態に近い数値</span>になります。空欄のままでも診断できます（業界概算値を使用）。</div>
            <div className="cost-inputs">
              <div className="cost-field">
                <label className="cost-label">採用費用（円）</label>
                <div className="cost-field-hint">送り出し機関・紹介費・ビザ申請費の合計</div>
                <input type="number" value={recruitInput} onChange={(e) => setRecruitInput(e.target.value)} placeholder="例：800,000" min={0} className="cost-input" />
              </div>
              <div className="cost-field">
                <label className="cost-label">月次コスト（円/月）</label>
                <div className="cost-field-hint">給与・社会保険・支援費等の月額合計</div>
                <input type="number" value={monthlyInput} onChange={(e) => setMonthlyInput(e.target.value)} placeholder="例：250,000" min={0} className="cost-input" />
              </div>
            </div>
            <div className={"cost-preview" + (costHasValue ? " has-value" : "")}>{costPreview}</div>
          </div>

          <button type="submit" className="sbtn">2号移行の可能性を診断する</button>
        </div>
      </form>

      <div ref={resultRef} className={"rcard" + (resultHtml ? " on" : "")} dangerouslySetInnerHTML={resultHtml ? { __html: resultHtml } : undefined} />
      <div className="rbtn-wrap">
        {resultHtml && <button className="rbtn" onClick={doReset}>別の人材を診断する</button>}
      </div>
      <div className="pw">Powered by J.TEST VIETNAM ー 特定技能 外食業 法人向け無料診断</div>
    </div>
  );
}