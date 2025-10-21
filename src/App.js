"use client"

import { useEffect, useState, useCallback, useMemo } from "react"
import { Toaster, toast } from "react-hot-toast"
import {
  Moon,
  Sun,
  Copy,
  Download,
  LinkIcon,
  Info,
  RotateCcw,
  RotateCw,
  Save,
  Trash2,
  Plus,
  BarChart3,
  Lock,
  AlertCircle,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Calculator,
} from "lucide-react"

// --- CONFIGURATION ---
const CONFIG = {
  donation: {
    paypal: "https://www.paypal.me/YOUR_PAYPAL",
    kofi: "https://ko-fi.com/YOUR_KOFI",
    baridimob: "YOUR_BARIDIMOB_RIP_OR_PHONE",
    redotpay: "https://redotpay.example/your-link",
  },
  initialInputs: {
    product: "2600",
    shipping: "0",
    ad: "500",
    price: "4950",
    conf: "50",
    del: "50",
    currency: "DZD", // Added default currency
  },
  exchangeRates: {
    // Renamed initialRates to exchangeRates
    DZD: 1,
    USD: 134.5,
    EUR: 145.2,
  },
  premiumPassword: "2015",
}

// --- TRANSLATIONS ---
const TRANSLATIONS = {
  ar: {
    title: "حاسبة أرباح COD — الجزائر",
    subtitle: "أداة احترافية لبائعي الدفع عند الاستلام",
    product: "تكلفة المنتج",
    shipping: "تكلفة الشحن",
    ad: "تكلفة الإعلان لكل طلب",
    price: "سعر البيع للزبون",
    conf: "نسبة التأكيد (%)",
    del: "نسبة التوصيل (%)",
    currency: "العملة",
    calc: "احسب",
    calculate: "احسب الآن", // Added "calculate" translation
    share: "نسخ الرابط",
    export: "تصدير",
    dark: "الوضع الداكن",
    light: "الوضع المضيء",
    successRate: "نسبة النجاح الإجمالية",
    netProfit: "الربح الصافي (لكل طلب ناجح)",
    netProfitDesc: "صافي الربح لكل عملية بيع مسلمة",
    profitMargin: "هامش الربح",
    maxAd: "أقصى تكلفة إعلان مسموح بها",
    effAd: "تكلفة الإعلان الفعلية (لكل طلب ناجح)",
    totalCost: "التكلفة الإجمالية (لكل طلب ناجح)",
    resultStatus: (net) => (net < 0 ? "خسارة: حاول تخفيض تكلفة الإعلان أو زيادة السعر." : "مربح: عمل جيد، استمر!"),
    calculating: "أدخل الأرقام واضغط احسب", // Updated calculating text
    copied: "تم نسخ الرابط بنجاح!",
    copyFailed: "فشل النسخ.",
    baridimobTitle: "الدفع عبر بريدي موب",
    baridimobInstructions: "للدعم، يرجى فتح تطبيق بريدي موب وتحويل المبلغ إلى الحساب التالي:",
    baridimobCopied: "تم نسخ الرقم!",
    history: "السجل",
    presets: "القوالب المحفوظة",
    analytics: "التحليلات",
    comparison: "المقارنة",
    premium: "ميزات متقدمة",
    savePreset: "حفظ كقالب",
    presetName: "اسم القالب",
    breakEven: "نقطة التعادل",
    roi: "العائد على الاستثمار",
    projectedProfit: "الربح المتوقع (100 طلب)",
    clearHistory: "مسح السجل",
    noHistory: "لا توجد عمليات حسابية بعد",
    noPresets: "لا توجد قوالب محفوظة",
    undo: "تراجع",
    redo: "إعادة",
    exportJSON: "تصدير JSON",
    exportCSV: "تصدير CSV",
    exportPDF: "تصدير PDF",
    addToComparison: "إضافة للمقارنة",
    compareScenarios: "مقارنة السيناريوهات",
    removeFromComparison: "إزالة من المقارنة",
    returnFee: "رسوم الإرجاع (عندما لا يستلم الزبون)",
    returnRate: "نسبة الإرجاع (%)",
    riskAnalysis: "تحليل المخاطر",
    profitWithRisk: "الربح مع المخاطر",
    expectedLoss: "الخسارة المتوقعة من الإرجاع",
    riskAdjustedProfit: "الربح المعدل بالمخاطر",
    premiumFeatures: "الميزات المتقدمة",
    enterPassword: "أدخل كلمة المرور",
    unlock: "فتح",
    locked: "مقفول",
    tips: "نصائح ذكية",
    improvementSuggestions: "اقتراحات التحسين",
    supportAlert: "شكراً لاستخدامك الحاسبة! هل تود دعم المطور؟",
    supportAlertDesc: "يمكنك المساهمة بأي مبلغ لدعم تطوير هذه الأداة المجانية.",
    notNow: "ليس الآن",
    supportNow: "ادعم الآن",
    tauxRetour: "نسبة الإرجاع المحسوبة", // Added Taux de Retour translation
    tauxEchec: "نسبة الفشل (عدم التأكيد أو عدم التوصيل)",
    tauxEchecDesc:
      "النسبة المئوية للطلبات التي لم تُؤكد أو لم تُسلم بنجاح. تُحسب من: 100% - (نسبة التأكيد × نسبة التوصيل)",
    tauxRetourClient: "نسبة إرجاع العملاء",
    tauxRetourClientDesc: "النسبة المئوية للطلبات المسلمة بنجاح التي يرجعها العملاء لاحقاً (مختلفة تماماً عن نسبة الفشل)",
  },
  fr: {
    title: "Calculateur de Profit COD — Algérie",
    subtitle: "Outil professionnel pour vendeurs en paiement à la livraison",
    product: "Coût du produit",
    shipping: "Frais de livraison",
    ad: "Coût publicitaire par lead",
    price: "Prix de vente client",
    conf: "Taux de confirmation (%)",
    del: "Taux de livraison (%)",
    currency: "Devise",
    calc: "Calculer",
    calculate: "Calculer maintenant", // Added "calculate" translation
    share: "Copier le lien",
    export: "Exporter",
    dark: "Mode sombre",
    light: "Mode clair",
    successRate: "Taux de succès global",
    netProfit: "Profit net (par commande livrée)",
    netProfitDesc: "Bénéfice net par vente livrée",
    profitMargin: "Marge bénéficiaire",
    maxAd: "Coût publicitaire max avant perte",
    effAd: "Coût pub effectif (par commande livrée)",
    totalCost: "Coût total (par commande livrée)",
    resultStatus: (net) =>
      net < 0
        ? "Perte : Essayez de réduire le coût pub ou d'augmenter le prix."
        : "Rentable : Excellent travail, continuez !",
    calculating: "Entrez les valeurs et cliquez sur Calculer", // Updated calculating text
    copied: "Lien copié avec succès !",
    copyFailed: "La copie a échoué.",
    baridimobTitle: "Paiement par BaridiMob",
    baridimobInstructions:
      "Pour soutenir, veuillez ouvrir votre application BaridiMob et effectuer un virement vers le compte suivant :",
    baridimobCopied: "Numéro copié !",
    history: "Historique",
    presets: "Modèles enregistrés",
    analytics: "Analyses",
    comparison: "Comparaison",
    premium: "Fonctionnalités avancées",
    savePreset: "Enregistrer comme modèle",
    presetName: "Nom du modèle",
    breakEven: "Point d'équilibre",
    roi: "Retour sur investissement",
    projectedProfit: "Profit projeté (100 commandes)",
    clearHistory: "Effacer l'historique",
    noHistory: "Aucun calcul pour le moment",
    noPresets: "Aucun modèle enregistré",
    undo: "Annuler",
    redo: "Refaire",
    exportJSON: "Exporter JSON",
    exportCSV: "Exporter CSV",
    exportPDF: "Exporter PDF",
    addToComparison: "Ajouter à la comparaison",
    compareScenarios: "Comparer les scénarios",
    removeFromComparison: "Retirer de la comparaison",
    returnFee: "Frais de retour (quand le client ne récupère pas)",
    returnRate: "Taux de retour (%)",
    riskAnalysis: "Analyse des risques",
    profitWithRisk: "Profit avec risques",
    expectedLoss: "Perte attendue des retours",
    riskAdjustedProfit: "Profit ajusté au risque",
    premiumFeatures: "Fonctionnalités avancées",
    enterPassword: "Entrez le mot de passe",
    unlock: "Déverrouiller",
    locked: "Verrouillé",
    tips: "Conseils intelligents",
    improvementSuggestions: "Suggestions d'amélioration",
    supportAlert: "Merci d'utiliser la calculatrice! Voulez-vous soutenir le développeur?",
    supportAlertDesc:
      "Vous pouvez contribuer n'importe quel montant pour soutenir le développement de cet outil gratuit.",
    notNow: "Pas maintenant",
    supportNow: "Soutenir maintenant",
    tauxRetour: "Taux de retour calculé", // Added Taux de Retour translation
    tauxEchec: "Taux d'échec (non-confirmation ou non-livraison)",
    tauxEchecDesc:
      "Pourcentage de commandes non confirmées ou non livrées avec succès. Calculé à partir de: 100% - (Taux de confirmation × Taux de livraison)",
    tauxRetourClient: "Taux de retour client",
    tauxRetourClientDesc:
      "Pourcentage de commandes livrées avec succès que les clients retournent ultérieurement (complètement différent du taux d'échec)",
  },
}

