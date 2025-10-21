import React, { useEffect, useMemo, useRef, useState } from "react";

/**
 * Final CPA Profit Calculator - All requested features implemented.
 *
 * Notes:
 * - Replace donation placeholders inside DONATION object.
 * - PDF export uses dynamic imports for html2canvas and jspdf (optional).
 * - All UI uses inline SVG charts so no extra chart dependency required.
 */

/* ---------------------- Translations ---------------------- */
const DICT = {
  ar: {
    langName: "العربية",
    title: "حاسبة أرباح COD — الجزائر",
    subtitle: "سريعة وبسيطة للبائعين COD",
    product: "ثمن المنتوج",
    shipping: "ثمن الشحن",
    ad: "سومة الإعلان لكل lead",
    price: "سعر البيع",
    conf: "نسبة التأكيد (%)",
    del: "نسبة التوصيل (%)",
    calc: "احسب الآن",
    exportCSV: "تصدير CSV",
    exportPDF: "تنزيل PDF",
    share: "نسخ رابط المشاركة",
    analytics: "التحليلات",
    advInsights: "إدارة المخاطر",
    advInsightsTipTitle: "نصائح سريعة لإدارة المخاطر",
    advInsightsTips: [
      "جرب ميزانية تجريبية صغيرة قبل التوسع.",
      "راقب تأكيد الطلبات وتواصل مع العملاء سريعاً.",
      "اختبر عدة أسعار للعثور على نقطة التعادل."
    ],
    pieLegend: { ad: "مصاريف الإعلان", product: "ثمن المنتوج", shipping: "الشحن", profit: "الربح" },
    roi: "معدل العائد (ROI)",
    conversion: "نسبة النجاح",
    costRatio: "نسبة التكاليف",
    donateReminderTitle: "هل ترغب بدعمنا لتطوير المشروع؟",
    donateYes: "نعم",
    donateLater: "لاحقاً",
    donateDetailsTitle: "طرق الدعم",
    donateThanks: "شكراً على دعمك! ❤️",
    theme: "المظهر",
    selectLang: "اللغة",
    pdfError: "لا يمكن تنزيل PDF الآن — ثبّت html2canvas و jspdf أو جرّب لاحقًا.",
    breakEven: "نقطة التعادل",
    breakEvenLabel: "سعر التعادل (لصفقة واحدة)",
    invalidInputMsg: "تم تصحيح القيم غير الصالحة."
  },
  en: {
    langName: "English",
    title: "COD Profit Calculator — ALGERIA",
    subtitle: "Quick and simple for COD sellers",
    product: "Product cost",
    shipping: "Shipping cost",
    ad: "Ad cost per lead",
    price: "Sales price",
    conf: "Confirmation rate (%)",
    del: "Delivery rate (%)",
    calc: "Calculate",
    exportCSV: "Export CSV",
    exportPDF: "Download PDF",
    share: "Copy share link",
    analytics: "Analytics",
    advInsights: "Risk Management",
    advInsightsTipTitle: "Quick risk tips",
    advInsightsTips: [
      "Start with a small ad budget when testing.",
      "Monitor confirmations and respond to customers fast.",
      "Test several prices to find break-even."
    ],
    pieLegend: { ad: "Ad cost", product: "Product", shipping: "Shipping", profit: "Profit" },
    roi: "ROI",
    conversion: "Success rate",
    costRatio: "Cost ratio",
    donateReminderTitle: "Would you like to support this project?",
    donateYes: "Yes",
    donateLater: "Later",
    donateDetailsTitle: "Support options",
    donateThanks: "Thanks for your support! ❤️",
    theme: "Theme",
    selectLang: "Language",
    pdfError: "Cannot download PDF now — install html2canvas & jspdf or try later.",
    breakEven: "Break-even",
    breakEvenLabel: "Break-even price (single sale)",
    invalidInputMsg: "Invalid values auto-corrected."
  }
};

/* ---------------------- Donation placeholders ---------------------- */
/* Replace these with real details */
const DONATION = {
  baridimob: "BaridiMob: 05XX XXX XXX",
  paypal: "PayPal: https://paypal.me/YOUR_PAYPAL",
  kofi: "Ko-fi: https://ko-fi.com/YOUR_PAGE",
  redotpay: "RedotPay: https://redotpay.example/your-link",
  message: {
    ar: "شكراً على دعمك! أي دعم يساعدنا في تطوير أدوات أفضل.",
    en: "Thanks for supporting! Any donation helps us build better tools."
  }
};

