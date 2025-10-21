/* eslint-disable react/jsx-key */
/**
 * Full upgraded App.js
 * - Integrates Recharts, translations (AR/EN), language dropdown, donation modal
 * - Fixes input focus bug by moving InputField outside parent
 * - Replaces long failure paragraph with tips and renames "الميزات المتقدمة" -> "إدارة المخاطر"
 * - Adds analytics charts (Pie, Bar, Line) with colors
 * - Fixes PDF export race condition using resultRef + dynamic imports
 * - Theme toggle persists in localStorage
 *
 * Before deploying:
 * - Replace DONATION.* placeholders with your real BaridiMob / PayPal / Ko-fi / RedotPay info
 * - Ensure node modules: recharts, html2canvas, jspdf, react-hot-toast, lucide-react are installed
 */

"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip as ReTooltip,
  Legend as ReLegend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  LineChart,
  Line,
} from "recharts";
import toast, { Toaster } from "react-hot-toast";
import { Sun, Moon, DownloadCloud, Coffee, Globe } from "lucide-react";

// ---------- TRANSLATIONS ----------
const DICT = {
  ar: {
    langName: "العربية",
    title: "حاسبة أرباح COD — الجزائر",
    subtitle: "حاسبة سريعة للبائعين COD (دعم DZD / USD / EUR)",
    tabs: ["الرئيسية", "التحليلات", "إدارة المخاطر", "المميز"],
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
      "ابدأ بميزانية صغيرة للاختبار قبل التوسع.",
      "راجع نسبة التأكيد يومياً وحسّن خدمة العملاء.",
      "اختبر أسعار مختلفة للعثور على نقطة التعادل."
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
    breakEvenLabel: "سعر التعادل",
    invalidInputMsg: "تم تصحيح القيم غير الصالحة",
  },
  en: {
    langName: "English",
    title: "COD Profit Calculator — ALGERIA",
    subtitle: "Quick calculator for COD sellers (supports DZD / USD / EUR)",
    tabs: ["Home", "Analytics", "Risk Management", "Premium"],
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
      "Start with a small test ad budget before scaling.",
      "Monitor confirmation rates and improve customer support.",
      "Test different prices to find break-even."
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
    breakEvenLabel: "Break-even price",
    invalidInputMsg: "Invalid inputs auto-corrected",
  },
};

// ---------- DONATION PLACEHOLDERS ----------
const DONATION = {
  baridimob: "BaridiMob: 05XX XXX XXX",
  paypal: "PayPal: https://paypal.me/YOUR_PAYPAL",
  kofi: "Ko-fi: https://ko-fi.com/YOUR_PAGE",
  redotpay: "RedotPay: https://redotpay.example/your-link",
  message: {
    ar: "شكراً على دعمك! أي مساهمة تساعد في تطوير أدوات أفضل للبائعين.",
    en: "Thanks for supporting! Any donation helps us build better tools."
  }
};

// ---------- SMALL HELPERS ----------
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

// ---------- STABLE CHILD COMPONENTS (prevent re-creation causing focus loss) ----------
function InputField({ label, value, onValue, min, max, step, unit }) {
  // local text input to keep focus stable while typing
  const [local, setLocal] = useState(String(value ?? ""));
  useEffect(() => setLocal(String(value ?? "")), [value]);
  return (
    <div>
      <label className="text-slate-300 text-sm">{label}{unit ? ` (${unit})` : ""}</label>
      <input
        value={local}
        onChange={(e) => setLocal(e.target.value)}
        onBlur={() => {
          let n = Number(local);
          if (Number.isNaN(n)) n = 0;
          if (min !== undefined && n < min) n = min;
          if (max !== undefined && n > max) n = max;
          if (step) n = Math.round(n / step) * step;
          setLocal(String(n));
          onValue(n);
        }}
        inputMode="decimal"
        className="w-full mt-2 p-3 rounded-lg bg-white/4 text-slate-100 outline-none"
      />
    </div>
  );
}

