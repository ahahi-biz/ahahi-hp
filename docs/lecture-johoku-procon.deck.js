const pptxgen = require("pptxgenjs");

const NAVY = "1E2761";
const ICE = "CADCFC";
const WHITE = "FFFFFF";
const GOLD = "C08A2E";
const INK = "222222";
const GRAY = "666666";
const SOFT = "F2F5FB";

const F = "Meiryo";

const pres = new pptxgen();
pres.layout = "LAYOUT_WIDE"; // 13.333 x 7.5
pres.author = "畠中竜吾";
pres.title = "新人プロコン顧客開拓へのアドバイス";

const W = 13.333;
const M = 0.7;
const CW = W - M * 2;

function dark(slide) {
  slide.background = { color: NAVY };
}

// ---------- helpers ----------
function titleSlide() {
  const s = pres.addSlide();
  dark(s);
  s.addShape(pres.ShapeType.ellipse, { x: 11.3, y: 0.7, w: 1.3, h: 1.3, fill: { color: "2C3C7E" }, line: { color: "2C3C7E" } });
  s.addText("城北プロコン塾", { x: M, y: 1.5, w: CW, h: 0.4, fontFace: F, fontSize: 16, color: ICE, isTextBox: true, margin: 0, charSpacing: 2 });
  s.addText("新人プロコン\n顧客開拓へのアドバイス", { x: M, y: 2.1, w: CW, h: 2.0, fontFace: F, fontSize: 44, bold: true, color: WHITE, lineSpacing: 54, isTextBox: true, margin: 0 });
  s.addText("2026年9月19日（土）13:00-16:00", { x: M, y: 4.5, w: CW, h: 0.4, fontFace: F, fontSize: 16, color: ICE, isTextBox: true, margin: 0 });
  s.addText("畠中 竜吾　株式会社あはひ 代表取締役／中小企業診断士（プロコン塾11期生）", { x: M, y: 5.1, w: CW, h: 0.4, fontFace: F, fontSize: 15, color: WHITE, isTextBox: true, margin: 0 });
  return s;
}

function sectionSlide(num, title, sub) {
  const s = pres.addSlide();
  dark(s);
  s.addShape(pres.ShapeType.ellipse, { x: M, y: 2.5, w: 1.1, h: 1.1, fill: { color: GOLD }, line: { color: GOLD } });
  s.addText(String(num), { x: M, y: 2.5, w: 1.1, h: 1.1, fontFace: F, fontSize: 34, bold: true, color: WHITE, align: "center", valign: "middle", isTextBox: true, margin: 0 });
  s.addText(title, { x: M + 1.5, y: 2.45, w: CW - 1.5, h: 1.0, fontFace: F, fontSize: 34, bold: true, color: WHITE, valign: "middle", isTextBox: true, margin: 0, fit: "shrink" });
  if (sub) {
    s.addText(sub, { x: M + 1.5, y: 3.55, w: CW - 1.5, h: 0.8, fontFace: F, fontSize: 16, color: ICE, isTextBox: true, margin: 0, fit: "shrink" });
  }
  return s;
}

function statement(main, sub, note) {
  const s = pres.addSlide();
  dark(s);
  s.addText(main, { x: M, y: 2.3, w: CW, h: 2.0, fontFace: F, fontSize: 40, bold: true, color: WHITE, align: "center", valign: "middle", isTextBox: true, margin: 0, lineSpacing: 52, fit: "shrink" });
  if (sub) s.addText(sub, { x: M, y: 4.4, w: CW, h: 0.7, fontFace: F, fontSize: 18, color: ICE, align: "center", isTextBox: true, margin: 0, fit: "shrink" });
  if (note) s.addText(note, { x: M, y: 5.2, w: CW, h: 0.6, fontFace: F, fontSize: 14, color: ICE, align: "center", isTextBox: true, margin: 0, fit: "shrink" });
  return s;
}

function content(title, kicker) {
  const s = pres.addSlide();
  s.background = { color: WHITE };
  if (kicker) {
    s.addText(kicker, { x: M, y: 0.45, w: CW, h: 0.35, fontFace: F, fontSize: 13, color: GOLD, bold: true, isTextBox: true, margin: 0, charSpacing: 1 });
    s.addText(title, { x: M, y: 0.85, w: CW, h: 0.75, fontFace: F, fontSize: 30, bold: true, color: NAVY, isTextBox: true, margin: 0, fit: "shrink" });
  } else {
    s.addText(title, { x: M, y: 0.6, w: CW, h: 0.9, fontFace: F, fontSize: 32, bold: true, color: NAVY, isTextBox: true, margin: 0, fit: "shrink" });
  }
  return s;
}

// numbered rows: [{h: header, d: desc}]
function rows(s, items, opts) {
  const o = opts || {};
  const top = o.y || 1.85;
  const gap = o.gap || (items.length > 5 ? 0.82 : 1.0);
  const x = o.x || M;
  const w = o.w || CW;
  const numbered = o.numbered !== false;
  items.forEach((it, i) => {
    const y = top + gap * i;
    if (numbered) {
      s.addShape(pres.ShapeType.ellipse, { x: x, y: y, w: 0.5, h: 0.5, fill: { color: NAVY }, line: { color: NAVY } });
      s.addText(String(i + 1), { x: x, y: y, w: 0.5, h: 0.5, fontFace: F, fontSize: 16, bold: true, color: WHITE, align: "center", valign: "middle", isTextBox: true, margin: 0 });
    } else {
      s.addShape(pres.ShapeType.ellipse, { x: x + 0.12, y: y + 0.15, w: 0.2, h: 0.2, fill: { color: GOLD }, line: { color: GOLD } });
    }
    s.addText(it.h, { x: x + 0.75, y: y - 0.03, w: w - 0.85, h: 0.4, fontFace: F, fontSize: o.hs || 18, bold: true, color: INK, isTextBox: true, margin: 0, fit: "shrink" });
    if (it.d) {
      s.addText(it.d, { x: x + 0.75, y: y + 0.36, w: w - 0.85, h: gap - 0.42, fontFace: F, fontSize: o.ds || 14, color: GRAY, isTextBox: true, margin: 0, lineSpacing: 19, fit: "shrink" });
    }
  });
}

// cards in a row: [{t, b}]
function cards(s, items, opts) {
  const o = opts || {};
  const y = o.y || 2.0;
  const h = o.h || 3.2;
  const n = items.length;
  const gap = 0.3;
  const w = (CW - gap * (n - 1)) / n;
  items.forEach((it, i) => {
    const x = M + (w + gap) * i;
    s.addShape(pres.ShapeType.roundRect, { x: x, y: y, w: w, h: h, rectRadius: 0.08, fill: { color: o.fill || SOFT }, line: { color: o.fill || SOFT } });
    s.addText(it.t, { x: x + 0.28, y: y + 0.28, w: w - 0.56, h: 0.7, fontFace: F, fontSize: o.ts || 18, bold: true, color: NAVY, isTextBox: true, margin: 0, fit: "shrink" });
    s.addText(it.b, { x: x + 0.28, y: y + 1.0, w: w - 0.56, h: h - 1.3, fontFace: F, fontSize: o.bs || 13, color: INK, isTextBox: true, margin: 0, lineSpacing: 19, fit: "shrink" });
  });
}

function note(s, text) {
  s.addText(text, { x: M, y: 6.35, w: CW, h: 0.6, fontFace: F, fontSize: 15, bold: true, color: GOLD, isTextBox: true, margin: 0, fit: "shrink" });
}

// =========================================================
// 1. タイトル
// =========================================================
titleSlide().addNotes("自己紹介は簡潔に。YouTubeを見てもらっている前提。");