/* ---------------------- Utility helpers ---------------------- */
const moneyFmt = (n) => (!isFinite(n) ? "—" : (Math.round(n * 100) / 100).toLocaleString());
const downloadCSV = (rows, filename = "cpa_calc.csv") => {
  const csv = rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
};

/* ---------------------- Stable child components (prevent re-creation) ---------------------- */

function InputField({ label, value, onChange, type = "number", min, max, step, currencyLabel }) {
  // local string state avoids focus loss when parent re-renders with numbers
  const [local, setLocal] = useState(String(value ?? ""));
  useEffect(() => setLocal(String(value ?? "")), [value]);
  return (
    <div>
      <label className="text-slate-300 text-sm">{label}{currencyLabel ? ` (${currencyLabel})` : ""}</label>
      <input
        value={local}
        onChange={(e) => {
          const v = e.target.value;
          setLocal(v);
          // allow empty input to type; parent will correct onBlur
        }}
        onBlur={() => {
          let n = Number(local);
          if (Number.isNaN(n)) n = 0;
          if (min !== undefined && n < min) n = min;
          if (max !== undefined && n > max) n = max;
          // round to 2 decimals
          if (step) n = Math.round(n / step) * step;
          setLocal(String(n));
          onChange(n);
        }}
        type={type}
        min={min}
        max={max}
        step={step}
        className="w-full mt-2 p-3 rounded-lg bg-white/4 outline-none"
      />
    </div>
  );
}

function MetricCard({ title, value, note }) {
  return (
    <div className="p-3 rounded-lg bg-white/6 transition-shadow">
      <div className="text-xs text-slate-300">{title}</div>
      <div className="font-semibold mt-1">{value}</div>
      {note && <div className="text-xs text-slate-400 mt-1">{note}</div>}
    </div>
  );
}

/* Pie Chart and Bar Chart (inline SVG) */
function PieChart({ slices = [], size = 160 }) {
  const radius = size / 2;
  const cx = radius;
  const cy = radius;
  const total = slices.reduce((s, x) => s + Math.max(0, x.value), 0) || 1;
  let angleStart = -90;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} role="img" aria-label="pie-chart">
      <g>
        {slices.map((s, idx) => {
          const angle = (s.value / total) * 360;
          const angleEnd = angleStart + angle;
          const x1 = cx + radius * Math.cos((Math.PI * angleStart) / 180);
          const y1 = cy + radius * Math.sin((Math.PI * angleStart) / 180);
          const x2 = cx + radius * Math.cos((Math.PI * angleEnd) / 180);
          const y2 = cy + radius * Math.sin((Math.PI * angleEnd) / 180);
          const large = angle > 180 ? 1 : 0;
          const d = `M ${cx} ${cy} L ${x1} ${y1} A ${radius} ${radius} 0 ${large} 1 ${x2} ${y2} Z`;
          angleStart = angleEnd;
          return <path key={idx} d={d} fill={s.color} stroke="#0f1724" strokeWidth="0.5" />;
        })}
      </g>
    </svg>
  );
}