// --- HELPER FUNCTIONS ---
function moneyFmt(num) {
  if (!isFinite(num)) return "—"
  return (Math.round(num * 100) / 100).toLocaleString("en-US")
}

function generateSmartTips(inputs, result) {
  const tips = []
  const conf = Number(inputs.conf) || 0
  const del = Number(inputs.del) || 0
  const margin = result?.margin || 0
  const net = result?.net || 0
  const success = result?.success || 0
  const returnRate = result?.returnRate || 0 // Use result.returnRate for analysis

  // Confirmation Rate Analysis
  if (conf < 30) {
    tips.push({
      type: "error",
      text: "نسبة التأكيد منخفضة جداً (أقل من 30%). ركز على: 1) تحسين جودة الصور والوصف، 2) تقليل السعر مؤقتاً، 3) تحسين استهداف الإعلانات.",
      textFr:
        "Taux de confirmation très faible (<30%). Améliorez: 1) Qualité des images/descriptions, 2) Réduisez temporairement le prix, 3) Affinage du ciblage publicitaire.",
    })
  } else if (conf < 50) {
    tips.push({
      type: "warning",
      text: "نسبة التأكيد متوسطة (30-50%). جرب: 1) عروض محدودة الوقت، 2) إضافة ضمان أو استرجاع مجاني، 3) تحسين سرعة الرد على الاستفسارات.",
      textFr:
        "Taux de confirmation moyen (30-50%). Essayez: 1) Offres limitées dans le temps, 2) Garantie/retour gratuit, 3) Améliorer la réactivité.",
    })
  } else if (conf >= 70) {
    tips.push({
      type: "success",
      text: "ممتاز! نسبة تأكيد عالية جداً (70%+). استثمر أكثر في الإعلانات وزيادة حجم الطلبات.",
      textFr: "Excellent! Taux de confirmation très élevé (70%+). Augmentez le budget publicitaire et le volume.",
    })
  }

  // Delivery Rate Analysis
  if (del < 40) {
    tips.push({
      type: "error",
      text: "نسبة التوصيل منخفضة جداً (أقل من 40%). المشكلة قد تكون: 1) شركة توصيل غير موثوقة، 2) مناطق توصيل بعيدة، 3) أسعار شحن عالية جداً.",
      textFr:
        "Taux de livraison très faible (<40%). Problèmes possibles: 1) Prestataire peu fiable, 2) Zones éloignées, 3) Frais trop élevés.",
    })
  } else if (del < 70) {
    tips.push({
      type: "warning",
      text: "نسبة التوصيل متوسطة (40-70%). حسّن: 1) اختر شركة توصيل أفضل، 2) قلل مناطق التوصيل البعيدة، 3) تحسين التواصل مع العملاء.",
      textFr:
        "Taux de livraison moyen (40-70%). Améliorez: 1) Meilleur prestataire, 2) Réduisez les zones éloignées, 3) Communication client.",
    })
  } else if (del >= 85) {
    tips.push({
      type: "success",
      text: "رائع! نسبة توصيل عالية جداً (85%+). حافظ على هذا المستوى وركز على زيادة الطلبات.",
      textFr: "Très bien! Taux de livraison excellent (85%+). Maintenez ce niveau et augmentez le volume.",
    })
  }

  // Profit Margin Analysis
  if (margin < 5 && margin > 0) {
    tips.push({
      type: "warning",
      text: "هامش الربح منخفض جداً (أقل من 5%). خيارات: 1) زيادة السعر بـ 5-10%، 2) تقليل تكاليف الإعلان، 3) البحث عن موردين أرخص.",
      textFr:
        "Marge très faible (<5%). Options: 1) Augmentez le prix de 5-10%, 2) Réduisez les coûts pub, 3) Trouvez des fournisseurs moins chers.",
    })
  } else if (margin >= 20 && margin < 35) {
    tips.push({
      type: "info",
      text: "هامش ربح جيد (20-35%). يمكنك: 1) زيادة الإنفاق على الإعلانات بـ 20-30%، 2) توسيع نطاق المنتجات، 3) استثمار في تحسين الخدمة.",
      textFr:
        "Bonne marge (20-35%). Vous pouvez: 1) Augmentez le budget pub de 20-30%, 2) Élargir la gamme, 3) Améliorer le service.",
    })
  } else if (margin >= 35) {
    tips.push({
      type: "success",
      text: "هامش ربح ممتاز جداً (35%+)! استثمر بقوة: 1) زيادة الإنفاق على الإعلانات بـ 50%+، 2) توسيع السوق، 3) بناء علامة تجارية قوية.",
      textFr:
        "Marge excellente (35%+)! Investissez fortement: 1) Augmentez le budget pub de 50%+, 2) Expansion, 3) Branding.",
    })
  }

  // Return Rate Analysis
  if (returnRate > 50) {
    tips.push({
      type: "error",
      text: "نسبة الإرجاع عالية جداً (أكثر من 50%). هذا يعني خسارة محتملة. حسّن: 1) جودة المنتج، 2) وصف دقيق للمنتج، 3) صور واضحة وحقيقية.",
      textFr:
        "Taux de retour très élevé (>50%). Risque de perte. Améliorez: 1) Qualité produit, 2) Description précise, 3) Photos authentiques.",
    })
  } else if (returnRate > 30) {
    tips.push({
      type: "warning",
      text: "نسبة الإرجاع معتدلة (30-50%). عمل جيد لكن يمكن تحسينه: 1) اطلب تقييمات العملاء، 2) حسّن الوصف، 3) أضف ضمان.",
      textFr:
        "Taux de retour modéré (30-50%). Bon mais améliorable: 1) Demandez des avis, 2) Améliorez la description, 3) Ajoutez une garantie.",
    })
  }

  // Net Profit Analysis
  if (net < 0) {
    tips.push({
      type: "error",
      text: "أنت تخسر المال على كل طلب! حل سريع: 1) قلل تكاليف الإعلان بـ 30-50%، 2) زد السعر بـ 10-20%، 3) قلل تكاليف الشحن.",
      textFr:
        "Vous perdez de l'argent par commande! Solutions: 1) Réduisez les coûts pub de 30-50%, 2) Augmentez le prix de 10-20%, 3) Réduisez les frais.",
    })
  } else if (net > 0 && net < 200) {
    tips.push({
      type: "info",
      text: "الربح منخفض (أقل من 200 دج). للنمو: 1) زيادة حجم الطلبات، 2) تقليل تكاليف الإعلان بـ 10-15%، 3) البحث عن منتجات أفضل.",
      textFr:
        "Profit faible (<200 DA). Pour croître: 1) Augmentez le volume, 2) Réduisez les coûts pub de 10-15%, 3) Meilleurs produits.",
    })
  } else if (net >= 500) {
    tips.push({
      type: "success",
      text: "ربح قوي جداً (500+ دج)! استراتيجية النمو: 1) زيادة الإنفاق على الإعلانات، 2) توسيع نطاق المنتجات، 3) بناء قائمة عملاء دائمين.",
      textFr:
        "Profit fort (500+ DA)! Stratégie de croissance: 1) Augmentez le budget pub, 2) Diversifiez, 3) Fidélisez les clients.",
    })
  }

  // Success Rate Analysis
  if (success < 0.2) {
    tips.push({
      type: "error",
      text: "معدل النجاح منخفض جداً (أقل من 20%). هذا حرج! راجع: 1) جودة الإعلانات، 2) استهداف الجمهور، 3) سعر المنتج.",
      textFr: "Taux de succès critique (<20%). Vérifiez: 1) Qualité des annonces, 2) Ciblage, 3) Prix du produit.",
    })
  } else if (success >= 0.5) {
    tips.push({
      type: "success",
      text: "معدل نجاح ممتاز (50%+)! أنت تفعل كل شيء بشكل صحيح. الآن: 1) زيادة الحجم، 2) تحسين العمليات، 3) بناء فريق.",
      textFr:
        "Taux de succès excellent (50%+)! Vous faites tout bien. Maintenant: 1) Augmentez le volume, 2) Optimisez, 3) Recrutez.",
    })
  }

  return tips
}