// 2
statement("3年前、私は\n皆さんと同じ席に座っていました", "プロコン塾11期生。卒塾後の2024年9月1日に独立しました。")
  .addNotes("ここで受講生との距離を一気に縮める。");

// 3 自己紹介
{
  const s = content("自己紹介", "はじめに");
  rows(s, [
    { h: "1976年生まれ・50歳", d: "リコージャパンにほぼ25年。48歳で独立" },
    { h: "中小企業診断士は2009年2月取得", d: "その後ずっと資格を寝かせてきた" },
    { h: "プロコン塾11期生 → 2024年9月1日に独立", d: "卒塾後に独立。この講義を聞いて感化された側" },
    { h: "株式会社あはひ 代表取締役", d: "神田淡路町でカフェBARを運営。会員126名・うち診断士85名（2026年7月末）" },
  ], { y: 1.9, gap: 1.05 });
  s.addNotes("YouTube視聴済み前提なので2分程度で。");
}

// 3.5 期待を裏切る
{
  const s = content("今日、皆さんの期待を1つだけ裏切ります", "はじめに");
  cards(s, [
    { t: "期待していること", b: "「顧客開拓のやり方を聞きに来た」\n\n新規のお客さまをどうやって見つけて、どう営業して、どう契約に持っていくのか。" },
    { t: "私がお話しすること", b: "私は、開拓していません。\n\nこの2年で受けた仕事26件のうち、こちらから売り込んで取ったものはゼロです。" },
  ], { y: 2.1, h: 2.9 });
  s.addText("では、どうやって26件が来たのか。それが今日の3時間です。", { x: M, y: 5.3, w: CW, h: 0.7, fontFace: F, fontSize: 22, bold: true, color: NAVY, isTextBox: true, margin: 0, fit: "shrink" });
  s.addNotes("ズレを先に自分から言う。ズレがつかみに変わる。");
}

// 4 今日お見せするもの
{
  const s = content("今日は、数字も名前も全部お見せします", "この3時間で");
  cards(s, [
    { t: "① 私の売上", b: "独立1年目・2年目の月次売上を、そのままお見せします。\n\n最初の3か月がいくらだったかも隠しません。" },
    { t: "② 26件の入口", b: "この2年で受けた仕事26件が、どこから来たのかを全部並べます。\n\n売り込んで取った仕事はゼロです。" },
    { t: "③ 再現の5ステップ", b: "私がやったことを、誰でも辿れる順番にしました。\n\n最後は自分の設計図を1枚書いて帰っていただきます。" },
  ], { y: 2.1, h: 3.4 });
  s.addNotes("持ち帰るものを先に宣言する。");
}

// =========================================================
// 第1部
// =========================================================
sectionSlide(1, "塾生だったころの私", "13:10-13:26／18分　当時、私がいちばん聞きたかったこと");

{
  const s = content("なぜプロコン塾に入ったのか", "第1部");
  rows(s, [
    { h: "前年に城北支部に入会し、青年部に入会した", d: "" },
    { h: "複数の方に「診断士を学びたいならプロコン塾はお薦めだよ」と言われた", d: "" },
    { h: "目的は「何が学べるのだろう？」という自己啓発だった", d: "月1回通って、診断士を学び直すこと" },
    { h: "2009年2月に取得したあと、資格を寝かせてきた", d: "もう一度、診断士を学ぼうと思ったのがきっかけ" },
  ], { y: 1.9, gap: 1.05 });
}

{
  const s = content("初回、梁川さんの講義に度肝を抜かれた", "第1部");
  cards(s, [
    { t: "私が思っていたコンサル", b: "課題を整理し、導き、売上を上げ、事業をつくる。\n\n新規事業やスタートアップの創出支援が本業だったので、そういうものだと思い込んでいた。" },
    { t: "そこにあったもの", b: "つぶれそうな企業にメスを入れ、捨てるものを捨てながら、どうにか生かし、回復させていく。\n\n想いだけでなく、ノウハウとスキルに感動した。" },
  ], { y: 2.1, h: 3.2 });
  note(s, "その場で同行訪問を申し込んだ。学びが多かった。");
}

{
  const s = content("いちばん大きかったのは、出会いだった", "第1部");
  rows(s, [
    { h: "梁川さんとの出会いは、いまも続いている", d: "卒塾後も気にかけていただき、情報交換やアドバイスをいただいている" },
    { h: "回を重ねるごとに、同期との仲が深まった", d: "いまではかけがえのない仲間" },
    { h: "この場で得た出会いが、その後いちばん大きかった", d: "そして後で分かるのですが、この出会いこそが最初の信用残高でした" },
  ], { y: 2.1, gap: 1.2 });
}

{
  const s = content("当時、私がいちばん聞きたかったこと", "第1部");
  rows(s, [
    { h: "プロコンって、いくら稼げるの？", d: "" },
    { h: "どうやって、その稼ぎをつくったの？", d: "" },
    { h: "その稼ぎをつくるのに、必要なリソースは？", d: "" },
    { h: "リソースを分解すると、人脈・能力・きっかけ", d: "この3つに分けて整理してみました" },
  ], { y: 2.0, gap: 1.1, hs: 20 });
  note(s, "今日は、この4つに私の実データで答えます。");
}

// =========================================================
// 第2部
// =========================================================
sectionSlide(2, "まだ何者でもなかった4人が、\nどうやっていまの地位に立ったか", "13:26-13:46／20分　先輩プロコン4人を分解する");

function teacherSlide(name, income, origin, howList, nowText) {
  const s = content(name, "第2部");
  s.addShape(pres.ShapeType.roundRect, { x: M, y: 1.75, w: 3.6, h: 1.1, rectRadius: 0.08, fill: { color: NAVY }, line: { color: NAVY } });
  s.addText(income, { x: M + 0.2, y: 1.75, w: 3.2, h: 1.1, fontFace: F, fontSize: 20, bold: true, color: WHITE, valign: "middle", isTextBox: true, margin: 0, fit: "shrink" });
  s.addText("出発点", { x: M + 4.0, y: 1.8, w: CW - 4.0, h: 0.3, fontFace: F, fontSize: 13, bold: true, color: GOLD, isTextBox: true, margin: 0 });
  s.addText(origin, { x: M + 4.0, y: 2.12, w: CW - 4.0, h: 0.8, fontFace: F, fontSize: 15, color: INK, isTextBox: true, margin: 0, lineSpacing: 20, fit: "shrink" });
  s.addText("何をして実績を積んだか", { x: M, y: 3.1, w: CW, h: 0.3, fontFace: F, fontSize: 13, bold: true, color: GOLD, isTextBox: true, margin: 0 });
  rows(s, howList, { y: 3.5, gap: 0.72, numbered: false, hs: 16, ds: 13 });
  s.addShape(pres.ShapeType.roundRect, { x: M, y: 6.1, w: CW, h: 0.85, rectRadius: 0.08, fill: { color: SOFT }, line: { color: SOFT } });
  s.addText(nowText, { x: M + 0.25, y: 6.1, w: CW - 0.5, h: 0.85, fontFace: F, fontSize: 15, bold: true, color: NAVY, valign: "middle", isTextBox: true, margin: 0, fit: "shrink" });
  return s;
}

teacherSlide(
  "塚越さん",
  "推定 3000万円以上",
  "中小企業向け大手コンサル会社の事業部長",
  [
    { h: "会社員時代に、副業で同じことをしてクライアントを増やした" },
    { h: "リソースが足りなくなった" },
    { h: "再現性があるので、時間さえ作れば顧問先を増やせる状態になって独立" },
  ],
  "いま：金融機関などからの紹介でコンサルし、その何割かが顧問になるエコシステム"
);