function BarChart({ labels = [], values = [], width = 240, height = 120, color = "#60a5fa" }) {
  const max = Math.max(...values, 1);
  const barW = width / (values.length * 1.5);
  return (
    <svg width={width} height={height} className="block">
      {values.map((v, i) => {
        const barH = (v / max) * (height - 20);
        const x = i * barW * 1.5 + 10;
        const y = height - barH - 20;
        return (
          <g key={i}>
            <rect x={x} y={y} width={barW} height={barH} rx="4" fill={color} opacity="0.95" />
            <text x={x + barW / 2} y={height - 6} fontSize="10" textAnchor="middle" fill="#cbd5e1">
              {labels[i]}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

/* ---------------------- Main App ---------------------- */
export default function App() {
  // language & translation
  const [lang, setLang] = useState("ar");
  const t = DICT[lang] || DICT.ar;

  // theme
  const [dark, setDark] = useState(() => {
    try {
      const s = localStorage.getItem("cpa-theme");
      return s ? s === "dark" : true;
    } catch {
      return true;
    }
  });
  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
    localStorage.setItem("cpa-theme", dark ? "dark" : "light");
  }, [dark]);

  // inputs (numbers stored as numbers)
  const [inputs, setInputs] = useState({
    product: 2600,
    shipping: 0,
    ad: 500,
    price: 4950,
    conf: 50,
    del: 50,
    currency: "DZD"
  });

  const [rates, setRates] = useState({ USD: 129.57, EUR: 150.97 });

  // results stored in ref to allow export without timing issues
  const resultRef = useRef(null);
  const [, bump] = useState(0); // small state to force updates when needed

  // helper conversions
  const toDZD = (v) => {
    const n = Number(v) || 0;
    if (inputs.currency === "DZD") return n;
    if (inputs.currency === "USD") return n * Number(rates.USD);
    if (inputs.currency === "EUR") return n * Number(rates.EUR);
    return n;
  };
  const fromDZD = (dzd) => {
    if (inputs.currency === "DZD") return dzd;
    if (inputs.currency === "USD") return dzd / Number(rates.USD);
    if (inputs.currency === "EUR") return dzd / Number(rates.EUR);
    return dzd;
  };

  // calculation
  function calculate(current = inputs) {
    const product = toDZD(current.product);
    const shipping = toDZD(current.shipping);
    const ad = toDZD(current.ad);
    const price = toDZD(current.price);
    const conf = Math.max(0, Math.min(1, Number(current.conf) / 100));
    const del = Math.max(0, Math.min(1, Number(current.del) / 100));
    const success = conf * del;
    const effAd = success === 0 ? Infinity : ad / success;
    const totalCost = product + shipping + (isFinite(effAd) ? effAd : 0);
    const net = price - totalCost;
    const margin = price === 0 ? 0 : (net / price) * 100;
    const maxAd = success * (price - product - shipping);
    const roi = totalCost === 0 ? 0 : ((price - totalCost) / totalCost) * 100;
    const conversion = success;
    const costRatio = totalCost === 0 ? 0 : (totalCost / price) * 100;
    const r = {
      product,
      shipping,
      ad,
      price,
      success,
      effAd,
      totalCost,
      net,
      margin,
      maxAd,
      roi,
      conversion,
      costRatio
    };
    resultRef.current = r;
    bump((x) => x + 1);
    return r;
  }

  useEffect(() => {
    calculate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // input handlers with validation
  function handleInputChange(key, value) {
    // value is already numeric from InputField onBlur
    const next = { ...inputs, [key]: value };
    // Clamp percentage fields
    if (key === "conf" || key === "del") {
      next[key] = Math.max(0, Math.min(100, Number(value) || 0));
    }
    setInputs(next);
    calculate(next);
  }

  // exchange rate updates (simple)
  function setRate(k, v) {
    setRates((p) => ({ ...p, [k]: Number(v) || 0 }));
    // no need to recalc rates immediately as they affect toDZD conversions when inputs change
  }

  // Share link
  function copyShareLink() {
    try {
      const params = new URLSearchParams(inputs).toString();
      const url = `${window.location.origin}${window.location.pathname}?${params}`;
      navigator.clipboard.writeText(url);
      alert("Link copied ✅");
    } catch {
      alert("Copy failed");
    }
  }

  // CSV export
  function exportCSV() {
    const r = resultRef.current || calculate();
    const rows = [
      ["product", "shipping", "ad", "price", "conf", "del", "currency", "success_rate", "eff_ad", "total_cost", "net", "margin", "max_ad"],
      [
        inputs.product,
        inputs.shipping,
        inputs.ad,
        inputs.price,
        inputs.conf,
        inputs.del,
        inputs.currency,
        (r.success * 100).toFixed(2) + "%",
        isFinite(r.effAd) ? r.effAd.toFixed(2) : "",
        isFinite(r.totalCost) ? r.totalCost.toFixed(2) : "",
        r.net.toFixed(2),
        r.margin.toFixed(2) + "%",
        isFinite(r.maxAd) ? r.maxAd.toFixed(2) : ""
      ]
    ];
    downloadCSV(rows);
  }

  // PDF export (safe)
  async function exportPDF() {
    const r = resultRef.current;
    if (!r) {
      alert(t.pdfError);
      return;
    }
    try {
      const html2canvasModule = await import("html2canvas").catch(() => null);
      const jspdfModule = await import("jspdf").catch(() => null);
      if (!html2canvasModule || !jspdfModule) {
        alert(t.pdfError);
        return;
      }
      const html2canvas = html2canvasModule.default;
      const jsPDF = jspdfModule.jsPDF || jspdfModule.default?.jsPDF || jspdfModule.default;
      const el = document.getElementById("pdf-export");
      if (!el) {
        alert("No content to export");
        return;
      }
      const canvas = await html2canvas(el, { scale: 2 });
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({ orientation: "portrait", unit: "pt", format: "a4" });
      const imgProps = pdf.getImageProperties(imgData);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
      pdf.save("cpa_report.pdf");
      alert("PDF exported ✅");
    } catch (err) {
      console.error(err);
      alert("PDF export failed");
    }
  }

  // Pie slices for analytics
  const pieSlices = useMemo(() => {
    const r = resultRef.current || calculate();
    const profit = Math.max(0, r.net);
    const ad = r.ad;
    const product = r.product;
    const shipping = r.shipping;
    return [
      { label: t.pieLegend.ad, value: ad, color: "#fb923c" }, // orange
      { label: t.pieLegend.product, value: product, color: "#06b6d4" }, // teal
      { label: t.pieLegend.shipping, value: shipping, color: "#60a5fa" }, // blue
      { label: t.pieLegend.profit, value: profit, color: "#34d399" } // green
    ];
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inputs, rates, lang]);

  // ROI trend (sample)
  const roiTrend = useMemo(() => {
    const base = resultRef.current || calculate();
    const arr = [];
    for (let i = 6; i >= 0; i--) {
      const adTest = Math.max(0, base.ad * (1 - i * 0.05));
      const fake = calculate({ ...inputs, ad: adTest });
      arr.push(Number(fake.roi.toFixed(2)));
    }
    return arr;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inputs, rates]);

  // Break-even price (for one sale) = totalCost
  const breakEvenDZD = useMemo(() => {
    const r = resultRef.current || calculate();
    return r.totalCost || 0;
  }, [inputs, rates]);

  // Donation reminder: once per session after 2 minutes
  const [showDonateReminder, setShowDonateReminder] = useState(false);
  const [showDonateDetails, setShowDonateDetails] = useState(false);
  useEffect(() => {
    const dismissed = sessionStorage.getItem("donateDismissed");
    if (!dismissed) {
      const timer = setTimeout(() => setShowDonateReminder(true), 120000); // 2 minutes
      return () => clearTimeout(timer);
    }
  }, []);

  function handleDonateLater() {
    sessionStorage.setItem("donateDismissed", "1");
    setShowDonateReminder(false);
  }
  function handleDonateYes() {
    setShowDonateReminder(false);
    setShowDonateDetails(true);
  }

  // Rotating tips (change every 6s)
  const [tipIndex, setTipIndex] = useState(0);
  useEffect(() => {
    const tmr = setInterval(() => setTipIndex((i) => (i + 1) % t.advInsightsTips.length), 6000);
    return () => clearInterval(tmr);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lang]);

  // Small UI helpers
  function clampPercent(v) {
    let n = Number(v) || 0;
    if (n < 0) n = 0;
    if (n > 100) n = 100;
    return n;
  }

  /* ---------------------- RENDER ---------------------- */
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 dark:from-slate-800 dark:to-slate-900 text-slate-100 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <header className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-teal-300 to-indigo-400 flex items-center justify-center text-slate-900 font-extrabold shadow-lg">CPA</div>
            <div>
              <h1 className="text-xl md:text-2xl font-bold">{t.title}</h1>
              <p className="text-sm text-slate-300">{t.subtitle}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-sm text-slate-300">{t.selectLang}</div>
            <select value={lang} onChange={(e) => setLang(e.target.value)} className="bg-white/6 text-slate-100 px-3 py-2 rounded">
              <option value="ar">{DICT.ar.langName}</option>
              <option value="en">{DICT.en.langName}</option>
            </select>

            <button onClick={() => setDark((d) => !d)} className="px-3 py-2 rounded bg-white/6 hover:bg-white/8" title={t.theme}>
              {dark ? "🌙" : "☀️"}
            </button>
          </div>
        </header>

        {/* Main */}
        <main className="grid md:grid-cols-2 gap-6">
          {/* Left: Inputs */}
          <section className="backdrop-blur-sm bg-white/5 border border-white/6 rounded-2xl p-5 shadow-lg">
            <div className="grid gap-3">
              <div className="flex gap-3 items-start">
                <div className="flex-1">
                  <InputField label={t.product} value={inputs.product} onChange={(v) => handleInputChange("product", v)} currencyLabel={inputs.currency} />
                </div>
                <div className="w-36">
                  <label className="text-slate-300 text-sm">Currency</label>
                  <select value={inputs.currency} onChange={(e) => setInputs((p) => ({ ...p, currency: e.target.value }))} className="w-full mt-2 p-2 rounded-lg bg-white/4">
                    <option value="DZD">DZD</option>
                    <option value="USD">USD</option>
                    <option value="EUR">EUR</option>
                  </select>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-3">
                <InputField label={t.shipping} value={inputs.shipping} onChange={(v) => handleInputChange("shipping", v)} />
                <InputField label={t.ad} value={inputs.ad} onChange={(v) => handleInputChange("ad", v)} />
              </div>

              <div>
                <InputField label={t.price} value={inputs.price} onChange={(v) => handleInputChange("price", v)} currencyLabel={inputs.currency} />
              </div>

              <div className="grid md:grid-cols-2 gap-3">
                <InputField label={t.conf} value={inputs.conf} onChange={(v) => handleInputChange("conf", clampPercent(v))} min={0} max={100} step={0.1} />
                <InputField label={t.del} value={inputs.del} onChange={(v) => handleInputChange("del", clampPercent(v))} min={0} max={100} step={0.1} />
              </div>

              <div className="flex gap-2 mt-2">
                <button onClick={() => calculate()} className="px-4 py-2 rounded-lg bg-gradient-to-r from-teal-400 to-indigo-500 text-slate-900 font-semibold shadow-md">{t.calc}</button>
                <button onClick={() => exportCSV()} className="px-3 py-2 rounded-lg bg-white/6 border">{t.exportCSV}</button>
                <button onClick={() => exportPDF()} className="px-3 py-2 rounded-lg bg-white/6 border">{t.exportPDF}</button>
                <button onClick={() => copyShareLink()} className="px-3 py-2 rounded-lg bg-white/6 border">{t.share}</button>
              </div>

              {/* exchange rates */}
              <div className="grid md:grid-cols-2 gap-3 mt-2">
                <div>
                  <label className="text-xs text-slate-400">USD → DZD</label>
                  <input value={rates.USD} onChange={(e) => setRate("USD", e.target.value)} type="number" step="0.01" className="w-full mt-2 p-2 rounded-lg bg-white/4 text-sm" />
                </div>
                <div>
                  <label className="text-xs text-slate-400">EUR → DZD</label>
                  <input value={rates.EUR} onChange={(e) => setRate("EUR", e.target.value)} type="number" step="0.01" className="w-full mt-2 p-2 rounded-lg bg-white/4 text-sm" />
                </div>
              </div>
            </div>
          </section>

          {/* Right: Results & Analytics */}
          <aside className="backdrop-blur-sm bg-white/4 border border-white/6 rounded-2xl p-5 shadow-lg flex flex-col gap-4">
            <div className="flex justify-between items-start">
              <div>
                <div className="text-slate-300 text-sm">{t.analytics}</div>
                <div className="text-2xl font-bold">{resultRef.current ? (resultRef.current.success * 100).toFixed(2) + "%" : "—"}</div>
                <div className="text-sm text-slate-400 mt-1">{t.conversion}</div>
              </div>

              <div className="text-right">
                <div className="text-sm text-slate-300">Net profit</div>
                <div className="text-2xl font-bold mt-1">{resultRef.current ? `${moneyFmt(resultRef.current.net)} DZD` : "—"}</div>
                <div className="text-xs text-slate-400 mt-1">per delivered sale</div>
              </div>
            </div>

            {/* metric cards */}
            <div className="grid grid-cols-2 gap-2">
              <MetricCard title={t.roi} value={resultRef.current ? `${resultRef.current.roi.toFixed(2)} %` : "—"} />
              <MetricCard title={t.costRatio} value={resultRef.current ? `${resultRef.current.costRatio.toFixed(2)} %` : "—"} />
              <MetricCard title={t.pieLegend.ad} value={resultRef.current ? `${moneyFmt(resultRef.current.ad)} DZD` : "—"} />
              <MetricCard title={t.margin} value={resultRef.current ? `${resultRef.current.margin.toFixed(2)} %` : "—"} />
            </div>

            {/* charts + legend */}
            <div className="flex gap-4 items-center">
              <div id="pdf-export" className="p-2 bg-transparent rounded">
                <PieChart slices={pieSlices} size={160} />
              </div>
              <div className="flex-1">
                {pieSlices.map((s, i) => (
                  <div key={i} className="flex items-center gap-3 mb-1">
                    <div style={{ width: 14, height: 14, background: s.color }} className="rounded" />
                    <div className="text-sm">{s.label}: <strong>{moneyFmt(s.value)} DZD</strong></div>
                  </div>
                ))}
              </div>
            </div>

            {/* ROI trend + break-even bar */}
            <div className="grid grid-cols-1 gap-2">
              <div>
                <div className="text-sm text-slate-300 mb-1">ROI trend (sample)</div>
                <div className="bg-white/5 p-2 rounded"><svg width="260" height="80"><polyline fill="none" stroke="#34d399" strokeWidth="2" points={roiTrend.map((v, i) => `${i * (260 / (roiTrend.length - 1 || 1))},${80 - ((v - Math.min(...roiTrend)) / (Math.max(...roiTrend) - Math.min(...roiTrend) || 1)) * 70}`).join(" ")} /></svg></div>
              </div>

              <div>
                <div className="text-sm text-slate-300 mb-1">{t.breakEven}</div>
                <div className="flex items-center gap-3">
                  <div className="flex-1">
                    <BarChart labels={[t.breakEvenLabel, t.price]} values={[fromDZD(breakEvenDZD), inputs.price]} width={240} height={90} color="#60a5fa" />
                  </div>
                  <div className="text-sm">
                    <div>{t.breakEvenLabel}: <strong>{moneyFmt(fromDZD(breakEvenDZD))} {inputs.currency}</strong></div>
                    <div className="text-xs text-slate-400">Price: <strong>{moneyFmt(inputs.price)} {inputs.currency}</strong></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Risk management / tips */}
            <div className="mt-2 p-3 rounded-lg bg-white/6">
              <div className="flex justify-between items-center">
                <div>
                  <div className="text-sm font-semibold">{t.advInsights}</div>
                  <div className="text-xs text-slate-300 mt-1">{t.advInsightsTipTitle}</div>
                </div>
              </div>
              <div className="mt-2">
                <div className="text-sm text-slate-200 transition-opacity">{t.advInsightsTips[tipIndex]}</div>
                <div className="text-xs text-slate-400 mt-2">• {t.advInsightsTips[(tipIndex + 1) % t.advInsightsTips.length]}</div>
              </div>
            </div>
          </aside>
        </main>

        {/* Footer */}
        <footer className="mt-6 text-center text-sm text-slate-400">
          Made with ❤️ — share in Telegram groups & e-commerce chats.
        </footer>

        {/* Donation reminder modal */}
        {showDonateReminder && (
          <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/60 p-4">
            <div className="bg-white/6 rounded-lg p-5 max-w-md w-full">
              <div className="text-lg font-bold mb-2">{t.donateReminderTitle}</div>
              <div className="flex gap-2 justify-end mt-4">
                <button onClick={handleDonateLater} className="px-3 py-2 rounded bg-white/6"> {t.donateLater} </button>
                <button onClick={handleDonateYes} className="px-3 py-2 rounded bg-gradient-to-r from-yellow-400 to-pink-400 text-slate-900">{t.donateYes}</button>
              </div>
            </div>
          </div>
        )}

        {/* Donation details modal */}
        {showDonateDetails && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
            <div className="bg-white/5 rounded-lg p-6 max-w-lg w-full">
              <h3 className="text-xl font-semibold mb-2">{t.donateDetailsTitle}</h3>
              <div className="text-sm text-slate-200 mb-3">{DONATION.message[lang === "ar" ? "ar" : "en"]}</div>

              <div className="grid gap-2">
                <div className="p-3 rounded bg-white/6">
                  <div className="text-xs text-slate-300">BaridiMob</div>
                  <div className="font-semibold">{DONATION.baridimob}</div>
                </div>
                <div className="p-3 rounded bg-white/6">
                  <div className="text-xs text-slate-300">PayPal</div>
                  <div className="font-semibold">{DONATION.paypal}</div>
                </div>
                <div className="p-3 rounded bg-white/6">
                  <div className="text-xs text-slate-300">Ko-fi</div>
                  <div className="font-semibold">{DONATION.kofi}</div>
                </div>
                <div className="p-3 rounded bg-white/6">
                  <div className="text-xs text-slate-300">RedotPay</div>
                  <div className="font-semibold">{DONATION.redotpay}</div>
                </div>
              </div>

              <div className="flex gap-2 justify-end mt-4">
                <button onClick={() => setShowDonateDetails(false)} className="px-3 py-2 rounded bg-white/6">Close</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