// --- MAIN APP COMPONENT ---
export default function App() {
  const [lang, setLang] = useState("ar")
  const [dark, setDark] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("cpa-theme") !== "light"
    }
    return true
  })
  const [result, setResult] = useState(null)
  const [isModalOpen, setModalOpen] = useState(false)
  const [activeTab, setActiveTab] = useState("calculator")
  const [history, setHistory] = useState([])
  const [presets, setPresets] = useState([])
  const [comparison, setComparison] = useState([])
  const [historyIndex, setHistoryIndex] = useState(-1)
  const [presetName, setPresetName] = useState("")
  const [showPresetModal, setShowPresetModal] = useState(false)
  const [premiumUnlocked, setPremiumUnlocked] = useState(false)
  const [premiumPassword, setPremiumPassword] = useState("")
  const [showPremiumModal, setShowPremiumModal] = useState(false)
  const [showSupportAlert, setShowSupportAlert] = useState(false)

  const [inputs, setInputs] = useState(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search)
      const urlState = {}
      for (const [key, value] of params.entries()) {
        if (key in CONFIG.initialInputs) {
          urlState[key] = value
        }
      }
      return { ...CONFIG.initialInputs, ...urlState }
    }
    return CONFIG.initialInputs
  })

  const [premiumInputs, setPremiumInputs] = useState(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("cod-premium-inputs")
      return saved ? JSON.parse(saved) : { returnFee: "150", returnRate: "5" }
    }
    return { returnFee: "150", returnRate: "5" }
  })

  const t = TRANSLATIONS[lang]

  // --- THEME EFFECT ---
  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark)
    localStorage.setItem("cpa-theme", dark ? "dark" : "light")
  }, [dark])

  // --- URL SYNC EFFECT ---
  useEffect(() => {
    if (typeof window !== "undefined" && result) {
      // Only sync URL if there's a result
      const params = new URLSearchParams(inputs)
      window.history.replaceState(null, "", `?${params.toString()}`)
    }
  }, [inputs, result])

  // --- LOAD PRESETS AND HISTORY ---
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedPresets = localStorage.getItem("cod-presets")
      const savedHistory = localStorage.getItem("cod-history")
      const savedPremium = localStorage.getItem("cod-premium-unlocked")
      if (savedPresets) setPresets(JSON.parse(savedPresets))
      if (savedHistory) setHistory(JSON.parse(savedHistory))
      if (savedPremium) setPremiumUnlocked(JSON.parse(savedPremium))
    }
  }, [])

  useEffect(() => {
    if (typeof window !== "undefined") {
      const alertShown = localStorage.getItem("cod-support-alert-shown")
      if (!alertShown) {
        const timer = setTimeout(
          () => {
            setShowSupportAlert(true)
            localStorage.setItem("cod-support-alert-shown", "true")
          },
          3 * 60 * 1000,
        ) // 3 minutes
        return () => clearTimeout(timer)
      }
    }
  }, [])

  // --- CALCULATION LOGIC ---
  const calculate = useCallback(() => {
    // Convert all values to DZD based on selected currency
    const exchangeRate = CONFIG.exchangeRates[inputs.currency] || 1
    const toDZD = (value) => {
      const v = Number(value) || 0
      return v * exchangeRate
    }

    const product = toDZD(inputs.product)
    const shipping = toDZD(inputs.shipping)
    const ad = toDZD(inputs.ad)
    const price = toDZD(inputs.price)
    const conf = Number(inputs.conf) / 100 || 0
    const del = Number(inputs.del) / 100 || 0

    // Return Rate = 100% - (Confirmation Rate × Delivery Rate)
    const successRate = conf * del
    const returnRate = (1 - successRate) * 100

    const success = successRate
    const effAd = success <= 0.01 ? ad * 100 : ad / success
    const totalCost = product + shipping + effAd
    const net = price - totalCost
    const margin = price === 0 ? 0 : (net / price) * 100

    // Calculate maxAd based on success rate, ensuring it's not negative
    const maxAd = success > 0 ? Math.max(0, success * (price - product - shipping)) : 0

    const breakEven = product + shipping
    const roi = totalCost === 0 ? 0 : (net / totalCost) * 100
    const projectedProfit = net * 100

    const returnFee = toDZD(premiumInputs.returnFee)
    const returnRatePercent = Number(premiumInputs.returnRate) / 100 || 0

    const expectedLoss = returnRatePercent * returnFee
    const riskAdjustedProfit = net - expectedLoss

    const results = {
      success,
      effAd,
      totalCost,
      net,
      margin,
      maxAd,
      breakEven,
      roi,
      projectedProfit,
      returnFee,
      returnRate,
      returnRatePercent,
      expectedLoss,
      riskAdjustedProfit,
    }
    setResult(results)

    const newHistory = history.slice(0, historyIndex + 1)
    newHistory.push({ inputs: { ...inputs }, result: results, timestamp: new Date().toISOString() })
    setHistory(newHistory)
    setHistoryIndex(newHistory.length - 1)
    localStorage.setItem("cod-history", JSON.stringify(newHistory))

    return results
  }, [inputs, premiumInputs])

  // --- HANDLERS ---
  const handleInputChange = (key, value) => {
    let validatedValue = value

    // Validate percentage fields
    if (key === "conf" || key === "del") {
      const numValue = Number(value)
      if (numValue < 0) validatedValue = "0"
      if (numValue > 100) validatedValue = "100"
    }

    // Validate numeric fields (prevent negative)
    if (["product", "shipping", "ad", "price"].includes(key)) {
      const numValue = Number(value)
      if (numValue < 0) validatedValue = "0"
    }

    setInputs((prev) => ({ ...prev, [key]: validatedValue }))
  }

  const handlePremiumInputChange = (key, value) => {
    setPremiumInputs((prev) => {
      const updated = { ...prev, [key]: value }
      localStorage.setItem("cod-premium-inputs", JSON.stringify(updated))
      return updated
    })
  }

  const handleCalculate = () => {
    // Created dedicated handler for calculation button
    calculate()
    toast.success("Calculation completed!")
  }

  const unlockPremium = () => {
    if (premiumPassword === CONFIG.premiumPassword) {
      setPremiumUnlocked(true)
      localStorage.setItem("cod-premium-unlocked", "true")
      setShowPremiumModal(false)
      setPremiumPassword("")
      toast.success("Premium features unlocked!")
    } else {
      toast.error("Incorrect password!")
    }
  }

  const copyShareLink = () => {
    navigator.clipboard
      .writeText(window.location.href)
      .then(() => toast.success(t.copied))
      .catch(() => toast.error(t.copyFailed))
  }

  const exportCSV = () => {
    if (!result) {
      // Added check for result before exporting
      toast.error("Please calculate first")
      return
    }
    const headers = [
      "product",
      "shipping",
      "ad",
      "price",
      "conf",
      "del",
      "currency",
      "success_rate",
      "eff_ad_cost",
      "total_cost",
      "net_profit",
      "profit_margin",
      "max_ad_cost",
      "roi",
      "projected_profit",
      "return_fee",
      "return_rate_percent",
      "expected_loss",
      "risk_adjusted_profit",
    ]
    const data = [
      inputs.product,
      inputs.shipping,
      inputs.ad,
      inputs.price,
      inputs.conf,
      inputs.del,
      inputs.currency,
      (result.success * 100).toFixed(2) + "%",
      isFinite(result.effAd) ? result.effAd.toFixed(2) : "N/A",
      isFinite(result.totalCost) ? result.totalCost.toFixed(2) : "N/A",
      result.net.toFixed(2),
      result.margin.toFixed(2) + "%",
      isFinite(result.maxAd) ? result.maxAd.toFixed(2) : "N/A",
      result.roi.toFixed(2) + "%",
      result.projectedProfit.toFixed(2),
      isFinite(result.returnFee) ? result.returnFee.toFixed(2) : "N/A",
      (result.returnRatePercent * 100).toFixed(2) + "%",
      isFinite(result.expectedLoss) ? result.expectedLoss.toFixed(2) : "N/A",
      isFinite(result.riskAdjustedProfit) ? result.riskAdjustedProfit.toFixed(2) : "N/A",
    ]

    const csvContent = [headers.join(","), data.map((d) => `"${String(d).replace(/"/g, '""')}"`).join(",")].join("\n")
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.setAttribute("href", url)
    link.setAttribute("download", "cod_profit_calculation.csv")
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const savePreset = () => {
    if (!presetName.trim()) {
      toast.error("Please enter a preset name")
      return
    }
    const newPreset = { name: presetName, inputs: { ...inputs }, id: Date.now() } // Removed rates from preset, as they are not directly used in the calculation logic anymore
    const updatedPresets = [...presets, newPreset]
    setPresets(updatedPresets)
    localStorage.setItem("cod-presets", JSON.stringify(updatedPresets))
    setPresetName("")
    setShowPresetModal(false)
    toast.success("Preset saved!")
  }

  const loadPreset = (preset) => {
    setInputs(preset.inputs)
    // No need to set rates explicitly, as they are not part of presets anymore
    toast.success("Preset loaded!")
  }

  const deletePreset = (id) => {
    const updatedPresets = presets.filter((p) => p.id !== id)
    setPresets(updatedPresets)
    localStorage.setItem("cod-presets", JSON.stringify(updatedPresets))
    toast.success("Preset deleted!")
  }

  const undo = () => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1
      setHistoryIndex(newIndex)
      const entry = history[newIndex]
      setInputs(entry.inputs)
      setResult(entry.result)
    }
  }

  const redo = () => {
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1
      setHistoryIndex(newIndex)
      const entry = history[newIndex]
      setInputs(entry.inputs)
      setResult(entry.result)
    }
  }

  const addToComparison = () => {
    if (result && !comparison.some((c) => JSON.stringify(c.inputs) === JSON.stringify(inputs))) {
      setComparison([...comparison, { inputs: { ...inputs }, result }])
      toast.success("Added to comparison!")
    }
  }

  const removeFromComparison = (index) => {
    setComparison(comparison.filter((_, i) => i !== index))
  }

  const clearHistory = () => {
    setHistory([])
    setHistoryIndex(-1)
    localStorage.removeItem("cod-history")
    toast.success("History cleared!")
  }

  return (
    <>
      <Toaster
        position="bottom-center"
        toastOptions={{
          className: "dark:bg-slate-700 dark:text-slate-100",
        }}
      />
      <BaridiMobModal t={t} isOpen={isModalOpen} onClose={() => setModalOpen(false)} />
      <PresetModal
        t={t}
        isOpen={showPresetModal}
        onClose={() => setShowPresetModal(false)}
        presetName={presetName}
        setPresetName={setPresetName}
        onSave={savePreset}
      />
      <PremiumModal
        t={t}
        isOpen={showPremiumModal}
        onClose={() => setShowPremiumModal(false)}
        password={premiumPassword}
        setPassword={setPremiumPassword}
        onUnlock={unlockPremium}
      />
      <SupportAlertModal
        t={t}
        isOpen={showSupportAlert}
        onClose={() => setShowSupportAlert(false)}
        onSupport={() => {
          setModalOpen(true)
          setShowSupportAlert(false)
        }}
      />

      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 text-slate-800 dark:text-slate-100 p-4 sm:p-6 font-sans transition-colors duration-300">
        <div className="max-w-7xl mx-auto">
          <Header lang={lang} setLang={setLang} dark={dark} setDark={setDark} t={t} />

          <div className="flex gap-2 mt-6 flex-wrap">
            {[
              { id: "calculator", label: t.calc, icon: "🧮" },
              { id: "history", label: t.history, icon: "📋" },
              { id: "presets", label: t.presets, icon: "💾" },
              { id: "analytics", label: t.analytics, icon: "📊", premium: true },
              { id: "comparison", label: t.comparison, icon: "⚖️", premium: true },
              {
                id: "riskManagement",
                label: "إدارة المخاطر",
                labelFr: "Gestion des Risques",
                icon: premiumUnlocked ? "🔓" : "🔒",
                premium: true,
              },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => {
                  if ((tab.premium || tab.id === "riskManagement") && !premiumUnlocked) {
                    setShowPremiumModal(true)
                  } else {
                    setActiveTab(tab.id)
                  }
                }}
                className={`px-4 py-2 rounded-lg font-semibold transition-all ${activeTab === tab.id
                    ? "bg-gradient-to-r from-teal-400 to-indigo-500 text-slate-900 shadow-lg"
                    : "bg-slate-200 dark:bg-white/10 hover:bg-slate-300 dark:hover:bg-white/20"
                  }`}
              >
                {tab.icon} {lang === "ar" ? tab.label : tab.labelFr || tab.label}
              </button>
            ))}
          </div>

          {activeTab === "calculator" && (
            <main className="grid lg:grid-cols-2 gap-6 mt-6">
              <InputForm
                inputs={inputs}
                onInputChange={handleInputChange}
                onExport={exportCSV}
                onShare={copyShareLink}
                t={t}
                onUndo={undo}
                onRedo={redo}
                canUndo={historyIndex > 0}
                canRedo={historyIndex < history.length - 1}
                onCalculate={handleCalculate} // Pass onCalculate handler
              />
              <ResultsDisplay
                result={result}
                t={t}
                onBaridiMobClick={() => setModalOpen(true)}
                onAddComparison={addToComparison}
                onSavePreset={() => setShowPresetModal(true)}
              />
            </main>
          )}

          {activeTab === "history" && (
            <HistoryTab
              history={history}
              t={t}
              onLoadEntry={(entry) => {
                setInputs(entry.inputs)
                setResult(entry.result)
              }}
              onClearHistory={clearHistory}
            />
          )}

          {activeTab === "presets" && (
            <PresetsTab
              presets={presets}
              t={t}
              onLoadPreset={loadPreset}
              onDeletePreset={deletePreset}
              onNewPreset={() => setShowPresetModal(true)}
            />
          )}

          {activeTab === "analytics" && premiumUnlocked && (
            <AnalyticsTab result={result} inputs={inputs} t={t} lang={lang} />
          )}

          {activeTab === "comparison" && premiumUnlocked && (
            <ComparisonTab comparison={comparison} t={t} onRemove={removeFromComparison} />
          )}

          {activeTab === "riskManagement" && premiumUnlocked && (
            <PremiumTab
              result={result}
              inputs={inputs}
              premiumInputs={premiumInputs}
              onPremiumInputChange={handlePremiumInputChange}
              onRecalculate={handleCalculate}
              t={t}
              lang={lang}
            />
          )}

          <footer className="mt-8 text-center text-sm text-slate-500 dark:text-slate-400">
            Made with ❤️ for the Algerian E-commerce Community.
          </footer>
        </div>
      </div>
    </>
  )
}