teacherSlide(
  "梁川さん",
  "推定 2000万円以上",
  "資格取得後すぐ独立。数年はうまくいかず苦労した（独立当初の年収は50万円）",
  [
    { h: "2〜3年かけて実績を積んだ" },
    { h: "その中で、赤字の製造業の黒字化支援が強みになった" },
    { h: "過程で自信がつき、事業者を叱れる存在という稀有な診断士になった" },
  ],
  "いま：貸し手である金融機関からの信頼 → 紹介のエコシステム"
);

teacherSlide(
  "鵜頭さん",
  "推定 1500万円以上",
  "自治体に勤務。自治体の作法に詳しい",
  [
    { h: "商店街支援で実績を積んだ" },
    { h: "診断士のチームを束ねて複数の自治体を支援する仕組みに育てた" },
    { h: "予算組のノウハウ、実績の水平展開、新人に経験の場を与える仕組みまで確立" },
  ],
  "いま：商店街支援といえばこの人、という圧倒的な存在"
);

teacherSlide(
  "石川さん",
  "推定 年収不明",
  "独立初期に商工会のコーディネーターとなり、10年以上契約を更新",
  [
    { h: "最初は飲食もSNSマーケも、かじる程度だった" },
    { h: "商工会の支援スキームの中で、飲食という分野に実績を積んだ" },
    { h: "ワインや日本酒など周辺資格を取り、自らをブランディングした" },
  ],
  "いま：飲食といえば、お酒といえばこの人。情報が集まり続けるエコシステム"
);

{
  const s = content("4人に共通する「育ち方」", "第2部");
  rows(s, [
    { h: "最初は、与えられた場で数をこなす", d: "商工会、公的支援、副業。誰も最初から尖ってはいない" },
    { h: "2〜3年かけて、実績が溜まる", d: "" },
    { h: "その過程で、強みが後から立ち上がる", d: "梁川さんの赤字製造業、石川さんの飲食とお酒" },
    { h: "紹介元の信頼が、仕事の流れる仕組みになる", d: "金融機関・商工会・自治体から、自分で取りに行かなくても流れてくる" },
  ], { y: 1.95, gap: 1.1 });
}

statement("ブランディング（＝信用）と、\nエコシステム。", "4人の地位をつくったのは、この2つでした", "尖りが先ではない。実績 → 信用 → 仕組み、の順です");

// =========================================================
// 第3部
// =========================================================
sectionSlide(3, "「尖っていないとダメ」を疑う", "13:46-14:02／16分　成功の定義を先に決める");

{
  const s = content("必ず言われる、この教え", "第3部");
  cards(s, [
    { t: "「あなたは何ができるのですか？」", b: "" },
    { t: "「何でもできるは、何もできない」", b: "" },
    { t: "「尖っているものがないとダメだ」", b: "" },
  ], { y: 2.3, h: 1.5, ts: 19 });
  s.addText("いまでも言われますし、昔から言われ続けていると思います。", { x: M, y: 4.2, w: CW, h: 0.5, fontFace: F, fontSize: 17, color: INK, isTextBox: true, margin: 0 });
  note(s, "でも、私はここを疑いました。");
}

{
  const s = content("あの先生方も、最初から尖っていたのか？", "第3部");
  rows(s, [
    { h: "「〇〇のプロ」「〇〇といえば〇〇先生」は、いま成功している人の“現在地”を表す言葉", d: "" },
    { h: "成長し、成功を積み上げた「結果」として、〇〇が得意な先生になっている", d: "" },
    { h: "だから、成功している先生の「今」を見ても参考にならない", d: "「〇〇に強い〇〇先生」になるまでの過程を理解するほうが近道" },
  ], { y: 2.1, gap: 1.25, hs: 19 });
}

statement("梁川さんは、独立当初の年収は\n50万円だったと言っていました。", "いま推定2000万円。最初から尖っていた人はいません。");

{
  const s = content("私が考える「独立診断士としての成功」", "第3部");
  s.addText("成功の定義は人それぞれです。私の定義を先に置きます。これは優先順位でもあります。", { x: M, y: 1.75, w: CW, h: 0.4, fontFace: F, fontSize: 15, color: GRAY, isTextBox: true, margin: 0 });
  rows(s, [
    { h: "サラリーマンの時の年収を大きく越える", d: "私は「2倍」としました" },
    { h: "自分の人生を、自分でコントロールしている実感がある", d: "" },
    { h: "会社員時代にはできなかったことをする", d: "" },
    { h: "自分の型を見つけて、それをつくる", d: "" },
  ], { y: 2.35, gap: 0.95, hs: 19 });
  note(s, "④「自分は何ができるのか」を、私はいちばん最後にしました。");
}

{
  const s = content("なぜ④を最後にしたのか", "第3部");
  cards(s, [
    { t: "多くの人は④から行こうとする", b: "「自分の型を見つけてから独立しよう」「尖ってから始めよう」。\n\nこれは思い込みだと、私は思っています。" },
    { t: "過程をトレースするほうが近道", b: "独立して全員がうまくいくわけではありません。\n\nうまくいった人の「今」から成功要因を見出すのは難しい。成功するまでの過程を辿るほうが近道です。" },
  ], { y: 2.2, h: 3.0 });
}

// =========================================================
// 第4部
// =========================================================
sectionSlide(4, "私の売上を、全部お見せします", "14:12-14:30／18分　独立2年間の月次売上");

{
  const s = content("出発点：会社員時代の年収", "第4部");
  const box = (x, label, value, sub) => {
    s.addShape(pres.ShapeType.roundRect, { x: x, y: 2.2, w: 3.6, h: 2.4, rectRadius: 0.08, fill: { color: SOFT }, line: { color: SOFT } });
    s.addText(label, { x: x + 0.3, y: 2.45, w: 3.0, h: 0.4, fontFace: F, fontSize: 14, color: GRAY, isTextBox: true, margin: 0 });
    s.addText(value, { x: x + 0.3, y: 2.9, w: 3.0, h: 0.9, fontFace: F, fontSize: 36, bold: true, color: NAVY, isTextBox: true, margin: 0, fit: "shrink" });
    s.addText(sub, { x: x + 0.3, y: 3.85, w: 3.0, h: 0.55, fontFace: F, fontSize: 13, color: GRAY, isTextBox: true, margin: 0, fit: "shrink" });
  };
  box(M, "会社員時代の年収", "1,200万円", "リコージャパン");
  box(M + 4.05, "副業", "120万円", "会社員のかたわら");
  box(M + 8.1, "独立後の目標（2倍）", "2,400万円", "成功の定義①として設定");
  note(s, "この2,400万円を、独立の目標に置きました。");
}

{
  const s = content("独立1年目（2024年9月〜2025年8月）", "第4部");
  s.addChart(
    pres.ChartType.bar,
    [{ name: "月次売上（万円）", labels: ["9月", "10月", "11月", "12月", "1月", "2月", "3月", "4月", "5月", "6月", "7月", "8月"], values: [75, 80, 108, 134, 128, 203, 159, 147, 153, 222, 271, 201] }],
    {
      x: M, y: 1.75, w: CW, h: 3.9,
      barDir: "col",
      chartColors: [NAVY],
      showValue: true, dataLabelPosition: "outEnd", dataLabelFontSize: 11, dataLabelFontFace: F, dataLabelColor: INK,
      showLegend: false,
      catAxisLabelFontFace: F, catAxisLabelFontSize: 12, catAxisLabelColor: GRAY,
      valAxisLabelFontFace: F, valAxisLabelFontSize: 11, valAxisLabelColor: GRAY,
      valGridLine: { color: "E4E8F0", size: 1 },
      catGridLine: { style: "none" },
      valAxisMaxVal: 300,
    }
  );
  s.addText("（万円）", { x: M, y: 1.5, w: 1.5, h: 0.3, fontFace: F, fontSize: 12, color: GRAY, isTextBox: true, margin: 0 });
  s.addText("年間合計　18,804,829円　／　初月75万円 → 12か月目200万円", { x: M, y: 5.85, w: CW, h: 0.6, fontFace: F, fontSize: 20, bold: true, color: NAVY, isTextBox: true, margin: 0, fit: "shrink" });
  s.addText("これは売上です。ここから経費を引きます。", { x: M, y: 6.5, w: CW, h: 0.4, fontFace: F, fontSize: 13, color: GRAY, isTextBox: true, margin: 0 });
}