function MetricCard({ title, value, small }) {
  return (
    <div className="p-3 rounded-lg bg-white/6">
      <div className="text-xs text-slate-300">{title}</div>
      <div className="font-semibold mt-1">{value}</div>
      {small && <div className="text-xs text-slate-400 mt-1">{small}</div>}
    </div>
  );
}

// ---------- MAIN APP ----------
export default function App() {
  // language + translation
  const [lang, setLang] = useState("ar");
  const t = DICT[lang] || DICT.ar;

  // theme
  const [dark, setDark] = useState(() => {
    try {
      const v = localStorage.getItem("cpa-theme");
      if (v) return v === "dark";
    } catch { }
    return true;
  });
  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
    try { localStorage.setItem("cpa-theme", dark ? "dark" : "light"); } catch { }
  }, [dark]);

  // inputs (numbers)
  const [inputs, setInputs] = useState({
    product: 2600,
    shipping: 0,
    ad: 500,
    price: 4950,
    conf: 50,
    del: 50,
    currency: "DZD"
  });

  // exchange rates
  const [rates, setRates] = useState({ USD: 129.57, EUR: 150.97 });

  // result ref (for safe export) + state bump for re-render
  const resultRef = useRef(null);
  const [, bump] = useState(0);

  // core calculation (returns result object and writes to resultRef)
  const calculate = useCallback((override = null) => {
    const current = override || inputs;
    // convert to DZD
    const conv = (v) => {
      const n = Number(v) || 0;
      if (current.currency === "DZD") return n;
      if (current.currency === "USD") return n * Number(rates.USD);
      if (current.currency === "EUR") return n * Number(rates.EUR);
      return n;
    };
    const product = conv(current.product);
    const shipping = conv(current.shipping);
    const ad = conv(current.ad);
    const price = conv(current.price);
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
    const res = { product, shipping, ad, price, success, effAd, totalCost, net, margin, maxAd, roi, conversion, costRatio };
    resultRef.current = res;
    bump((s) => s + 1);
    return res;
  }, [inputs, rates]);

  useEffect(() => {
    calculate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // handlers
  const setInput = (key, value) => {
    // clamp percentages
    if (key === "conf" || key === "del") {
      value = Math.max(0, Math.min(100, Number(value) || 0));
    }
    setInputs((p) => {
      const next = { ...p, [key]: value };
      calculate(next);
      return next;
    });
  };

  // share link
  const copyShareLink = () => {
    try {
      const params = new URLSearchParams(inputs).toString();
      const url = `${window.location.origin}${window.location.pathname}?${params}`;
      navigator.clipboard.writeText(url);
      toast.success("Link copied ✅");
    } catch {
      toast.error("Copy failed");
    }
  };

  // CSV export
  const exportCSV = () => {
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
    toast.success("CSV exported");
  };

  // PDF export with dynamic import safety
  const exportPDF = async () => {
    const r = resultRef.current;
    if (!r) {
      toast.error(t.pdfError);
      return;
    }
    try {
      const html2canvasModule = await import("html2canvas").catch(() => null);
      const jspdfModule = await import("jspdf").catch(() => null);
      if (!html2canvasModule || !jspdfModule) {
        toast.error(t.pdfError);
        return;
      }
      const html2canvas = html2canvasModule.default;
      const jsPDF = jspdfModule.jsPDF || jspdfModule.default?.jsPDF || jspdfModule.default;
      const el = document.getElementById("pdf-content");
      if (!el) {
        toast.error("No content to export");
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
      toast.success("PDF exported ✅");
    } catch (err) {
      console.error(err);
      toast.error("PDF export failed");
    }
  };

  // pie & charts data
  const pieSlices = useMemo(() => {
    const r = resultRef.current || calculate();
    const profit = Math.max(0, r.net);
    return [
      { name: t.pieLegend.ad, value: r.ad, color: "#fb923c" },
      { name: t.pieLegend.product, value: r.product, color: "#06b6d4" },
      { name: t.pieLegend.shipping, value: r.shipping, color: "#60a5fa" },
      { name: t.pieLegend.profit, value: profit, color: "#10b981" }
    ];
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inputs, rates, lang]);

  const roiTrend = useMemo(() => {
    const base = resultRef.current || calculate();
    const arr = [];
    for (let i = 6; i >= 0; i--) {
      const adTest = Math.max(0, base.ad * (1 - (i * 0.05)));
      const fake = calculate({ ...inputs, ad: adTest });
      arr.push({ name: `t-${i}`, roi: Number(fake.roi.toFixed(2)) });
    }
    return arr;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inputs, rates]);

  const breakEven = (resultRef.current && resultRef.current.totalCost) || 0;

  // donation reminder (once per session after 2 minutes)
  const [showDonateReminder, setShowDonateReminder] = useState(false);
  const [showDonateDetails, setShowDonateDetails] = useState(false);
  useEffect(() => {
    const dismissed = sessionStorage.getItem("donateDismissed");
    if (!dismissed) {
      const timer = setTimeout(() => setShowDonateReminder(true), 2 * 60 * 1000);
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

  // rotating tips index
  const [tipIndex, setTipIndex] = useState(0);
  useEffect(() => {
    const tmr = setInterval(() => setTipIndex((i) => (i + 1) % (t.advInsightsTips?.length || 3)), 6000);
    return () => clearInterval(tmr);
  }, [lang]);

  // UI state - tabs
  const [activeTab, setActiveTab] = useState(0);

  // currency conversion helpers for showing break-even in selected currency
  const fromDZD = useCallback((dzd) => {
    if (inputs.currency === "DZD") return dzd;
    if (inputs.currency === "USD") return dzd / Number(rates.USD);
    if (inputs.currency === "EUR") return dzd / Number(rates.EUR);
    return dzd;
  }, [inputs, rates]);

  // small input corrections
  useEffect(() => {
    // sanitize negative numbers / out of range
    const sanitized = { ...inputs };
    if (sanitized.product < 0) sanitized.product = 0;
    if (sanitized.shipping < 0) sanitized.shipping = 0;
    if (sanitized.ad < 0) sanitized.ad = 0;
    if (sanitized.price < 0) sanitized.price = 0;
    if (sanitized.conf < 0) sanitized.conf = 0;
    if (sanitized.conf > 100) sanitized.conf = 100;
    if (sanitized.del < 0) sanitized.del = 0;
    if (sanitized.del > 100) sanitized.del = 100;
    setInputs((p) => ({ ...p, ...sanitized }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // render UI
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 dark:from-slate-800 dark:to-slate-900 text-slate-100 p-6 transition">
      <Toaster position="top-right" />
      <div className="max-w-6xl mx-auto">
        {/* header */}
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
              {dark ? <Moon size={16} /> : <Sun size={16} />}
            </button>
          </div>
        </header>

        {/* content */}
        <main className="grid md:grid-cols-2 gap-6">
          {/* inputs */}
          <section className="backdrop-blur-sm bg-white/5 border border-white/6 rounded-2xl p-5 shadow-lg">
            <div className="grid gap-3">
              <div className="flex gap-3 items-start">
                <div className="flex-1">
                  <InputField label={t.product} value={inputs.product} onValue={(v) => setInput("product", v)} unit={inputs.currency} />
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
                <InputField label={t.shipping} value={inputs.shipping} onValue={(v) => setInput("shipping", v)} />
                <InputField label={t.ad} value={inputs.ad} onValue={(v) => setInput("ad", v)} />
              </div>

              <div>
                <InputField label={t.price} value={inputs.price} onValue={(v) => setInput("price", v)} unit={inputs.currency} />
              </div>

              <div className="grid md:grid-cols-2 gap-3">
                <InputField label={t.conf} value={inputs.conf} onValue={(v) => setInput("conf", v)} min={0} max={100} step={0.1} />
                <InputField label={t.del} value={inputs.del} onValue={(v) => setInput("del", v)} min={0} max={100} step={0.1} />
              </div>

              <div className="flex gap-2 mt-2">
                <button onClick={() => calculate()} className="px-4 py-2 rounded-lg bg-gradient-to-r from-teal-400 to-indigo-500 text-slate-900 font-semibold shadow-md">{t.calc}</button>
                <button onClick={() => exportCSV()} className="px-3 py-2 rounded-lg bg-white/6 border">{t.exportCSV}</button>
                <button onClick={() => exportPDF()} className="px-3 py-2 rounded-lg bg-white/6 border">{t.exportPDF}</button>
                <button onClick={() => copyShareLink()} className="px-3 py-2 rounded-lg bg-white/6 border">{t.share}</button>
              </div>

              <div className="grid md:grid-cols-2 gap-3 mt-2">
                <div>
                  <label className="text-xs text-slate-400">USD → DZD</label>
                  <input value={rates.USD} onChange={(e) => setRates((p) => ({ ...p, USD: Number(e.target.value) || 0 }))} type="number" step="0.01" className="w-full mt-2 p-2 rounded-lg bg-white/4 text-sm" />
                </div>
                <div>
                  <label className="text-xs text-slate-400">EUR → DZD</label>
                  <input value={rates.EUR} onChange={(e) => setRates((p) => ({ ...p, EUR: Number(e.target.value) || 0 }))} type="number" step="0.01" className="w-full mt-2 p-2 rounded-lg bg-white/4 text-sm" />
                </div>
              </div>
            </div>
          </section>

          {/* results + analytics */}
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
              <MetricCard title={t.advInsights} value={resultRef.current ? `${resultRef.current.margin.toFixed(2)} %` : "—"} />
            </div>

            {/* charts */}
            <div className="grid md:grid-cols-2 gap-4">
              <div id="pdf-content" className="p-2 bg-transparent rounded">
                <ResponsiveContainer width="100%" height={220}>
                  <PieChart>
                    <Pie data={pieSlices} dataKey="value" nameKey="name" innerRadius={30} outerRadius={80} label>
                      {pieSlices.map((entry, i) => <Cell key={`cell-${i}`} fill={entry.color} />)}
                    </Pie>
                    <ReTooltip />
                    <ReLegend />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="p-3 rounded-lg bg-white/6">
                <div className="text-sm text-slate-300 mb-2">ROI trend (sample)</div>
                <ResponsiveContainer width="100%" height={160}>
                  <LineChart data={roiTrend}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" height={20} />
                    <YAxis />
                    <ReTooltip />
                    <Line type="monotone" dataKey="roi" stroke="#34d399" strokeWidth={2} dot />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* break-even bar */}
            <div>
              <div className="text-sm text-slate-300 mb-1">{t.breakEven}</div>
              <div className="flex items-center gap-3">
                <div className="flex-1">
                  <ResponsiveContainer width="100%" height={90}>
                    <BarChart data={[{ name: t.breakEvenLabel, value: fromDZD(breakEven) }, { name: t.price, value: inputs.price }]}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <ReTooltip />
                      <Bar dataKey="value" fill="#60a5fa" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <div className="text-sm">
                  <div>{t.breakEvenLabel}: <strong>{moneyFmt(fromDZD(breakEven))} {inputs.currency}</strong></div>
                  <div className="text-xs text-slate-400">Price: <strong>{moneyFmt(inputs.price)} {inputs.currency}</strong></div>
                </div>
              </div>
            </div>

            {/* risk management tips */}
            <div className="mt-2 p-3 rounded-lg bg-white/6">
              <div className="flex justify-between items-center">
                <div>
                  <div className="text-sm font-semibold">{t.advInsights}</div>
                  <div className="text-xs text-slate-300 mt-1">{t.advInsightsTipTitle}</div>
                </div>
              </div>
              <ul className="mt-2 ml-4">
                <li className="text-sm text-slate-200 mb-1">• {t.advInsightsTips[tipIndex]}</li>
                <li className="text-xs text-slate-400 mt-2">• {t.advInsightsTips[(tipIndex + 1) % t.advInsightsTips.length]}</li>
              </ul>
            </div>
          </aside>
        </main>

        <footer className="mt-6 text-center text-sm text-slate-400">
          Made with ❤️ — share in Telegram groups & e-commerce chats.
        </footer>

        {/* donation modals */}
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