// --- CHILD COMPONENTS ---

function Header({ lang, setLang, dark, setDark, t }) {
  return (
    <header className="flex items-center justify-between gap-4 flex-wrap">
      <div className="flex items-center gap-4">
        <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-teal-400 to-indigo-500 flex items-center justify-center text-slate-900 font-extrabold text-2xl shadow-lg">
          COD
        </div>
        <div>
          <h1 className="text-xl md:text-2xl font-bold">{t.title}</h1>
          <p className="text-sm text-slate-600 dark:text-slate-300">{t.subtitle}</p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <button
          onClick={() => setLang((l) => (l === "ar" ? "fr" : "ar"))}
          className="px-3 py-2 rounded-lg bg-slate-200 dark:bg-white/10 hover:bg-slate-300 dark:hover:bg-white/20 transition font-medium"
        >
          {lang === "ar" ? "FR" : "AR"}
        </button>
        <button
          onClick={() => setDark((d) => !d)}
          title={dark ? t.light : t.dark}
          className="p-2.5 rounded-lg bg-slate-200 dark:bg-white/10 hover:bg-slate-300 dark:hover:bg-white/20 transition"
        >
          {dark ? <Sun size={20} /> : <Moon size={20} />}
        </button>
      </div>
    </header>
  )
}

function InputForm({ inputs, onInputChange, onExport, onShare, t, onUndo, onRedo, canUndo, canRedo, onCalculate }) {
  const InputGroup = ({ label, name, value, onChange, type = "number", min, max, children }) => (
    <div>
      <label htmlFor={name} className="text-sm font-medium text-slate-600 dark:text-slate-300">
        {label}
      </label>
      <div className="relative mt-1">
        <input
          id={name}
          name={name}
          value={value}
          onChange={(e) => onChange(name, e.target.value)}
          type={type}
          min={min}
          max={max}
          className="w-full p-3 rounded-lg bg-slate-200 dark:bg-white/5 placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-indigo-400 transition"
          autoComplete="off"
        />
        {children}
      </div>
    </div>
  )

  return (
    <GlassCard>
      <div className="grid gap-4">
        <div className="flex gap-2">
          <button
            onClick={onUndo}
            disabled={!canUndo}
            className="p-2 rounded-lg bg-slate-200 dark:bg-white/10 hover:bg-slate-300 dark:hover:bg-white/20 disabled:opacity-50 transition"
            title={t.undo}
          >
            <RotateCcw size={18} />
          </button>
          <button
            onClick={onRedo}
            disabled={!canRedo}
            className="p-2 rounded-lg bg-slate-200 dark:bg-white/10 hover:bg-slate-300 dark:hover:bg-white/20 disabled:opacity-50 transition"
            title={t.redo}
          >
            <RotateCw size={18} />
          </button>
        </div>

        <div>
          <label htmlFor="currency" className="text-sm font-medium text-slate-600 dark:text-slate-300">
            {t.currency}
          </label>
          <select
            id="currency"
            value={inputs.currency}
            onChange={(e) => onInputChange("currency", e.target.value)}
            className="w-full p-3 rounded-lg bg-slate-200 dark:bg-white/5 outline-none focus:ring-2 focus:ring-indigo-400 transition mt-1"
          >
            <option value="DZD">DZD (دج)</option>
            <option value="USD">USD ($)</option>
            <option value="EUR">EUR (€)</option>
          </select>
        </div>

        <InputGroup
          label={`${t.product} (${inputs.currency})`}
          name="product"
          value={inputs.product}
          onChange={onInputChange}
        />

        <div className="grid sm:grid-cols-2 gap-4">
          <InputGroup
            label={`${t.shipping} (${inputs.currency})`}
            name="shipping"
            value={inputs.shipping}
            onChange={onInputChange}
          />
          <InputGroup label={`${t.ad} (${inputs.currency})`} name="ad" value={inputs.ad} onChange={onInputChange} />
        </div>

        <InputGroup
          label={`${t.price} (${inputs.currency})`}
          name="price"
          value={inputs.price}
          onChange={onInputChange}
        />

        <div className="grid sm:grid-cols-2 gap-4">
          <InputGroup label={t.conf} name="conf" value={inputs.conf} onChange={onInputChange} min="0" max="100">
            <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none text-slate-400">%</div>
          </InputGroup>
          <InputGroup label={t.del} name="del" value={inputs.del} onChange={onInputChange} min="0" max="100">
            <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none text-slate-400">%</div>
          </InputGroup>
        </div>

        <button
          onClick={onCalculate}
          className="w-full py-3 rounded-lg bg-gradient-to-r from-teal-400 to-indigo-500 text-slate-900 font-bold hover:opacity-90 transition flex items-center justify-center gap-2 shadow-lg"
        >
          <Calculator size={20} />
          {t.calculate}
        </button>

        <div className="flex gap-2 flex-wrap">
          <ActionButton onClick={onShare} icon={<LinkIcon size={16} />} text={t.share} primary={false} />
          <ActionButton onClick={onExport} icon={<Download size={16} />} text={t.export} primary={false} />
        </div>
      </div>
    </GlassCard>
  )
}