{
  const s = content("独立2年目（2025年9月〜2026年8月）", "第4部");
  s.addChart(
    pres.ChartType.bar,
    [{ name: "月次売上（万円）", labels: ["9月", "10月", "11月", "12月", "1月", "2月", "3月", "4月", "5月", "6月", "7月", "8月"], values: [214, 216, 226, 216, 226, 186, 177, 175, 215, 195, 235, 225] }],
    {
      x: M, y: 1.75, w: CW, h: 3.9,
      barDir: "col",
      chartColors: [GOLD],
      showValue: true, dataLabelPosition: "outEnd", dataLabelFontSize: 11, dataLabelFontFace: F, dataLabelColor: INK,
      showLegend: false,
      catAxisLabelFontFace: F, catAxisLabelFontSize: 12, catAxisLabelColor: GRAY,
      valAxisLabelFontFace: F, valAxisLabelFontSize: 11, valAxisLabelColor: GRAY,
      valGridLine: { color: "E4E8F0", size: 1 },
      catGridLine: { style: "none" },
      valAxisMaxVal: 300,
    }
  );
  s.addText("（万円）", { x: M, y: 1.5, w: 1.5, h: 0.3, fontFace: F, fontSize: 12, color: GRAY, isTextBox: true, margin: 0 });
  s.addText("年間合計　25,064,699円　／　月平均 約209万円で安定", { x: M, y: 5.85, w: CW, h: 0.6, fontFace: F, fontSize: 20, bold: true, color: NAVY, isTextBox: true, margin: 0, fit: "shrink" });
  s.addText("1月に計上された年間契約660万円は、実態に合わせて12か月に55万円ずつ均しています。", { x: M, y: 6.5, w: CW, h: 0.4, fontFace: F, fontSize: 13, color: GRAY, isTextBox: true, margin: 0, fit: "shrink" });
}

// 売上の構成
{
  const s = content("売上は、3つの柱でできています", "第4部");
  const segs = [
    { t: "民間の顧問契約", r: 2, c: NAVY, tc: WHITE },
    { t: "公的支援", r: 2, c: GOLD, tc: WHITE },
    { t: "民間プロジェクト", r: 1, c: ICE, tc: NAVY },
  ];
  const total = segs.reduce((a, b) => a + b.r, 0);
  let x = M;
  segs.forEach((sg) => {
    const w = (CW * sg.r) / total;
    s.addShape(pres.ShapeType.rect, { x: x, y: 2.2, w: w, h: 1.5, fill: { color: sg.c }, line: { color: WHITE, width: 2 } });
    s.addText(sg.t, { x: x + 0.15, y: 2.35, w: w - 0.3, h: 0.6, fontFace: F, fontSize: 17, bold: true, color: sg.tc, align: "center", isTextBox: true, margin: 0, fit: "shrink" });
    s.addText(String(sg.r), { x: x + 0.15, y: 2.95, w: w - 0.3, h: 0.6, fontFace: F, fontSize: 26, bold: true, color: sg.tc, align: "center", isTextBox: true, margin: 0 });
    x += w;
  });
  s.addText("民間の顧問契約 2　：　公的支援 2　：　民間プロジェクト 1", { x: M, y: 4.1, w: CW, h: 0.7, fontFace: F, fontSize: 24, bold: true, color: NAVY, align: "center", isTextBox: true, margin: 0, fit: "shrink" });
  rows(s, [
    { h: "ひとつの柱に依存していない", d: "どれかが止まっても、残りで生活が続く状態にしています" },
    { h: "公的支援は、民間契約の入口にもなる", d: "アンドドットのように、支援が終わってから顧問になる例があります" },
  ], { y: 4.95, gap: 0.85, hs: 17 });
  s.addNotes("単価・顧問料の具体的な金額は、ここで口頭で話す。");
}

{
  const s = content("見てほしいのは、最初の3か月です", "第4部");
  const box = (x, label, value) => {
    s.addShape(pres.ShapeType.roundRect, { x: x, y: 2.2, w: 3.6, h: 2.2, rectRadius: 0.08, fill: { color: SOFT }, line: { color: SOFT } });
    s.addText(label, { x: x + 0.3, y: 2.45, w: 3.0, h: 0.4, fontFace: F, fontSize: 14, color: GRAY, isTextBox: true, margin: 0 });
    s.addText(value, { x: x + 0.3, y: 2.95, w: 3.0, h: 1.0, fontFace: F, fontSize: 28, bold: true, color: NAVY, isTextBox: true, margin: 0, fit: "shrink" });
  };
  box(M, "2024年9月（独立1か月目）", "749,080円");
  box(M + 4.05, "2024年10月", "798,680円");
  box(M + 8.1, "2024年11月", "1,081,480円");
  s.addText("2年前の私は、ここにいました。皆さんと地続きの場所です。", { x: M, y: 4.8, w: CW, h: 0.6, fontFace: F, fontSize: 20, bold: true, color: NAVY, isTextBox: true, margin: 0, fit: "shrink" });
  note(s, "そこから何をしたのか。次で26件すべて並べます。");
}

// =========================================================
// 第5部
// =========================================================
sectionSlide(5, "26件、どこから来たのか", "14:30-14:58／28分　公的支援と民間、1件ずつ何をやったか。最後に共通点を探します");

{
  const s = content("2年間で受けた仕事26件の入口", "第5部");
  s.addChart(
    pres.ChartType.bar,
    [{ name: "件数", labels: ["登録しておいた先", "顧問先からの紹介", "過去の縁", "人からのお誘い", "逆営業", "個人的な縁"], values: [8, 7, 5, 3, 2, 1] }],
    {
      x: M, y: 1.8, w: CW, h: 3.9,
      barDir: "bar",
      chartColors: [NAVY],
      showValue: true, dataLabelPosition: "outEnd", dataLabelFontSize: 14, dataLabelFontFace: F, dataLabelColor: INK,
      showLegend: false,
      catAxisLabelFontFace: F, catAxisLabelFontSize: 14, catAxisLabelColor: INK,
      valAxisLabelFontFace: F, valAxisLabelFontSize: 11, valAxisLabelColor: GRAY,
      valGridLine: { color: "E4E8F0", size: 1 },
      catGridLine: { style: "none" },
      valAxisMaxVal: 10,
    }
  );
  note(s, "このうち、こちらから売り込んで取った仕事はゼロです。");
}

// ---- 公的支援ルート ----
statement("まず、公的支援。\n最初の一歩で何をやったか。");

{
  const s = content("公的支援の入り方は、2つありました", "第5部｜公的支援");
  cards(s, [
    { t: "① 登録して、応募する", b: "城北支部のキャリアデータベースに登録。\n公募が出たので応募し、補助金の書面審査へ。\n\nこれが、独立後に最初に報酬を得た仕事のひとつです。" },
    { t: "② 人に、相談する", b: "プロコン塾の懇親会で石川先生に相談。\n面接を受けて、商工会議所BSDの専門家に。\n\n中小機構も、リコージャパン時代の上司がそこで働いていたところから。" },
  ], { y: 2.1, h: 3.0 });
  note(s, "公的支援も、半分は「人」から入っています。登録だけではありません。");
  s.addNotes("①は誰でも今日できる。②は第1部の「出会いがいちばん大きかった」の回収。");
}

{
  const s = content("懇親会での一言が、2つの仕事になった", "第5部｜公的支援");
  const box = (x, y, w, t, fill, color, size) => {
    s.addShape(pres.ShapeType.roundRect, { x, y, w, h: 0.95, rectRadius: 0.06, fill: { color: fill }, line: { color: fill } });
    s.addText(t, { x: x + 0.12, y, w: w - 0.24, h: 0.95, fontFace: F, fontSize: size || 14, bold: true, color, align: "center", valign: "middle", isTextBox: true, margin: 0, fit: "shrink" });
  };
  const BW = 2.6, STEP = 3.1;
  const cx = (i) => M + STEP * i;
  const arrow = (x, y) => s.addShape(pres.ShapeType.rightArrow, { x, y, w: 0.4, h: 0.3, fill: { color: GOLD }, line: { color: GOLD } });

  box(cx(0), 1.85, BW, "プロコン塾の懇親会", SOFT, NAVY, 15);
  arrow(cx(0) + BW + 0.05, 2.18);
  box(cx(1), 1.85, BW, "石川先生に相談した", SOFT, NAVY, 15);
  arrow(cx(1) + BW + 0.05, 2.18);
  box(cx(2), 1.85, BW, "面接を受けた", SOFT, NAVY, 15);
  arrow(cx(2) + BW + 0.05, 2.18);
  box(cx(3), 1.85, BW, "合格。\nBSD東の専門家に", NAVY, WHITE, 14);

  s.addShape(pres.ShapeType.downArrow, { x: cx(3) + BW / 2 - 0.2, y: 2.9, w: 0.4, h: 0.5, fill: { color: GOLD }, line: { color: GOLD } });
  s.addText("共通の知り合いの診断士がいると分かった", { x: cx(0), y: 3.0, w: STEP * 3 - 0.35, h: 0.4, fontFace: F, fontSize: 15, color: GRAY, align: "right", isTextBox: true, margin: 0, fit: "shrink" });

  box(cx(0), 3.5, BW, "別途、懇親会を実施", SOFT, NAVY, 15);
  arrow(cx(0) + BW + 0.05, 3.83);
  box(cx(1), 3.5, BW, "その方がBSD南の\nコーディネーターだった", SOFT, NAVY, 13);
  arrow(cx(1) + BW + 0.05, 3.83);
  box(cx(2), 3.5, BW, "専門家派遣の\n依頼をいただいた", NAVY, WHITE, 14);

  s.addShape(pres.ShapeType.roundRect, { x: M, y: 4.9, w: CW, h: 0.9, rectRadius: 0.08, fill: { color: SOFT }, line: { color: SOFT } });
  s.addText("中小機構の専門家も、リコージャパン時代の上司が中小機構で働いていたところから", { x: M + 0.3, y: 4.9, w: CW - 0.6, h: 0.9, fontFace: F, fontSize: 16, bold: true, color: NAVY, valign: "middle", isTextBox: true, margin: 0, fit: "shrink" });

  note(s, "石川先生は、第2部でお話しした「飲食といえば」のあの先生です。");
  s.addNotes("塾の懇親会が仕事になった、という事実を強調する。受講生は今日その場にいる。");
}

{
  const s = content("そこから、登録先が8つに増えた", "第5部｜公的支援");
  const items = ["城北支部のキャリアデータベース（公募 → 補助金の書面審査）", "塩島さんの会社のデータベース", "商工会議所BSD の専門家派遣", "中小機構の専門家", "信用保証協会の専門家", "公社の専門家", "公社の先進デジタル（11月から）", "ニューマ（6月から）"];
  items.forEach((t, i) => {
    const col = i < 4 ? 0 : 1;
    const idx = i % 4;
    const x = M + col * (CW / 2 + 0.15);
    const y = 2.0 + idx * 0.85;
    s.addShape(pres.ShapeType.ellipse, { x: x, y: y + 0.05, w: 0.22, h: 0.22, fill: { color: GOLD }, line: { color: GOLD } });
    s.addText(t, { x: x + 0.45, y: y - 0.05, w: CW / 2 - 0.6, h: 0.7, fontFace: F, fontSize: 15, color: INK, isTextBox: true, margin: 0, lineSpacing: 20, fit: "shrink" });
  });
  note(s, "登録しておくだけで入口になります。今日、席に座ったまま申し込めるものがあります。");
}

// ---- 民間ルート ----
statement("次に、民間の仕事。\n1件ずつ、何をやったか。");

{
  const s = content("過去の縁が、独立を機に仕事になった（5件）", "第5部｜民間");
  rows(s, [
    { h: "地元のサッカークラブ", d: "コロナ禍から支援していて、会社を辞めることになり顧問に" },
    { h: "ホームページ作成会社（リコー時代の支援先）", d: "退職が決まり、有給休暇中に奄美大島まで会いに行き、その夜に決まった" },
    { h: "scalar（理工のときの支援先）", d: "「会社を辞めるなら一緒に」と誘われて" },
    { h: "リコージャパン（古巣）", d: "前職からの依頼" },
    { h: "弟の会社", d: "泣きついた" },
  ], { y: 1.9, gap: 0.95, hs: 17 });
  s.addNotes("1件ずつ、そのとき自分が何をしたかを語る。とくに奄美大島と、弟に泣きついた話。");
}

{
  const s = content("人からのお誘い（3件）", "第5部｜民間");
  rows(s, [
    { h: "ビューティーガレージグループ", d: "外山さんからのお誘い" },
    { h: "三菱フードサービス", d: "塩島さんからのお誘い" },
    { h: "アンドドット", d: "公的支援が終わったあとにお誘いをいただいた（公的 → 民間への転換）" },
  ], { y: 2.2, gap: 1.15 });
}

{
  const s = content("顧問先からの紹介（7件）", "第5部｜民間");
  s.addText("今年から増えた11社のうち、7社が紹介でした。", { x: M, y: 1.75, w: CW, h: 0.4, fontFace: F, fontSize: 16, color: GRAY, isTextBox: true, margin: 0 });
  const items = [
    { h: "池田紙工", d: "scalar からの紹介" },
    { h: "OTCコーヒー", d: "scalar からの紹介・創業支援" },
    { h: "春蔵", d: "顧問先からの紹介" },
    { h: "ミセツク", d: "顧問先からの紹介" },
    { h: "sova", d: "顧問先からの紹介" },
    { h: "Caneat", d: "顧問先からの紹介" },
    { h: "Protribe", d: "顧問先からの紹介" },
  ];
  items.forEach((it, i) => {
    const col = i < 4 ? 0 : 1;
    const idx = i % 4;
    const x = M + col * (CW / 2 + 0.15);
    const y = 2.35 + idx * 0.95;
    s.addShape(pres.ShapeType.ellipse, { x: x, y: y + 0.08, w: 0.22, h: 0.22, fill: { color: GOLD }, line: { color: GOLD } });
    s.addText(it.h, { x: x + 0.45, y: y, w: CW / 2 - 0.6, h: 0.35, fontFace: F, fontSize: 17, bold: true, color: INK, isTextBox: true, margin: 0 });
    s.addText(it.d, { x: x + 0.45, y: y + 0.36, w: CW / 2 - 0.6, h: 0.35, fontFace: F, fontSize: 13, color: GRAY, isTextBox: true, margin: 0 });
  });
  note(s, "紹介元は、自分が支援してきた顧問先です。");
}