function ResultsDisplay({ result, t, onBaridiMobClick, onAddComparison, onSavePreset }) {
  const resultData = useMemo(() => {
    if (!result) return null
    return {
      ...result,
      netColor: result.net > 0 ? "text-green-400" : "text-red-400",
      marginColor: result.margin > 0 ? "text-green-400" : "text-red-400",
      resultBg:
        result.net > 0 ? "bg-gradient-to-r from-green-500 to-teal-500" : "bg-gradient-to-r from-red-500 to-orange-500",
    }
  }, [result])

  const Metric = ({ label, value, currency = "DZD", className = "" }) => (
    <div className={`p-4 rounded-lg bg-slate-200 dark:bg-white/5 ${className}`}>
      <div className="text-xs text-slate-500 dark:text-slate-400">{label}</div>
      <div className="font-semibold mt-1 text-lg">
        {value} {value !== "—" && currency}
      </div>
    </div>
  )

  return (
    <GlassCard className="flex flex-col gap-4">
      {resultData ? (
        <>
          <div className="flex justify-between items-start">
            <div>
              <div className="text-sm text-slate-600 dark:text-slate-300">{t.successRate}</div>
              <div className="text-3xl font-bold mt-1 text-indigo-500 dark:text-indigo-400">
                {(resultData.success * 100).toFixed(2)}%
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm text-slate-600 dark:text-slate-300">{t.netProfit}</div>
              <div className={`text-3xl font-bold mt-1 ${resultData.netColor}`}>
                {moneyFmt(resultData.net)} <span className="text-xl">DZD</span>
              </div>
              <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">{t.netProfitDesc}</div>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-3">
            <Metric
              label={t.profitMargin}
              value={`${resultData.margin >= 0 ? "+" : ""}${resultData.margin.toFixed(2)}`}
              currency="%"
              className={resultData.marginColor}
            />
            <Metric label={t.maxAd} value={moneyFmt(resultData.maxAd)} />
            <Metric label={t.effAd} value={moneyFmt(resultData.effAd)} />
            <Metric label={t.totalCost} value={moneyFmt(resultData.totalCost)} />
          </div>

          <div className="grid sm:grid-cols-2 gap-3">
            <Metric label={t.breakEven} value={moneyFmt(resultData.breakEven)} />
            <Metric label={t.roi} value={`${resultData.roi.toFixed(2)}`} currency="%" />
          </div>

          <Metric label={t.tauxRetour} value={`${resultData.returnRate.toFixed(2)}`} currency="%" />

          <div className={`mt-2 p-4 rounded-lg text-white font-semibold text-center ${resultData.resultBg}`}>
            {t.resultStatus(resultData.net)}
          </div>

          <div className="flex gap-2 flex-wrap">
            <ActionButton
              onClick={onAddComparison}
              icon={<BarChart3 size={16} />}
              text={t.addToComparison}
              primary={false}
            />
            <ActionButton onClick={onSavePreset} icon={<Save size={16} />} text={t.savePreset} primary={false} />
          </div>

          <div className="mt-auto pt-4 border-t border-slate-300 dark:border-white/10">
            <div className="text-sm font-semibold mb-3">Support the Developer ☕</div>
            <div className="flex gap-2 flex-wrap">
              <DonationButton href={CONFIG.donation.paypal} text="PayPal" />
              <DonationButton href={CONFIG.donation.kofi} text="Ko-fi" />
              <DonationButton onClick={onBaridiMobClick} text="BaridiMob" icon={<Info size={14} />} />
              <DonationButton href={CONFIG.donation.redotpay} text="RedotPay" />
            </div>
          </div>
        </>
      ) : (
        <div className="flex items-center justify-center h-full text-slate-500">{t.calculating}</div>
      )}
    </GlassCard>
  )
}

function HistoryTab({ history, t, onLoadEntry, onClearHistory }) {
  return (
    <GlassCard className="mt-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">{t.history}</h2>
        {history.length > 0 && (
          <button
            onClick={onClearHistory}
            className="px-3 py-2 rounded-lg bg-red-500 text-white hover:bg-red-600 transition flex items-center gap-2"
          >
            <Trash2 size={16} /> {t.clearHistory}
          </button>
        )}
      </div>
      {history.length === 0 ? (
        <p className="text-slate-500">{t.noHistory}</p>
      ) : (
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {history.map((entry, idx) => (
            <div key={idx} className="p-3 rounded-lg bg-slate-200 dark:bg-white/5 flex justify-between items-center">
              <div className="text-sm">
                <div className="font-semibold">Profit: {moneyFmt(entry.result.net)} DZD</div>
                <div className="text-xs text-slate-500">{new Date(entry.timestamp).toLocaleString()}</div>
              </div>
              <button
                onClick={() => onLoadEntry(entry)}
                className="px-3 py-1 rounded bg-indigo-500 text-white hover:bg-indigo-600 transition text-sm"
              >
                Load
              </button>
            </div>
          ))}
        </div>
      )}
    </GlassCard>
  )
}

function PresetsTab({ presets, t, onLoadPreset, onDeletePreset, onNewPreset }) {
  return (
    <GlassCard className="mt-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">{t.presets}</h2>
        <button
          onClick={onNewPreset}
          className="px-3 py-2 rounded-lg bg-gradient-to-r from-teal-400 to-indigo-500 text-slate-900 hover:opacity-90 transition flex items-center gap-2"
        >
          <Plus size={16} /> New
        </button>
      </div>
      {presets.length === 0 ? (
        <p className="text-slate-500">{t.noPresets}</p>
      ) : (
        <div className="grid gap-3">
          {presets.map((preset) => (
            <div
              key={preset.id}
              className="p-4 rounded-lg bg-slate-200 dark:bg-white/5 flex justify-between items-center"
            >
              <div>
                <div className="font-semibold">{preset.name}</div>
                <div className="text-sm text-slate-500">
                  Price: {preset.inputs.price} {preset.inputs.currency}
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => onLoadPreset(preset)}
                  className="px-3 py-1 rounded bg-indigo-500 text-white hover:bg-indigo-600 transition text-sm"
                >
                  Load
                </button>
                <button
                  onClick={() => onDeletePreset(preset.id)}
                  className="px-3 py-1 rounded bg-red-500 text-white hover:bg-red-600 transition text-sm"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </GlassCard>
  )
}

function AnalyticsTab({ result, inputs, t, lang }) {
  if (!result) {
    return (
      <GlassCard className="mt-6">
        <p className="text-slate-500">{t.calculating}</p>
      </GlassCard>
    )
  }

  const tips = generateSmartTips(inputs, result)

  return (
    <GlassCard className="mt-6">
      <h2 className="text-xl font-bold mb-4">{t.analytics}</h2>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        <div className="p-4 rounded-lg bg-slate-200 dark:bg-white/5">
          <div className="text-sm text-slate-500">{t.breakEven}</div>
          <div className="text-2xl font-bold mt-2">{moneyFmt(result.breakEven)} DZD</div>
        </div>
        <div className="p-4 rounded-lg bg-slate-200 dark:bg-white/5">
          <div className="text-sm text-slate-500">{t.roi}</div>
          <div className="text-2xl font-bold mt-2 text-green-400">{result.roi.toFixed(2)}%</div>
        </div>
        <div className="p-4 rounded-lg bg-slate-200 dark:bg-white/5">
          <div className="text-sm text-slate-500">{t.projectedProfit}</div>
          <div className="text-2xl font-bold mt-2 text-indigo-400">{moneyFmt(result.projectedProfit)} DZD</div>
        </div>
        <div className="p-4 rounded-lg bg-slate-200 dark:bg-white/5">
          <div className="text-sm text-slate-500">Success Rate</div>
          <div className="text-2xl font-bold mt-2">{(result.success * 100).toFixed(2)}%</div>
        </div>
        <div className="p-4 rounded-lg bg-slate-200 dark:bg-white/5">
          <div className="text-sm text-slate-500">Profit Margin</div>
          <div className="text-2xl font-bold mt-2">{result.margin.toFixed(2)}%</div>
        </div>
        <div className="p-4 rounded-lg bg-slate-200 dark:bg-white/5">
          <div className="text-sm text-slate-500">Taux de Retour</div>
          <div className="text-2xl font-bold mt-2 text-orange-400">{result.returnRate.toFixed(2)}%</div>
        </div>
      </div>

      {tips.length > 0 && (
        <div className="mt-6">
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
            <TrendingUp size={20} />
            {t.tips}
          </h3>
          <div className="space-y-3">
            {tips.map((tip, idx) => {
              const bgColor =
                tip.type === "error"
                  ? "bg-red-500/10 border-red-500/30"
                  : tip.type === "warning"
                    ? "bg-yellow-500/10 border-yellow-500/30"
                    : tip.type === "success"
                      ? "bg-green-500/10 border-green-500/30"
                      : "bg-blue-500/10 border-blue-500/30"

              const iconColor =
                tip.type === "error"
                  ? "text-red-500"
                  : tip.type === "warning"
                    ? "text-yellow-500"
                    : tip.type === "success"
                      ? "text-green-500"
                      : "text-blue-500"

              const Icon = tip.type === "error" ? AlertTriangle : tip.type === "success" ? CheckCircle : AlertCircle

              return (
                <div key={idx} className={`p-4 rounded-lg border ${bgColor} flex gap-3`}>
                  <Icon size={20} className={`flex-shrink-0 mt-0.5 ${iconColor}`} />
                  <p className="text-sm">{lang === "ar" ? tip.text : tip.textFr}</p>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </GlassCard>
  )
}

function ComparisonTab({ comparison, t, onRemove }) {
  if (comparison.length === 0) {
    return (
      <GlassCard className="mt-6">
        <p className="text-slate-500">No scenarios to compare</p>
      </GlassCard>
    )
  }

  return (
    <GlassCard className="mt-6">
      <h2 className="text-xl font-bold mb-4">{t.compareScenarios}</h2>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-300 dark:border-white/10">
              <th className="text-left p-2">Product</th>
              <th className="text-left p-2">Price</th>
              <th className="text-left p-2">Success Rate</th>
              <th className="text-left p-2">Net Profit</th>
              <th className="text-left p-2">Margin</th>
              <th className="text-left p-2">ROI</th>
              <th className="text-left p-2">Action</th>
            </tr>
          </thead>
          <tbody>
            {comparison.map((item, idx) => (
              <tr
                key={idx}
                className="border-b border-slate-300 dark:border-white/10 hover:bg-slate-200 dark:hover:bg-white/5"
              >
                <td className="p-2">{item.inputs.product}</td>
                <td className="p-2">{item.inputs.price}</td>
                <td className="p-2">{(item.result.success * 100).toFixed(2)}%</td>
                <td className="p-2 font-semibold">{moneyFmt(item.result.net)}</td>
                <td className="p-2">{item.result.margin.toFixed(2)}%</td>
                <td className="p-2">{item.result.roi.toFixed(2)}%</td>
                <td className="p-2">
                  <button onClick={() => onRemove(idx)} className="text-red-500 hover:text-red-600">
                    Remove
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </GlassCard>
  )
}

function PremiumTab({ result, inputs, premiumInputs, onPremiumInputChange, onRecalculate, t, lang }) {
  if (!result) {
    return (
      <GlassCard className="mt-6">
        <p className="text-slate-500">{t.calculating}</p>
      </GlassCard>
    )
  }

  const conf = Number(inputs.conf) / 100 || 0
  const del = Number(inputs.del) / 100 || 0
  // Calculate the failure rate based on confirmation and delivery rates
  const failureRate = (1 - conf * del) * 100
  const autoCalculatedReturnRate = failureRate.toFixed(2)

  const InputGroup = ({ label, name, value, onChange, type = "number", info, disabled = false }) => (
    <div>
      <label htmlFor={name} className="text-sm font-medium text-slate-600 dark:text-slate-300 flex items-center gap-2">
        {label}
        {info && (
          <div className="group relative">
            <Info size={16} className="text-slate-400 cursor-help hover:text-slate-300 transition" />
            <div className="absolute bottom-full left-0 mb-2 hidden group-hover:block bg-slate-800 dark:bg-slate-700 text-white text-xs rounded p-3 w-56 z-10 shadow-lg border border-slate-600">
              {info}
            </div>
          </div>
        )}
      </label>
      <div className="relative mt-1">
        <input
          id={name}
          name={name}
          value={value}
          onChange={(e) => onChange(name, e.target.value)}
          type={type}
          disabled={disabled}
          className={`w-full p-3 rounded-lg bg-slate-200 dark:bg-white/5 placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-indigo-400 transition ${disabled ? "cursor-not-allowed opacity-60" : ""
            }`}
          autoComplete="off"
        />
      </div>
    </div>
  )

  const Metric = ({ label, value, currency = "DZD", className = "" }) => (
    <div className={`p-4 rounded-lg bg-slate-200 dark:bg-white/5 ${className}`}>
      <div className="text-xs text-slate-500 dark:text-slate-400">{label}</div>
      <div className="font-semibold mt-1 text-lg">
        {value} {value !== "—" && currency}
      </div>
    </div>
  )

  const breakEvenPrice = result.totalCost
  const breakEvenWithReturns = result.totalCost + result.expectedLoss

  return (
    <GlassCard className="mt-6">
      <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
        <Lock size={20} />
        {t.premiumFeatures}
      </h2>

      <div className="mb-6 p-4 rounded-lg bg-gradient-to-r from-blue-500/10 to-cyan-500/10 border border-blue-500/30">
        <h3 className="font-semibold mb-3 flex items-center gap-2">
          <Info size={18} className="text-blue-500" />
          {lang === "ar" ? "شرح الفرق بين نسبة الفشل ونسبة الإرجاع" : "Différence entre Taux d'Échec et Taux de Retour"}
        </h3>
        <div className="space-y-3 text-sm">
          <div className="p-3 rounded bg-slate-200 dark:bg-white/5">
            <div className="font-semibold text-blue-400 mb-1">{t.tauxEchec}</div>
            <div className="text-slate-700 dark:text-slate-300">{t.tauxEchecDesc}</div>
          </div>
          <div className="p-3 rounded bg-slate-200 dark:bg-white/5">
            <div className="font-semibold text-orange-400 mb-1">{t.tauxRetourClient}</div>
            <div className="text-slate-700 dark:text-slate-300">{t.tauxRetourClientDesc}</div>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Risk Management Section */}
        <div>
          <h3 className="text-lg font-semibold mb-4">⚠️ {t.riskAnalysis}</h3>
          <div className="space-y-4">
            <InputGroup
              label={t.returnFee}
              name="returnFee"
              value={premiumInputs.returnFee}
              onChange={onPremiumInputChange}
              info={
                lang === "ar"
                  ? "رسوم الإرجاع عندما لا يستلم العميل الطلب من شركة التوصيل (مثال: 150 دج)"
                  : "Frais de retour quand le client ne récupère pas la commande (exemple: 150 DA)"
              }
            />

            <InputGroup
              label={t.tauxEchec}
              name="tauxEchec"
              value={autoCalculatedReturnRate}
              disabled={true}
              info={
                lang === "ar"
                  ? "تُحسب تلقائياً من نسبة التأكيد ونسبة التوصيل من التبويب الرئيسي. لا يمكن تعديلها."
                  : "Calculé automatiquement à partir du taux de confirmation et du taux de livraison. Non modifiable."
              }
            />

            <InputGroup
              label={t.tauxRetourClient}
              name="returnRate"
              value={premiumInputs.returnRate}
              onChange={onPremiumInputChange}
              info={
                lang === "ar"
                  ? "النسبة المئوية للطلبات المسلمة التي يرجعها العملاء (مختلفة عن نسبة الفشل أعلاه)"
                  : "Pourcentage de commandes livrées que les clients retournent (différent du taux d'échec ci-dessus)"
              }
            />

            <button
              onClick={onRecalculate}
              className="w-full py-3 rounded-lg bg-gradient-to-r from-amber-400 to-orange-500 text-slate-900 font-bold hover:opacity-90 transition flex items-center justify-center gap-2 shadow-lg mt-2"
            >
              <Calculator size={20} />
              {lang === "ar" ? "إعادة حساب" : "Recalculer"}
            </button>
          </div>
        </div>

        {/* Risk Metrics */}
        <div>
          <h3 className="text-lg font-semibold mb-4">📊 {t.profitWithRisk}</h3>
          <div className="space-y-3">
            <Metric
              label={t.expectedLoss}
              value={moneyFmt(result.expectedLoss)}
              className="bg-red-500/10 border border-red-500/30"
            />
            <Metric
              label={t.riskAdjustedProfit}
              value={moneyFmt(result.riskAdjustedProfit)}
              className={
                result.riskAdjustedProfit > 0
                  ? "bg-green-500/10 border border-green-500/30"
                  : "bg-red-500/10 border border-red-500/30"
              }
            />
            <div className="p-4 rounded-lg bg-slate-200 dark:bg-white/5">
              <div className="text-xs text-slate-500 dark:text-slate-400">
                {lang === "ar" ? "عامل المخاطر" : "Facteur de Risque"}
              </div>
              <div className="text-2xl font-bold mt-2">
                {result.net > 0 ? ((result.expectedLoss / result.net) * 100).toFixed(2) : "—"}%
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Advanced Insights */}
      <div className="mt-6 p-4 rounded-lg bg-gradient-to-r from-indigo-500/10 to-teal-500/10 border border-indigo-500/30">
        <h3 className="font-semibold mb-3 flex items-center gap-2">
          <TrendingUp size={18} />
          Advanced Insights
        </h3>
        <div className="space-y-2 text-sm">
          <p>
            💡 Your profit per order is <strong>{moneyFmt(result.net)} DZD</strong>, but with a{" "}
            <strong>{result.net > 0 ? ((result.expectedLoss / result.net) * 100).toFixed(2) : "—"}%</strong> risk factor
            from returns.
          </p>
          <p>
            📊 After accounting for returns, your adjusted profit is{" "}
            <strong>{moneyFmt(result.riskAdjustedProfit)} DZD</strong> per successful order.
          </p>
          <p>
            🎯 To maintain profitability with this risk level, ensure your success rate stays above{" "}
            <strong>{result.net > 0 ? ((result.expectedLoss / result.net) * 100).toFixed(1) : "—"}%</strong>.
          </p>
        </div>
      </div>

      {/* Break-Even Analysis with Returns */}
      <div className="mt-6 p-4 rounded-lg bg-slate-200 dark:bg-white/5">
        <h3 className="font-semibold mb-3">🎯 Break-Even Analysis with Returns</h3>
        <div className="grid sm:grid-cols-2 gap-3 text-sm">
          <div>
            <div className="text-slate-500">Minimum Selling Price</div>
            <div className="text-xl font-bold text-blue-400">{moneyFmt(breakEvenPrice)} DZD</div>
            <div className="text-xs text-slate-500 mt-1">Price needed to cover all costs</div>
          </div>
          <div>
            <div className="text-slate-500">With Return Risk</div>
            <div className="text-xl font-bold text-orange-400">{moneyFmt(breakEvenWithReturns)} DZD</div>
            <div className="text-xs text-slate-500 mt-1">Price needed after accounting for returns</div>
          </div>
        </div>
      </div>

      {/* Batch Profit Projection */}
      <div className="mt-6 p-4 rounded-lg bg-slate-200 dark:bg-white/5">
        <h3 className="font-semibold mb-3">📈 Batch Profit Projection (100 Orders)</h3>
        <div className="grid sm:grid-cols-3 gap-3 text-sm">
          <div>
            <div className="text-slate-500">Total Revenue</div>
            <div className="text-xl font-bold text-green-400">{moneyFmt(Number(inputs.price) * 100)} DZD</div>
          </div>
          <div>
            <div className="text-slate-500">Total Costs</div>
            <div className="text-xl font-bold text-red-400">{moneyFmt(result.totalCost * 100)} DZD</div>
          </div>
          <div>
            <div className="text-slate-500">Net Profit (with risk)</div>
            <div className="text-xl font-bold text-indigo-400">{moneyFmt(result.riskAdjustedProfit * 100)} DZD</div>
          </div>
        </div>
      </div>

      {/* Scenario Planning */}
      <div className="mt-6 p-4 rounded-lg bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/30">
        <h3 className="font-semibold mb-3 flex items-center gap-2">
          <BarChart3 size={18} />
          Scenario Planning
        </h3>
        <div className="space-y-3 text-sm">
          <div className="p-3 rounded bg-slate-200 dark:bg-white/5">
            <div className="font-semibold mb-1">🟢 Best Case (0% Returns)</div>
            <div className="text-green-400">{moneyFmt(result.net * 100)} DZD for 100 orders</div>
          </div>
          <div className="p-3 rounded bg-slate-200 dark:bg-white/5">
            <div className="font-semibold mb-1">🟡 Current Case ({Number(premiumInputs.returnRate)}% Returns)</div>
            <div className="text-indigo-400">{moneyFmt(result.riskAdjustedProfit * 100)} DZD for 100 orders</div>
          </div>
          <div className="p-3 rounded bg-slate-200 dark:bg-white/5">
            <div className="font-semibold mb-1">🔴 Worst Case (20% Returns)</div>
            <div className="text-orange-400">
              {moneyFmt((result.net - 0.2 * result.returnFee) * 100)} DZD for 100 orders
            </div>
          </div>
        </div>
      </div>

      {/* Profitability Threshold */}
      <div className="mt-6 p-4 rounded-lg bg-slate-200 dark:bg-white/5">
        <h3 className="font-semibold mb-3">⚡ Profitability Threshold</h3>
        <div className="space-y-2 text-sm">
          <p>
            Maximum acceptable return rate:{" "}
            <strong>{result.returnFee > 0 ? ((result.net / result.returnFee) * 100).toFixed(2) : "—"}%</strong>
          </p>
          <p>
            Minimum price to stay profitable: <strong>{moneyFmt(result.totalCost + result.expectedLoss)} DZD</strong>
          </p>
          <p>
            Maximum ad spend per order: <strong>{moneyFmt(result.maxAd)} DZD</strong>
          </p>
        </div>
      </div>

      {/* Customer Lifetime Value */}
      <div className="mt-6 p-4 rounded-lg bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border border-cyan-500/30">
        <h3 className="font-semibold mb-3 flex items-center gap-2">
          <TrendingUp size={18} />
          Customer Lifetime Value (CLV)
        </h3>
        <div className="space-y-2 text-sm">
          <p>
            If customers make 3 repeat purchases: <strong>{moneyFmt(result.riskAdjustedProfit * 3)} DZD</strong>
          </p>
          <p>
            If customers make 5 repeat purchases: <strong>{moneyFmt(result.riskAdjustedProfit * 5)} DZD</strong>
          </p>
          <p className="text-xs text-slate-500 mt-2">
            💡 Focus on customer retention to maximize lifetime value and reduce acquisition costs.
          </p>
        </div>
      </div>

      {/* Scaling Strategy */}
      <div className="mt-6 p-4 rounded-lg bg-gradient-to-r from-emerald-500/10 to-teal-500/10 border border-emerald-500/30">
        <h3 className="font-semibold mb-3 flex items-center gap-2">
          <BarChart3 size={18} />
          Scaling Strategy
        </h3>
        <div className="space-y-3 text-sm">
          <div className="p-3 rounded bg-slate-200 dark:bg-white/5">
            <div className="font-semibold mb-1">📊 Current Monthly Profit (1000 orders)</div>
            <div className="text-green-400">{moneyFmt(result.riskAdjustedProfit * 1000)} DZD</div>
          </div>
          <div className="p-3 rounded bg-slate-200 dark:bg-white/5">
            <div className="font-semibold mb-1">📈 If you 2x volume (2000 orders)</div>
            <div className="text-indigo-400">{moneyFmt(result.riskAdjustedProfit * 2000)} DZD</div>
          </div>
          <div className="p-3 rounded bg-slate-200 dark:bg-white/5">
            <div className="font-semibold mb-1">🚀 If you 5x volume (5000 orders)</div>
            <div className="text-teal-400">{moneyFmt(result.riskAdjustedProfit * 5000)} DZD</div>
          </div>
        </div>
      </div>

      {/* Break-Even Orders */}
      <div className="mt-6 p-4 rounded-lg bg-slate-200 dark:bg-white/5">
        <h3 className="font-semibold mb-3">🎯 Break-Even Orders</h3>
        <div className="space-y-2 text-sm">
          <p>
            Orders needed to break even:{" "}
            <strong>{result.net > 0 ? Math.ceil(result.totalCost / result.net) : "—"}</strong> orders
          </p>
          <p>
            Orders needed with return risk:{" "}
            <strong>
              {result.riskAdjustedProfit > 0 ? Math.ceil(result.totalCost / result.riskAdjustedProfit) : "—"}
            </strong>{" "}
            orders
          </p>
          <p className="text-xs text-slate-500 mt-2">
            💡 After reaching break-even, every additional order is pure profit!
          </p>
        </div>
      </div>
    </GlassCard>
  )
}

// --- UI HELPER COMPONENTS ---

function GlassCard({ children, className = "" }) {
  return (
    <section
      className={`backdrop-blur-xl bg-white/60 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-2xl p-5 shadow-lg ${className}`}
    >
      {children}
    </section>
  )
}

function ActionButton({ onClick, icon, text, primary = true }) {
  const baseClasses =
    "px-4 py-2.5 rounded-lg font-semibold shadow-sm flex items-center justify-center gap-2 transition-transform active:scale-95"
  const primaryClasses = "bg-gradient-to-r from-teal-400 to-indigo-500 text-slate-900 hover:opacity-90"
  const secondaryClasses = "bg-slate-200 dark:bg-white/10 hover:bg-slate-300 dark:hover:bg-white/20"
  return (
    <button onClick={onClick} className={`${baseClasses} ${primary ? primaryClasses : secondaryClasses}`}>
      {icon}
      <span>{text}</span>
    </button>
  )
}

function DonationButton({ href, onClick, text, icon }) {
  const classes =
    "px-3 py-2 text-sm rounded-lg bg-slate-200 dark:bg-white/10 border border-transparent hover:border-slate-300 dark:hover:border-white/20 transition flex items-center gap-1.5"
  if (href) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className={classes}>
        {text}
      </a>
    )
  }
  return (
    <button onClick={onClick} className={classes}>
      {text} {icon}
    </button>
  )
}

function BaridiMobModal({ isOpen, onClose, t }) {
  if (!isOpen) return null

  const handleCopy = () => {
    navigator.clipboard.writeText(CONFIG.donation.baridimob)
    toast.success(t.baridimobCopied)
  }

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-slate-100 dark:bg-slate-800 rounded-2xl shadow-xl p-6 max-w-sm w-full border border-slate-300 dark:border-slate-700"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-lg font-bold text-center mb-2">{t.baridimobTitle}</h3>
        <p className="text-sm text-slate-600 dark:text-slate-300 text-center mb-4">{t.baridimobInstructions}</p>
        <div className="p-4 rounded-lg bg-slate-200 dark:bg-slate-700/50 flex justify-between items-center gap-4">
          <span className="font-mono font-semibold text-indigo-600 dark:text-indigo-400">
            {CONFIG.donation.baridimob}
          </span>
          <button
            onClick={handleCopy}
            title="Copy"
            className="p-2 rounded-md hover:bg-slate-300 dark:hover:bg-slate-600 transition"
          >
            <Copy size={18} />
          </button>
        </div>
        <button
          onClick={onClose}
          className="mt-5 w-full py-2.5 rounded-lg bg-indigo-500 text-white font-semibold hover:bg-indigo-600 transition"
        >
          Close
        </button>
      </div>
    </div>
  )
}

function PresetModal({ isOpen, onClose, presetName, setPresetName, onSave, t }) {
  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-slate-100 dark:bg-slate-800 rounded-2xl shadow-xl p-6 max-w-sm w-full border border-slate-300 dark:border-slate-700"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-lg font-bold mb-4">{t.savePreset}</h3>
        <input
          type="text"
          placeholder={t.presetName}
          value={presetName}
          onChange={(e) => setPresetName(e.target.value)}
          className="w-full p-3 rounded-lg bg-slate-200 dark:bg-white/5 outline-none focus:ring-2 focus:ring-indigo-400 mb-4"
        />
        <div className="flex gap-2">
          <button
            onClick={onSave}
            className="flex-1 py-2.5 rounded-lg bg-indigo-500 text-white font-semibold hover:bg-indigo-600 transition"
          >
            Save
          </button>
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-lg bg-slate-300 dark:bg-white/10 font-semibold hover:bg-slate-400 dark:hover:bg-white/20 transition"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  )
}

function PremiumModal({ isOpen, onClose, password, setPassword, onUnlock, t }) {
  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-slate-100 dark:bg-slate-800 rounded-2xl shadow-xl p-6 max-w-sm w-full border border-slate-300 dark:border-slate-700"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 p-3 rounded-lg bg-amber-500/10 border border-amber-500/30">
          <p className="text-sm font-semibold text-amber-600 dark:text-amber-400">
            🎁 This section is exclusively for supporters who have contributed to the development of this tool.
          </p>
        </div>

        <h3 className="text-lg font-bold mb-2 flex items-center gap-2">
          <Lock size={20} />
          {t.premiumFeatures}
        </h3>
        <p className="text-sm text-slate-600 dark:text-slate-300 mb-4">
          Enter the password to unlock advanced risk management features.
        </p>
        <input
          type="password"
          placeholder={t.enterPassword}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onKeyPress={(e) => e.key === "Enter" && onUnlock()}
          className="w-full p-3 rounded-lg bg-slate-200 dark:bg-white/5 outline-none focus:ring-2 focus:ring-indigo-400 mb-4"
        />
        <div className="flex gap-2">
          <button
            onClick={onUnlock}
            className="flex-1 py-2.5 rounded-lg bg-indigo-500 text-white font-semibold hover:bg-indigo-600 transition"
          >
            {t.unlock}
          </button>
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-lg bg-slate-300 dark:bg-white/10 font-semibold hover:bg-slate-400 dark:hover:bg-white/20 transition"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  )
}

function SupportAlertModal({ isOpen, onClose, onSupport, t }) {
  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-slate-100 dark:bg-slate-800 rounded-2xl shadow-xl p-6 max-w-sm w-full border border-slate-300 dark:border-slate-700"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-lg font-bold mb-2 flex items-center gap-2">
          <AlertCircle size={20} className="text-amber-500" />
          {t.supportAlert}
        </h3>
        <p className="text-sm text-slate-600 dark:text-slate-300 mb-4">{t.supportAlertDesc}</p>
        <div className="flex gap-2">
          <button
            onClick={onSupport}
            className="flex-1 py-2.5 rounded-lg bg-gradient-to-r from-teal-400 to-indigo-500 text-slate-900 font-semibold hover:opacity-90 transition"
          >
            {t.supportNow}
          </button>
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-lg bg-slate-300 dark:bg-white/10 font-semibold hover:bg-slate-400 dark:hover:bg-white/20 transition"
          >
            {t.notNow}
          </button>
        </div>
      </div>
    </div>
  )
}