{
  const s = content("逆営業（2件）", "第5部｜民間");
  cards(s, [
    { t: "ppコネクト", b: "創業コンサルの飛び込み営業が来ました。\n\nその営業マンを捕まえて指導し、「俺が顧問になって教えてあげる」ということで顧問契約になりました。" },
    { t: "四葉不動産", b: "カフェBARの物件を探してくれた不動産仲介です。\n\n営業が下手だったので、営業顧問として仕事の取り方を教え、開業コンサルとして組むことで顧問になりました。" },
  ], { y: 2.0, h: 3.0 });
  note(s, "売り込まれた場で、相手の困りごとを見つけ、先に「教える側」に回っています。");
}

{
  const s = content("個人的な縁　／　未来への仕込み", "第5部｜民間");
  cards(s, [
    { t: "個人的な縁（1件）", b: "継承\n\n息子のチームメイトのご縁から。" },
    { t: "未来への仕込み（2件）", b: "ラーメンのセントラルキッチンからの展開 → 売却\nカフェBAR事業\n\nいまはお金を生みませんが、バイアウトで1000万といった出口を見ています。" },
  ], { y: 2.1, h: 3.2 });
}

// ---- 共通点を見つけてもらう ----
statement("さて。\nいま並べた26件に、\n共通していることは何でしょうか。", "少し考えてみてください。何人かに聞きます。")
  .addNotes("ここで手を止めて、3〜4人に当てる。答えを先に言わない。受講生の言葉を拾って板書する。");

{
  const s = content("私が思う、26件の共通点", "第5部｜共通点");
  rows(s, [
    { h: "公的支援ですら、入口は「人」だった", d: "BSDは塾の懇親会での相談から、中小機構は前職の上司から。登録だけで来た仕事のほうが少ないくらいです" },
    { h: "やったことは、地味な3つだけ", d: "登録する／会いに行く・相談する／引き受けた1件をやり切る。特別な才能は要りませんでした" },
    { h: "1件が、次を連れてきている", d: "BSD東がBSD南を、scalar 1社が2社を、顧問先が7社を連れてきました。仕事が仕事を生んでいます" },
  ], { y: 2.1, gap: 1.3, hs: 19 });
  s.addNotes("受講生から出た言葉と重ねながら話す。3つ目が第6部への入口になる。");
}

statement("こちらから売り込んで取った仕事は、\nひとつもありません。", "過去の縁5／登録先8／お誘い3／紹介7／逆営業2／個人的な縁1");

// =========================================================
// 第6部
// =========================================================
sectionSlide(6, "信用とエコシステム", "15:03-15:23／20分　では、26件は何によって来たのか");

{
  const s = content("「営業力」という言葉が、私は大嫌いです", "第6部");
  s.addShape(pres.ShapeType.roundRect, { x: M, y: 2.1, w: CW, h: 1.5, rectRadius: 0.08, fill: { color: SOFT }, line: { color: SOFT } });
  s.addText("「畠中さんは営業力があるからね」", { x: M + 0.4, y: 2.1, w: CW - 0.8, h: 1.5, fontFace: F, fontSize: 26, bold: true, color: NAVY, valign: "middle", isTextBox: true, margin: 0, fit: "shrink" });
  s.addText("そう言われると、正直「は？」と思います。\n26件のうち、売り込んで取ったものはゼロです。では、何で来たのか。", { x: M, y: 4.0, w: CW, h: 1.2, fontFace: F, fontSize: 18, color: INK, isTextBox: true, margin: 0, lineSpacing: 30 });
}

statement("信用です。");

{
  const s = content("信用残高という考え方", "第6部");
  s.addText("仕事は「取りに行く」ものではなく、貯まった信用の残高から引き出されるものです。", { x: M, y: 1.75, w: CW, h: 0.4, fontFace: F, fontSize: 16, color: GRAY, isTextBox: true, margin: 0, fit: "shrink" });
  cards(s, [
    { t: "残高が増える行為", b: "・約束を守る\n・期限より早く出す\n・返事が速い\n・頼まれごとを一度引き受ける\n・相手の成果に貢献する\n・会いに行く" },
    { t: "残高が減る行為", b: "・遅れる\n・雑にやる\n・断らずに抱えて落とす\n・顔を出さなくなる" },
  ], { y: 2.35, h: 3.1, bs: 15 });
  note(s, "第2部の4人も、全員が依頼元に対する信用残高が圧倒的に高い状態でした。");
}

{
  const s = content("山口周『人生の経営戦略』の4つの資本", "第6部");
  const labels = ["時間資本", "人的資本", "社会資本", "金融資本"];
  const subs = ["自分の時間", "知識・経験・スキル", "信用・評判・知名度", "お金"];
  const bw = 2.6, gap = 0.5;
  labels.forEach((l, i) => {
    const x = M + (bw + gap) * i;
    s.addShape(pres.ShapeType.roundRect, { x: x, y: 2.2, w: bw, h: 1.6, rectRadius: 0.08, fill: { color: i === 2 ? NAVY : SOFT }, line: { color: i === 2 ? NAVY : SOFT } });
    s.addText(l, { x: x + 0.15, y: 2.45, w: bw - 0.3, h: 0.5, fontFace: F, fontSize: 20, bold: true, color: i === 2 ? WHITE : NAVY, align: "center", isTextBox: true, margin: 0, fit: "shrink" });
    s.addText(subs[i], { x: x + 0.15, y: 3.0, w: bw - 0.3, h: 0.6, fontFace: F, fontSize: 13, color: i === 2 ? ICE : GRAY, align: "center", isTextBox: true, margin: 0, fit: "shrink" });
    if (i < 3) {
      s.addShape(pres.ShapeType.rightArrow, { x: x + bw + 0.07, y: 2.85, w: 0.4, h: 0.3, fill: { color: GOLD }, line: { color: GOLD } });
    }
  });
  s.addText("金融資本を生むのは、信用・評判・知名度といった「社会資本」であって、\n知識・能力・コンピテンシーといった「人的資本」ではない。", { x: M, y: 4.2, w: CW, h: 1.0, fontFace: F, fontSize: 19, bold: true, color: NAVY, isTextBox: true, margin: 0, lineSpacing: 30, fit: "shrink" });
  note(s, "「尖っていないとダメ＝人的資本を磨け」は、半分しか当たっていません。");
}

{
  const s = content("単発の仕事と、エコシステム", "第6部");
  const head = ["", "単発の仕事", "エコシステム"];
  const body = [
    ["仕事の来方", "探す・応募する", "流れてくる"],
    ["1件終わったら", "ゼロに戻る", "次を連れてくる"],
    ["増え方", "足し算", "かけ算"],
  ];
  const colw = [3.2, 4.35, 4.35];
  const x0 = M;
  head.forEach((h, c) => {
    const x = x0 + colw.slice(0, c).reduce((a, b) => a + b, 0);
    if (c > 0) {
      s.addShape(pres.ShapeType.roundRect, { x: x, y: 2.0, w: colw[c] - 0.2, h: 0.7, rectRadius: 0.06, fill: { color: c === 2 ? NAVY : SOFT }, line: { color: c === 2 ? NAVY : SOFT } });
      s.addText(h, { x: x, y: 2.0, w: colw[c] - 0.2, h: 0.7, fontFace: F, fontSize: 18, bold: true, color: c === 2 ? WHITE : NAVY, align: "center", valign: "middle", isTextBox: true, margin: 0 });
    }
  });
  body.forEach((r, ri) => {
    const y = 2.95 + ri * 0.95;
    r.forEach((cell, c) => {
      const x = x0 + colw.slice(0, c).reduce((a, b) => a + b, 0);
      s.addText(cell, {
        x: x + (c === 0 ? 0 : 0), y: y, w: colw[c] - 0.2, h: 0.7,
        fontFace: F, fontSize: c === 0 ? 16 : 18, bold: c !== 1,
        color: c === 2 ? NAVY : c === 0 ? GRAY : INK,
        align: c === 0 ? "left" : "center", valign: "middle", isTextBox: true, margin: 0, fit: "shrink",
      });
    });
  });
  note(s, "信用は材料。エコシステムは仕組みです。");
}

{
  const s = content("私のエコシステム", "第6部");
  const box = (x, y, w, h, t, fill, color, size) => {
    s.addShape(pres.ShapeType.roundRect, { x, y, w, h, rectRadius: 0.06, fill: { color: fill }, line: { color: fill } });
    s.addText(t, { x: x + 0.12, y: y, w: w - 0.24, h: h, fontFace: F, fontSize: size || 14, bold: true, color: color, align: "center", valign: "middle", isTextBox: true, margin: 0, fit: "shrink" });
  };
  const arrow = (x, y, w, h) => s.addShape(pres.ShapeType.rightArrow, { x, y, w, h, fill: { color: GOLD }, line: { color: GOLD } });

  const BW = 2.6, STEP = 3.1;
  const cx = (i) => M + STEP * i;

  // 上段：登録先ルート
  box(cx(0), 1.85, BW, 0.85, "入口①\n登録しておいた先（8つ）", SOFT, NAVY, 14);
  arrow(cx(0) + BW + 0.05, 2.13, 0.4, 0.3);
  box(cx(1), 1.85, BW, 0.85, "案件が来る", SOFT, NAVY, 15);
  arrow(cx(1) + BW + 0.05, 2.13, 0.4, 0.3);
  box(cx(2), 1.85, BW, 0.85, "期待以上で\nやり切る", SOFT, NAVY, 14);
  arrow(cx(2) + BW + 0.05, 2.13, 0.4, 0.3);
  box(cx(3), 1.85, BW, 0.85, "アンドドット\n（公 → 民へ）", ICE, NAVY, 14);

  // 下段：縁ルート
  box(cx(0), 3.35, BW, 0.85, "入口②\n過去の縁（5件）", SOFT, NAVY, 14);
  arrow(cx(0) + BW + 0.05, 3.63, 0.4, 0.3);
  box(cx(1), 3.35, BW, 0.85, "顧問契約", SOFT, NAVY, 15);
  arrow(cx(1) + BW + 0.05, 3.63, 0.4, 0.3);
  box(cx(2), 3.35, BW, 0.85, "期待以上で\nやり切る＝信用", NAVY, WHITE, 14);
  arrow(cx(2) + BW + 0.05, 3.63, 0.4, 0.3);
  box(cx(3), 3.35, BW, 0.85, "顧問先が\n紹介を出す", NAVY, WHITE, 14);

  // 循環（下段の右端から左へ戻り、入口②へ上がる）
  box(cx(1), 5.0, BW * 3 + (STEP - BW) * 2, 0.85, "紹介で入った7社が、また紹介元になる", GOLD, WHITE, 17);
  s.addShape(pres.ShapeType.leftArrow, { x: cx(0) + 1.1, y: 5.2, w: 1.9, h: 0.45, fill: { color: GOLD }, line: { color: GOLD } });
  s.addShape(pres.ShapeType.upArrow, { x: cx(0) + 1.05, y: 4.3, w: 0.45, h: 0.85, fill: { color: GOLD }, line: { color: GOLD } });
  s.addText("循環", { x: cx(0) - 0.1, y: 5.2, w: 1.1, h: 0.45, fontFace: F, fontSize: 15, bold: true, color: GOLD, align: "right", valign: "middle", isTextBox: true, margin: 0 });

  note(s, "scalar 1社が、池田紙工とOTCコーヒーの2社を連れてきました。これが回っている証拠です。");
}

{
  const s = content("回すために必要なのは、3つだけ", "第6部");
  rows(s, [
    { h: "入口を複数持つ", d: "登録先、過去の縁、逆営業。ひとつに依存しない" },
    { h: "1件を期待以上でやり切る", d: "ここでしか信用は貯まりません" },
    { h: "紹介してくれた人に、結果を返す", d: "返さないと、循環は1回で止まります" },
  ], { y: 2.3, gap: 1.2, hs: 22 });
}

{
  const s = content("再現の5ステップ", "第6部");
  s.addText("私が2年でやったことを、誰でも辿れる順番にすると、この5つです。", { x: M, y: 1.7, w: CW, h: 0.4, fontFace: F, fontSize: 15, color: GRAY, isTextBox: true, margin: 0 });
  rows(s, [
    { h: "信用の棚卸し", d: "すでに持っている縁を、全部書き出す（＝過去の縁5件）" },
    { h: "入口に登録する", d: "支部のキャリアデータベース、公的機関の専門家（＝登録先8件）" },
    { h: "来た仕事を、期待以上でやり切る", d: "残高を増やす。ここが2〜3年。4人の育ち方と同じ" },
    { h: "紹介が出る状態にする", d: "エコシステム化（＝紹介7件）" },
    { h: "やらない仕事を決める", d: "残高を減らす仕事を切る" },
  ], { y: 2.25, gap: 0.87, hs: 18 });
  note(s, "今日できるのは1と2。3で差がつき、4は勝手に回りだします。");
}

// =========================================================
// 第7部
// =========================================================
sectionSlide(7, "やらない仕事を決める", "15:23-15:31／8分　私の失敗談から");

{
  const s = content("失敗談：Webの仕事で疲弊しました", "第7部");
  rows(s, [
    { h: "1年目、easy で Web 作成をしたことから、Webの仕事を受けた", d: "" },
    { h: "期待値が高くて、疲弊した", d: "" },
    { h: "1年後、Webは基本的に受けないと決めた", d: "" },
  ], { y: 2.3, gap: 1.15, hs: 21 });
  note(s, "いまは、やらない仕事を決めることがコンサルとして重要だと思っています。");
}

{
  const s = content("やる仕事ではなく、やらない仕事を決める", "第7部");
  const items = ["自分の価値を高める仕事だけをする", "いつでも仕事を切れる状態にする", "一つの顧問先に依存しない", "自分の生き方を決める", "自分にしかできないをつくる", "トップコンサルを目指さない", "自分が幸せになる仕事を選ぶ", "自分が幸せなら、周りも幸せになる"];
  items.forEach((t, i) => {
    const col = i < 4 ? 0 : 1;
    const idx = i % 4;
    const x = M + col * (CW / 2 + 0.15);
    const y = 2.0 + idx * 0.95;
    s.addShape(pres.ShapeType.roundRect, { x: x, y: y, w: CW / 2 - 0.3, h: 0.75, rectRadius: 0.06, fill: { color: i >= 6 ? NAVY : SOFT }, line: { color: i >= 6 ? NAVY : SOFT } });
    s.addText(t, { x: x + 0.25, y: y, w: CW / 2 - 0.8, h: 0.75, fontFace: F, fontSize: 16, bold: true, color: i >= 6 ? WHITE : INK, valign: "middle", isTextBox: true, margin: 0, fit: "shrink" });
  });
  note(s, "成功の定義②「自分の人生を自分でコントロールしている実感」は、ここから来ます。");
}

// =========================================================
// ワーク
// =========================================================
sectionSlide(8, "個人ワーク：自分のエコシステムを設計する", "15:31-15:55／24分　1本だけ、循環を描いて帰ってください");

{
  const s = content("ワークの流れ", "個人ワーク");
  cards(s, [
    { t: "ステップ1（10分）\n人脈マップを埋める", b: "私の26件と同じ6つの枠に、自分の名前で書き込みます。\n\nAの「過去の縁」は、全員が書けます。" },
    { t: "ステップ2（9分）\n循環を1本描く", b: "Aから1人だけ選び、矢印を描きます。\n\n1本回れば、あとは同じことの繰り返しです。" },
    { t: "ステップ3（5分）\n今日やる1つを決める", b: "登録先をその場で1つ申し込む。\nまたは、描いた相手にその場で連絡する。\n\n行動を完了させて帰ってください。" },
  ], { y: 2.1, h: 3.5 });
}

{
  const s = content("ステップ1：人脈マップ（10分）", "個人ワーク");
  const items = [
    { t: "A 過去の縁", b: "前職の同僚・取引先、顧客、地元、家族、友人。思いつく限り名前で書く" },
    { t: "B 登録できる先", b: "支部のキャリアデータベース、中小機構、信用保証協会、公社、商工会議所" },
    { t: "C お誘いをくれそうな人", b: "支部の先輩、同期、研究会" },
    { t: "D 紹介を生みそうな人", b: "Aのうち、人を紹介してくれそうな人に◎" },
    { t: "E 逆営業できる相手", b: "いま自分に営業してきている人（保険・不動産・システムなど）" },
    { t: "F 個人的な縁", b: "趣味、子どもの縁、地域" },
  ];
  const cw2 = (CW - 0.3) / 3;
  items.forEach((it, i) => {
    const col = i % 3;
    const row = i < 3 ? 0 : 1;
    const x = M + (cw2 + 0.15) * col;
    const y = 1.95 + row * 2.05;
    s.addShape(pres.ShapeType.roundRect, { x: x, y: y, w: cw2, h: 1.85, rectRadius: 0.08, fill: { color: i === 0 ? NAVY : SOFT }, line: { color: i === 0 ? NAVY : SOFT } });
    s.addText(it.t, { x: x + 0.25, y: y + 0.2, w: cw2 - 0.5, h: 0.45, fontFace: F, fontSize: 17, bold: true, color: i === 0 ? WHITE : NAVY, isTextBox: true, margin: 0, fit: "shrink" });
    s.addText(it.b, { x: x + 0.25, y: y + 0.7, w: cw2 - 0.5, h: 1.0, fontFace: F, fontSize: 13, color: i === 0 ? ICE : GRAY, isTextBox: true, margin: 0, lineSpacing: 18, fit: "shrink" });
  });
  note(s, "「まだ何も持っていない」と思っている人ほど、Aが埋まります。");
}

{
  const s = content("ステップ2：循環を1本描く（9分）", "個人ワーク");
  const box = (x, y, w, t, fill, color) => {
    s.addShape(pres.ShapeType.roundRect, { x, y, w, h: 1.0, rectRadius: 0.06, fill: { color: fill }, line: { color: fill } });
    s.addText(t, { x: x + 0.12, y, w: w - 0.24, h: 1.0, fontFace: F, fontSize: 15, bold: true, color, align: "center", valign: "middle", isTextBox: true, margin: 0, fit: "shrink" });
  };
  const bw = 2.7, gp = 0.3;
  ["［誰から］", "［どんな仕事］", "［期待以上に\n何をするか］", "［誰に紹介して\nもらえそうか］"].forEach((t, i) => {
    const x = M + (bw + gp) * i;
    box(x, 2.1, bw, t, SOFT, NAVY);
    if (i < 3) s.addShape(pres.ShapeType.rightArrow, { x: x + bw + 0.02, y: 2.48, w: 0.3, h: 0.25, fill: { color: GOLD }, line: { color: GOLD } });
  });
  s.addText("私の例", { x: M, y: 3.45, w: CW, h: 0.35, fontFace: F, fontSize: 14, bold: true, color: GOLD, isTextBox: true, margin: 0 });
  ["scalar", "顧問契約", "経営会議に毎月入り、\n決めきるまで付き合う", "池田紙工・OTCコーヒー\nの2社を紹介"].forEach((t, i) => {
    const x = M + (bw + gp) * i;
    box(x, 3.8, bw, t, i === 3 ? NAVY : ICE, i === 3 ? WHITE : NAVY);
    if (i < 3) s.addShape(pres.ShapeType.rightArrow, { x: x + bw + 0.02, y: 4.18, w: 0.3, h: 0.25, fill: { color: GOLD }, line: { color: GOLD } });
  });
  s.addText("最後に「紹介してくれた人に、どう結果を返すか」を1行足してください。返さないと循環は止まります。", { x: M, y: 5.2, w: CW, h: 0.6, fontFace: F, fontSize: 17, bold: true, color: NAVY, isTextBox: true, margin: 0, fit: "shrink" });
  s.addNotes("scalar の例は当日、実際の関わり方に合わせて言い換えてください。");
}

{
  const s = content("ステップ3：今日やる1つを決める（5分）", "個人ワーク");
  cards(s, [
    { t: "その場で登録する", b: "城北支部のキャリアデータベース\n中小機構／信用保証協会／公社の専門家登録\n\nスマホを出して、いま1つ申し込んでください。" },
    { t: "その場で連絡する", b: "ステップ2で書いた相手に、いまメッセージを送ってください。\n\n「久しぶりに一度お話しできませんか」で十分です。" },
  ], { y: 2.2, h: 3.0 });
  note(s, "行動をひとつ完了させて帰る。それが今日の成果です。");
}

// =========================================================
// まとめ
// =========================================================
{
  const s = pres.addSlide();
  dark(s);
  s.addText("まとめ", { x: M, y: 0.9, w: CW, h: 0.6, fontFace: F, fontSize: 26, bold: true, color: GOLD, isTextBox: true, margin: 0 });
  const items = [
    "私の26件は、全部「信用」から来ました。売り込んだ仕事はひとつもありません",
    "尖っていなくていい。尖りは結果であって、出発点ではありません",
    "信用は材料、エコシステムが仕組みです。1本回れば、あとは繰り返しです",
    "やらない仕事を決めて、自分が幸せになる仕事を選んでください",
  ];
  items.forEach((t, i) => {
    const y = 1.9 + i * 0.95;
    s.addShape(pres.ShapeType.ellipse, { x: M, y: y, w: 0.5, h: 0.5, fill: { color: GOLD }, line: { color: GOLD } });
    s.addText(String(i + 1), { x: M, y: y, w: 0.5, h: 0.5, fontFace: F, fontSize: 16, bold: true, color: WHITE, align: "center", valign: "middle", isTextBox: true, margin: 0 });
    s.addText(t, { x: M + 0.8, y: y - 0.05, w: CW - 0.9, h: 0.6, fontFace: F, fontSize: 18, color: WHITE, valign: "middle", isTextBox: true, margin: 0, fit: "shrink" });
  });
  s.addText("私が3年前にこの席で聞きたかったことを、今日は全部お話ししました。\n数字も名前も出しました。次は、皆さんの番です。", { x: M, y: 5.9, w: CW, h: 1.0, fontFace: F, fontSize: 19, bold: true, color: ICE, isTextBox: true, margin: 0, lineSpacing: 30, fit: "shrink" });
}

const out = process.argv[2] || "lecture-johoku-procon.pptx";
pres.writeFile({ fileName: out }).then(() => console.log("written:", out));
