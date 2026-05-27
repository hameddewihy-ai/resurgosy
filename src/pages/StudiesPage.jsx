import { useState, useMemo } from 'react';
import { useGlobalData } from '../context/GlobalContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  FileSearch, BarChart3, Building2, Layers, CheckCircle,
  Download, Clock, Star, TrendingUp, TrendingDown,
  ChevronRight, ChevronDown, Send, Phone, Mail, User, MessageCircle,
  Shield, Award, Users, Calendar, DollarSign, AlertCircle,
  BookOpen, Target, Microscope, PenTool, X, Calculator,
  MapPin, Briefcase, Search, SlidersHorizontal, ExternalLink,
  FileText, Zap, Globe, Home,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { supabase, isConfigured } from '../lib/supabase';
import { sendEmail } from '../utils/sendEmail';
import PageHero from '../components/PageHero';
import SEO from '../components/SEO';

// ── Studies Data (19 studies) ─────────────────────────────────────────────────
const STUDIES = [
  {
    id: 1, cat: 'feasibility', city: 'دمشق', sector: 'سكني',
    price: 1800, free: false, rating: 5, pages: 52,
    title: 'جدوى مجمع سكني 200 وحدة — دمشق الجديدة',
    author: 'م. سامر الأسد', authorCredential: 'MRICS · IVS 2025',
    date: '2025-04-20',
    tags: ['سكني', 'دمشق', 'IRR 18.4%'],
    irr: 18.4, npv: 2_400_000,
    summary: 'دراسة جدوى اقتصادية شاملة لمشروع مجمع سكني 200 وحدة في دمشق الجديدة تتضمن تحليل التدفق النقدي ومؤشرات IRR/NPV بمعايير IVS 2025.',
    methodology: ['تحليل DCF 10 سنوات', 'مقارنة سوقية (Comparable Sales)', 'تحليل الحساسية', 'معايير IVS 2025'],
    toc: ['ملخص تنفيذي', 'تحليل السوق المحلي', 'مخطط التدفق النقدي', 'تحليل الحساسية', 'مخاطر الاستثمار', 'توصيات التنفيذ'],
    findings: ['IRR 18.4% — يتجاوز معدل العائد المطلوب 14%', 'فترة استرداد 4.8 سنة', 'نقطة التعادل عند إشغال 67%', 'الطلب على الوحدات المتوسطة أقوى بـ 2.3x'],
  },
  {
    id: 2, cat: 'market', city: 'شامل', sector: 'عام',
    price: 0, free: true, rating: 5, pages: 32,
    title: 'مؤشر أسعار العقارات السورية Q1 2025',
    author: 'فريق RESURGO للأبحاث', authorCredential: 'Research Team',
    date: '2025-04-15',
    tags: ['سوق عقاري', '2025', 'مؤشرات'],
    irr: null, npv: null,
    summary: 'تقرير ربعي شامل يرصد تحركات أسعار العقارات في 8 محافظات سورية مع توقعات للنصف الثاني 2025.',
    methodology: ['رصد الصفقات المسجلة', 'مسح ميداني 1,200 عقار', 'نمذجة إحصائية Hedonic'],
    toc: ['المؤشر الوطني', 'أداء كل محافظة', 'قطاع التأجير', 'التوقعات H2 2025'],
    findings: ['دمشق +8.2% (أسرع الأسواق)', 'اللاذقية تصعد 15.3% بفضل العائدين', 'إدلب -2.1% تضغط الهشاشة الأمنية', 'متوسط إيجار شقة 2غ: $280/شهر'],
  },
  {
    id: 3, cat: 'engineering', city: 'حلب', sector: 'تجاري',
    price: 950, free: false, rating: 4, pages: 26,
    title: 'تقرير فحص إنشائي — برج تجاري حلب',
    author: 'م. خالد العمر', authorCredential: 'PE · LEED AP',
    date: '2025-05-02',
    tags: ['إنشائي', 'حلب', 'تأهيل'],
    irr: null, npv: null,
    summary: 'تقرير فحص هندسي ميداني وفق معايير IVS 2025 لبرج تجاري متضرر في حلب مع تصنيف الضرر وتوصيات التأهيل.',
    methodology: ['فحص بصري ميداني', 'اختبارات Schmidt Hammer', 'تحليل GPR للحديد', 'معيار ASCE 41'],
    toc: ['وصف المبنى', 'منهجية الفحص', 'تصنيف الأضرار', 'نتائج الاختبارات', 'بدائل التأهيل', 'التكاليف التقديرية'],
    findings: ['الهيكل قابل للتأهيل بتكلفة $180k', 'تشققات من فئة D في الطابق 3', 'حديد التسليح بحالة جيدة 78%', 'مدة التأهيل 5 أشهر'],
  },
  {
    id: 4, cat: 'architecture', city: 'حمص', sector: 'سكني',
    price: 2200, free: false, rating: 5, pages: 68,
    title: 'دراسة تصميم حي سكني متكامل — حمص',
    author: 'م. رنا الكردي', authorCredential: 'LEED AP · معمارية معتمدة',
    date: '2025-03-28',
    tags: ['تصميم عمراني', 'حمص', 'LEED'],
    irr: null, npv: null,
    summary: 'دراسة معمارية متكاملة لحي سكني مستدام 500 وحدة تتضمن المخططات الكاملة وأنظمة الطاقة المتجددة وفق LEED Silver.',
    methodology: ['BIM Level 2', 'LEED v4 Scorecard', 'تحليل الظل والإضاءة', 'دراسة حركة المشاة'],
    toc: ['الرؤية العمرانية', 'المخططات العامة', 'التصاميم النموذجية', 'الاستدامة والطاقة', 'شبكات البنية التحتية', 'جداول الكميات'],
    findings: ['توفير 35% طاقة عبر ألواح شمسية', 'نسبة مشاة 60% في الحي', 'LEED Silver بـ 52 نقطة', 'تكلفة البناء $480/م²'],
  },
  {
    id: 5, cat: 'feasibility', city: 'اللاذقية', sector: 'سياحي',
    price: 2100, free: false, rating: 4, pages: 58,
    title: 'جدوى فندق ساحلي 5 نجوم — اللاذقية',
    author: 'م. أيمن القاسم', authorCredential: 'MRICS · USALI Certified',
    date: '2025-04-30',
    tags: ['سياحي', 'اللاذقية', 'IRR 22%'],
    irr: 22.1, npv: 3_800_000,
    summary: 'دراسة جدوى لفندق 5 نجوم 150 غرفة على الساحل السوري مع تحليل السوق السياحي وإسقاطات الإيراد لـ 10 سنوات.',
    methodology: ['USALI معايير الضيافة', 'تحليل STR (RevPAR/ADR)', 'DCF 10 سنوات', 'مقارنة منافسين إقليميين'],
    toc: ['ملخص السوق السياحي', 'تحليل الطلب', 'نموذج الإيراد', 'جدول التشغيل', 'IRR/NPV/Payback', 'توصيات المستثمر'],
    findings: ['IRR 22.1% — استرداد 5.2 سنة', 'RevPAR متوقع $85/ليلة', 'إشغال سنوي 68% محافظ', 'موسم الذروة يولد 45% الإيراد'],
  },
  {
    id: 6, cat: 'market', city: 'شامل', sector: 'عام',
    price: 0, free: true, rating: 5, pages: 18,
    title: 'خريطة فرص الاستثمار العقاري — 2025',
    author: 'فريق RESURGO للأبحاث', authorCredential: 'Research Team',
    date: '2025-05-05',
    tags: ['استثمار', 'خريطة', 'فرص'],
    irr: null, npv: null,
    summary: 'تقرير يرصد أكثر 12 منطقة جاذبة للاستثمار العقاري في سوريا خلال 2025 مع مؤشرات الطلب والعائد.',
    methodology: ['مؤشر جاذبية منطقة (RAI)', 'بيانات عقود الإيجار', 'مسح المطورين'],
    toc: ['منهجية RAI', 'خريطة الفرص', 'تصنيف المناطق', 'توصيات التوقيت'],
    findings: ['6 مناطق في دمشق ضمن Top 10', 'مرفأ طرطوس يتصدر العائد التجاري', 'حلب الجديدة: أعلى طلب سكني', 'أسواق إدلب تترقب الاستقرار'],
  },
  {
    id: 7, cat: 'warDamage', city: 'حلب', sector: 'مختلط',
    price: 1400, free: false, rating: 5, pages: 44,
    title: 'تقييم أضرار الحرب — أحياء حلب القديمة (UNOPS)',
    author: 'م. طارق النجار', authorCredential: 'UNOPS Assessor · IVS',
    date: '2025-05-10',
    tags: ['UNOPS', 'حلب', 'DaLA'],
    irr: null, npv: null,
    summary: 'تقييم شامل لأضرار الحرب في 14 مبنى وفق منهجية UNOPS DaLA/PDNA، يشمل التصنيف الهيكلي وتقدير تكاليف الإعادة.',
    methodology: ['UNOPS Damage Assessment Protocol', 'World Bank DaLA', 'تصوير جوي UAV', 'GIS Mapping'],
    toc: ['منهجية DaLA', 'خريطة توزيع الأضرار', 'تصنيف المباني (A-E)', 'تقديرات التكلفة', 'أولويات إعادة الإعمار'],
    findings: ['42% من المباني قابلة للتأهيل', 'تكلفة إعادة الإعمار $2.8M', '18 مبنى تصنيف E (هدم)', 'أولوية: المباني السكنية الفئة B'],
  },
  {
    id: 8, cat: 'costPlan', city: 'دمشق', sector: 'تجاري',
    price: 1200, free: false, rating: 4, pages: 38,
    title: 'خطة تكلفة مشروع مركز تجاري — المزة (RICS NRM2)',
    author: 'م. لينا خوري', authorCredential: 'MRICS · QS Certified',
    date: '2025-04-08',
    tags: ['RICS', 'دمشق', 'NRM2'],
    irr: null, npv: null,
    summary: 'خطة تكلفة تفصيلية وفق معيار RICS NRM2 لمركز تجاري 8,000 م² في منطقة المزة تشمل BOQ ومصفوفة المخاطر.',
    methodology: ['RICS NRM2 (New Rules of Measurement)', 'Elemental Cost Plan', 'Risk Register AACE 18R-97', 'مقارنة 3 مقاولين'],
    toc: ['ملخص التكاليف', 'BOQ التفصيلية', 'تكاليف الإشراف', 'الاحتياطي والطوارئ', 'مصفوفة المخاطر', 'جدول المدفوعات'],
    findings: ['تكلفة إنشاء $620/م²', 'احتياطي الطوارئ 12%', 'أعلى بند: الهيكل الإنشائي 38%', 'نطاق التكلفة الكلية $5.2-5.8M'],
  },
  {
    id: 9, cat: 'valuation', city: 'طرطوس', sector: 'صناعي',
    price: 850, free: false, rating: 5, pages: 22,
    title: 'تقرير تقييم عقاري — مستودع صناعي طرطوس (IVS 2025)',
    author: 'م. عمر سالم', authorCredential: 'IVS 2025 · RICS Registered',
    date: '2025-03-15',
    tags: ['تقييم', 'طرطوس', 'IVS 2025'],
    irr: null, npv: null,
    summary: 'تقرير تقييم عقاري بمعايير IVS 2025 لمستودع صناعي 3,200 م² في المنطقة الحرة بطرطوس مع تحليل القيمة السوقية.',
    methodology: ['Income Approach (IVS 300)', 'Comparable Sales (IVS 105)', 'Cost Approach (IVS 400)', 'DCF Sensitivity'],
    toc: ['الموقع والوصف', 'ظروف السوق', 'منهجية التقييم', 'تحليل المبيعات المقارنة', 'القيمة السوقية النهائية'],
    findings: ['القيمة السوقية $1.85M', 'معدل رسملة 8.2%', 'صافي إيراد إيجاري $152k/سنة', 'إيجارات المنطقة +18% خلال 12 شهراً'],
  },
  {
    id: 10, cat: 'feasibility', city: 'حلب', sector: 'صناعي',
    price: 1650, free: false, rating: 4, pages: 49,
    title: 'جدوى منطقة صناعية متكاملة — الشيخ نجار',
    author: 'م. باسم العلي', authorCredential: 'MRICS · Industrial RE Specialist',
    date: '2025-05-12',
    tags: ['صناعي', 'حلب', 'IRR 16.8%'],
    irr: 16.8, npv: 1_900_000,
    summary: 'دراسة جدوى لمنطقة صناعية متكاملة 50,000 م² في مدينة الشيخ نجار الصناعية تشمل تخصيص المساحات وتحليل الطلب.',
    methodology: ['Location Quotient Analysis', 'Industrial Demand Survey', 'DCF 15 سنة', 'FIDIC Yellow Book'],
    toc: ['تحليل المنطقة الصناعية', 'الطلب والعرض', 'تصميم البنية التحتية', 'نموذج الإيراد', 'خطة التأجير', 'IRR/Payback'],
    findings: ['IRR 16.8% باستثمار $8.2M', 'الطلب الصناعي المكبوت: 340,000 م²', 'نسبة إشغال متوقعة 82% بعد 3 سنوات', 'تأجير متوسط $6.5/م²/شهر'],
  },
  {
    id: 11, cat: 'geotechnical', city: 'ريف دمشق', sector: 'سكني',
    price: 750, free: false, rating: 4, pages: 28,
    title: 'دراسة جيوتقنية — موقع بناء حي سكني ريف دمشق',
    author: 'م. فادي حسن', authorCredential: 'Geotechnical Engineer · PE',
    date: '2025-04-22',
    tags: ['جيوتقني', 'ريف دمشق', 'تربة'],
    irr: null, npv: null,
    summary: 'دراسة جيوتقنية شاملة (تحقيق التربة والصخور) لموقع بناء 12,000 م² تحدد نوع الأساسات والطاقة الحاملة للتربة.',
    methodology: ['حفر استكشافية 8 آبار', 'اختبار SPT', 'تحليل الضغط المسام', 'ASTM D1586'],
    toc: ['الجيولوجيا الإقليمية', 'نتائج الاختبارات', 'خصائص التربة', 'توصيات الأساسات', 'مخاطر الانهيار والسيولة'],
    findings: ['الطاقة الحاملة 180 kPa على عمق 2.5م', 'لا خطر سيولة', 'توصية: أساسات لبشة', 'طبقة الصخر على عمق 6م'],
  },
  {
    id: 12, cat: 'dueDiligence', city: 'دمشق', sector: 'تجاري',
    price: 1100, free: false, rating: 5, pages: 35,
    title: 'تدقيق عناية واجبة — عقار تجاري للاستحواذ',
    author: 'م. مروان صالح', authorCredential: 'MRICS · Legal Liaison',
    date: '2025-04-12',
    tags: ['due diligence', 'دمشق', 'استحواذ'],
    irr: null, npv: null,
    summary: 'تقرير عناية واجبة شامل لعقار تجاري مقترح للاستحواذ يغطي الجوانب القانونية والهندسية والمالية والبيئية.',
    methodology: ['Title Search', 'Physical Due Diligence', 'Environmental Phase I', 'Financial Audit'],
    toc: ['ملخص المخاطر', 'سلسلة الملكية القانونية', 'الفحص الهندسي', 'الالتزامات المالية', 'البيئة والترخيص', 'توصيات التفاوض'],
    findings: ['ملكية نظيفة بلا رهون', 'إصلاحات بنية أساسية $45k مطلوبة', 'لا مخاطر بيئية Phase I', 'توصية: خفض السعر 8% للإصلاحات'],
  },
  {
    id: 13, cat: 'engineering', city: 'حماة', sector: 'سكني',
    price: 720, free: false, rating: 4, pages: 20,
    title: 'فحص إنشائي طارئ — مبنى سكني متضرر حماة',
    author: 'م. سليم درويش', authorCredential: 'Structural PE · UNOPS',
    date: '2025-05-08',
    tags: ['إنشائي', 'حماة', 'طارئ'],
    irr: null, npv: null,
    summary: 'فحص إنشائي طارئ لمبنى سكني 6 طوابق يعاني تشققات متقدمة في الجدران الحاملة مع توصيات السلامة الفورية.',
    methodology: ['ACI 318 Structural Assessment', 'Schmidt Rebound Hammer', 'تصوير حراري IR', 'تقييم مرئي شامل'],
    toc: ['تقييم الخطر الفوري', 'نتائج الاختبارات', 'تصنيف الأضرار', 'الإجراءات الطارئة', 'خيارات التأهيل'],
    findings: ['المبنى آمن للإشغال مع قيود', 'تعزيز فوري للجدار الشمالي ضروري', 'تكلفة التأهيل $95k', 'مدة تنفيذ 10 أسابيع'],
  },
  {
    id: 14, cat: 'market', city: 'اللاذقية', sector: 'سياحي',
    price: 650, free: false, rating: 5, pages: 24,
    title: 'تقرير السوق السياحي الساحلي — اللاذقية وطرطوس 2025',
    author: 'فريق RESURGO للأبحاث', authorCredential: 'Research · USALI',
    date: '2025-04-25',
    tags: ['سياحي', 'ساحل', 'سوق'],
    irr: null, npv: null,
    summary: 'تحليل شامل لسوق الإيواء والضيافة الساحلي مع بيانات الإشغال ومعدلات ADR/RevPAR وتوقعات 2025-2026.',
    methodology: ['STR Global Benchmarking', 'Mystery Shopping 40 فندق', 'تحليل القنوات الرقمية', 'مسح نزلاء 800 شخص'],
    toc: ['مؤشرات سوق الفنادق', 'تحليل RevPAR', 'شرائح السياح', 'المنافسة الإقليمية', 'توقعات 2025-2026'],
    findings: ['RevPAR الساحل +34% عن 2023', 'ADR متوسط $72/ليلة في الصيف', 'مزيج نزلاء: 58% خليجي', 'نقص 800 غرفة فئة 4-5 نجوم'],
  },
  {
    id: 15, cat: 'feasibility', city: 'ريف دمشق', sector: 'لوجستي',
    price: 1500, free: false, rating: 4, pages: 42,
    title: 'جدوى مستودع لوجستي متطور — منطقة عدرا',
    author: 'م. حازم مرعي', authorCredential: 'MRICS · Logistics RE',
    date: '2025-03-20',
    tags: ['لوجستي', 'عدرا', 'IRR 19.2%'],
    irr: 19.2, npv: 1_600_000,
    summary: 'دراسة جدوى لمستودع لوجستي عالي المستوى (Grade A) 20,000 م² في المنطقة الصناعية بعدرا مع تحليل الطلب اللوجستي.',
    methodology: ['Logistics Demand Analysis', 'GIS Traffic Flows', 'DCF 10 سنوات', 'Comparables Beirut/Amman'],
    toc: ['تحليل قطاع اللوجستيات', 'الموقع والربط', 'تصميم المستودع', 'نموذج الإيراد', 'مقارنة المنافسين', 'IRR/NPV'],
    findings: ['IRR 19.2% باستثمار $6.4M', 'إيجار Grade A $9/م²/شهر', 'طلب محتجز 120,000 م²', 'قرب مرفأ طرطوس ميزة استراتيجية'],
  },
  {
    id: 16, cat: 'warDamage', city: 'إدلب', sector: 'مختلط',
    price: 1600, free: false, rating: 4, pages: 50,
    title: 'تقييم أضرار حرب — منطقة صناعية إدلب (PDNA)',
    author: 'م. أحمد الزعبي', authorCredential: 'UNOPS · World Bank DaLA',
    date: '2025-05-15',
    tags: ['UNOPS', 'إدلب', 'PDNA'],
    irr: null, npv: null,
    summary: 'تقييم PDNA لأضرار المنطقة الصناعية في إدلب بمنهجية World Bank وتقدير تكاليف إعادة الإعمار ومتطلبات التمويل.',
    methodology: ['Post-Disaster Needs Assessment (PDNA)', 'Satellite Change Detection', 'Field Survey 120 منشأة', 'World Bank DaLA Framework'],
    toc: ['خريطة الأضرار الجوية', 'تصنيف المنشآت', 'تقديرات القطاعات', 'متطلبات التمويل', 'خطة إعادة الإعمار'],
    findings: ['خسائر تقديرية $47M', '34% من المنشآت هدم كلي', 'أولوية: البنية التحتية (كهرباء/ماء)', 'مدة إعادة الإعمار المقدرة 36 شهراً'],
  },
  {
    id: 17, cat: 'architecture', city: 'طرطوس', sector: 'سياحي',
    price: 1900, free: false, rating: 5, pages: 72,
    title: 'دراسة عمرانية لمنتجع ساحلي متكامل — طرطوس',
    author: 'م. رنا الكردي', authorCredential: 'LEED AP · معمارية معتمدة',
    date: '2025-02-14',
    tags: ['سياحي', 'طرطوس', 'LEED Gold'],
    irr: null, npv: null,
    summary: 'دراسة معمارية متكاملة لمنتجع ساحلي 80 وحدة على ساحل طرطوس تشمل التصاميم الكاملة ومعايير LEED Gold.',
    methodology: ['Master Planning', 'LEED v4.1 BD+C', 'Coastal Engineering Constraints', 'Environmental Impact'],
    toc: ['الرؤية المعمارية', 'Master Plan', 'الوحدات السياحية', 'المرافق المشتركة', 'الاستدامة LEED', 'مراحل التنفيذ'],
    findings: ['65 LEED نقطة — Gold مؤكد', 'توفير مياه 40% بإعادة التدوير', 'ألواح شمسية تغطي 70% الطاقة', 'تكلفة إنشاء $1,850/م²'],
  },
  {
    id: 18, cat: 'market', city: 'حلب', sector: 'سكني',
    price: 500, free: false, rating: 4, pages: 19,
    title: 'مؤشر السوق السكني — حلب ومحيطها Q2 2025',
    author: 'فريق RESURGO للأبحاث', authorCredential: 'Research Team',
    date: '2025-05-01',
    tags: ['حلب', 'سكني', 'Q2 2025'],
    irr: null, npv: null,
    summary: 'تقرير ربعي يرصد تحركات الأسعار والطلب في السوق السكني بحلب ومناطقها مع بيانات صفقات مسجلة 2024-2025.',
    methodology: ['بيانات السجل العقاري', 'مسح وسطاء 60 مكتب', 'تحليل الطلب الديموغرافي'],
    toc: ['مؤشر حلب العام', 'الأداء بالأحياء', 'سوق الإيجار', 'توقعات Q3 2025'],
    findings: ['أسعار حلب +12.5% سنوياً', 'الشيخ نجار: أعلى طلب صناعي', 'الإيجار السكني ارتفع 28%', 'مخزون جديد قادم: 2,800 وحدة'],
  },
  {
    id: 19, cat: 'feasibility', city: 'السويداء', sector: 'زراعي',
    price: 1300, free: false, rating: 4, pages: 40,
    title: 'جدوى مشروع أغرو-ريزورت — السويداء',
    author: 'م. سامر الأسد', authorCredential: 'MRICS · Agri-RE',
    date: '2025-04-05',
    tags: ['زراعي', 'السويداء', 'IRR 15.3%'],
    irr: 15.3, npv: 980_000,
    summary: 'دراسة جدوى لمشروع مزرعة سياحية متكاملة في السويداء تجمع الزراعة العضوية والإقامة الريفية مع تحليل السوق.',
    methodology: ['Agritourism Market Analysis', 'Agricultural Land Assessment', 'DCF 12 سنة', 'مقارنة أردن/لبنان'],
    toc: ['تحليل سوق السياحة الزراعية', 'الموارد الطبيعية', 'نموذج الإيراد المزدوج', 'الزراعة العضوية + الإقامة', 'IRR/NPV'],
    findings: ['IRR 15.3% بتنويع إيرادي', 'موسم ذروة أبريل-أكتوبر', 'الإيراد الزراعي يغطي التشغيل', 'مؤشر نمو سياحة الطبيعة +40%/سنة'],
  },
];

// ── Categories & Tabs ─────────────────────────────────────────────────────────
const CATEGORIES = [
  { id: 'all',          label: 'الكل',               icon: Layers },
  { id: 'feasibility',  label: 'دراسات الجدوى',       icon: BarChart3 },
  { id: 'engineering',  label: 'تقارير هندسية',        icon: Building2 },
  { id: 'market',       label: 'تقارير السوق',         icon: TrendingUp },
  { id: 'architecture', label: 'دراسات معمارية',       icon: PenTool },
  { id: 'warDamage',    label: 'تقييم أضرار الحرب',    icon: AlertCircle },
  { id: 'costPlan',     label: 'خطط التكلفة RICS',     icon: FileText },
  { id: 'valuation',    label: 'تقييم عقاري IVS',      icon: Award },
  { id: 'geotechnical', label: 'دراسات جيوتقنية',      icon: Microscope },
  { id: 'dueDiligence', label: 'عناية واجبة',          icon: Search },
];

const PAGE_TABS = [
  { id: 'catalog',  label: 'كاتالوج الدراسات', icon: BookOpen },
  { id: 'market',   label: 'السوق العقاري',      icon: TrendingUp },
  { id: 'experts',  label: 'خبراؤنا',            icon: Users },
  { id: 'tracker',  label: 'متابعة طلبي',        icon: Clock },
];

// ── Market Data ───────────────────────────────────────────────────────────────
const MARKET_DATA = [
  { city: 'دمشق',     change: +8.2,  volume: 1840, spark: [6,7,6.5,8,7.8,8.2], color: 'emerald' },
  { city: 'حلب',      change: +12.5, volume: 1240, spark: [8,9,10,11,12,12.5], color: 'emerald' },
  { city: 'اللاذقية', change: +15.3, volume: 620,  spark: [10,11,12,13,14,15.3], color: 'emerald' },
  { city: 'طرطوس',    change: +9.7,  volume: 480,  spark: [7,8,8.5,9,9.2,9.7], color: 'emerald' },
  { city: 'حماة',     change: +3.4,  volume: 310,  spark: [2,2.5,3,3,3.2,3.4], color: 'sky' },
  { city: 'حمص',      change: +5.1,  volume: 390,  spark: [3,3.5,4,4.8,5,5.1], color: 'sky' },
  { city: 'السويداء', change: +2.8,  volume: 180,  spark: [1.5,2,2.2,2.5,2.7,2.8], color: 'sky' },
  { city: 'درعا',     change: +1.2,  volume: 140,  spark: [2,1.5,1,1.2,1,1.2], color: 'sky' },
  { city: 'إدلب',     change: -2.1,  volume: 85,   spark: [1,0.5,0,-0.5,-1.5,-2.1], color: 'red' },
  { city: 'دير الزور',change: -4.5,  volume: 60,   spark: [0,-0.5,-1,-2,-3,-4.5], color: 'red' },
  { city: 'الرقة',    change: -1.8,  volume: 72,   spark: [0.5,0,-0.2,-0.8,-1.2,-1.8], color: 'red' },
  { city: 'الحسكة',   change: +0.9,  volume: 95,   spark: [0,0.2,0.5,0.7,0.8,0.9], color: 'sky' },
];

// ── Experts ───────────────────────────────────────────────────────────────────
const EXPERTS = [
  { name: 'م. سامر الأسد', title: 'رئيس قسم دراسات الجدوى', credential: 'MRICS · IVS 2025', specialty: 'جدوى اقتصادية، تحليل DCF', projects: 62, avail: true, city: 'دمشق', color: 'violet' },
  { name: 'م. رنا الكردي', title: 'مديرة التصميم المعماري', credential: 'LEED AP · معمارية معتمدة', specialty: 'تصميم عمراني، LEED، BIM', projects: 48, avail: true, city: 'حمص', color: 'brand' },
  { name: 'م. خالد العمر', title: 'مهندس إنشائي أول', credential: 'PE · LEED AP · ACI', specialty: 'فحص إنشائي، تأهيل مباني', projects: 85, avail: false, city: 'حلب', color: 'emerald' },
  { name: 'م. لينا خوري', title: 'خبيرة كميات وتكاليف', credential: 'MRICS · QS Certified', specialty: 'NRM2، BOQ، إدارة المشاريع', projects: 54, avail: true, city: 'دمشق', color: 'amber' },
  { name: 'م. طارق النجار', title: 'خبير تقييم أضرار الحرب', credential: 'UNOPS Assessor · IVS', specialty: 'DaLA، PDNA، تقييم الأضرار', projects: 38, avail: true, city: 'حلب', color: 'red' },
  { name: 'م. أيمن القاسم', title: 'محلل السوق السياحي', credential: 'MRICS · USALI Certified', specialty: 'جدوى فنادق، RevPAR، STR', projects: 29, avail: false, city: 'اللاذقية', color: 'sky' },
];

// ── Study Types (for form) ────────────────────────────────────────────────────
const STUDY_TYPES = [
  { value: 'feasibility-economic',  label: 'دراسة جدوى اقتصادية شاملة',  icon: BarChart3,   color: 'violet',  price: '1,400–2,200 $' },
  { value: 'feasibility-quick',     label: 'دراسة جدوى مختصرة (Express)', icon: Target,      color: 'violet',  price: '600–900 $' },
  { value: 'structural',            label: 'تقرير فحص إنشائي',             icon: Building2,   color: 'brand',   price: '700–1,200 $' },
  { value: 'war-damage',            label: 'تقييم أضرار الحرب (UNOPS)',    icon: AlertCircle, color: 'red',     price: '1,200–2,000 $' },
  { value: 'cost-plan',             label: 'خطة تكلفة RICS NRM2',          icon: FileText,    color: 'brand',   price: '900–1,500 $' },
  { value: 'market',                label: 'تقرير السوق العقاري',          icon: TrendingUp,  color: 'emerald', price: '450–800 $' },
  { value: 'geotechnical',          label: 'دراسة جيوتقنية',               icon: Microscope,  color: 'emerald', price: '600–1,000 $' },
  { value: 'valuation',             label: 'تقرير تقييم عقاري (IVS 2025)',icon: Award,       color: 'amber',   price: '750–1,200 $' },
  { value: 'due-diligence',         label: 'عناية واجبة (Due Diligence)', icon: Search,      color: 'amber',   price: '900–1,400 $' },
  { value: 'architectural',         label: 'دراسة معمارية متكاملة',        icon: PenTool,     color: 'sky',     price: '1,500–2,500 $' },
];

const GOVERNORATES = [
  'دمشق', 'ريف دمشق', 'حلب', 'حمص', 'حماة', 'اللاذقية',
  'طرطوس', 'إدلب', 'دير الزور', 'الرقة', 'الحسكة', 'السويداء', 'درعا', 'القنيطرة',
];
const BUDGETS = [
  { value: 'under-500',  label: 'أقل من 500 $' },
  { value: '500-1500',   label: '500 – 1,500 $' },
  { value: '1500-3000',  label: '1,500 – 3,000 $' },
  { value: '3000-plus',  label: 'أكثر من 3,000 $' },
  { value: 'discuss',    label: 'يُحدَّد بالتفاوض' },
];
const TIMELINES = [
  { value: '1-week',   label: 'أسبوع (Express)' },
  { value: '2-weeks',  label: 'أسبوعان' },
  { value: '1-month',  label: 'شهر' },
  { value: 'flexible', label: 'مرن' },
];

const PROCESS_STEPS = [
  { num: '01', title: 'أرسل طلبك',        desc: 'أكمل النموذج بتفاصيل مشروعك وميزانيتك' },
  { num: '02', title: 'مراجعة أولية',      desc: 'يراجع فريقنا طلبك ويتواصل معك خلال 24 ساعة' },
  { num: '03', title: 'عرض سعر مفصّل',     desc: 'نرسل لك عرضاً شاملاً بالنطاق والتكلفة والجدول الزمني' },
  { num: '04', title: 'تنفيذ الدراسة',     desc: 'خبراؤنا المعتمدون يُعدّون الدراسة وفق المعايير الدولية' },
  { num: '05', title: 'التسليم والمتابعة', desc: 'تستلم الدراسة كاملة مع جلسة توضيحية مجانية' },
];

const TRACKER_STAGES = [
  { id: 'received',  label: 'استلام الطلب',     done: true },
  { id: 'review',    label: 'مراجعة أولية',     done: true },
  { id: 'offer',     label: 'إرسال العرض',      done: true },
  { id: 'execution', label: 'تنفيذ الدراسة',    done: false, active: true },
  { id: 'delivery',  label: 'التسليم النهائي',  done: false },
];

// ── Sparkline SVG ─────────────────────────────────────────────────────────────
function Sparkline({ data, color }) {
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const w = 60, h = 22;
  const pts = data.map((v, i) => {
    const x = (i / (data.length - 1)) * w;
    const y = h - ((v - min) / range) * h;
    return `${x},${y}`;
  }).join(' ');
  const colorMap = { emerald: '#10b981', sky: '#0ea5e9', red: '#ef4444' };
  const stroke = colorMap[color] || '#6b7280';
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} className="overflow-visible">
      <polyline points={pts} fill="none" stroke={stroke} strokeWidth="1.5" strokeLinejoin="round" strokeLinecap="round" />
      <circle cx={pts.split(' ').pop().split(',')[0]} cy={pts.split(' ').pop().split(',')[1]}
        r="2.5" fill={stroke} />
    </svg>
  );
}

// ── Study Detail Drawer ───────────────────────────────────────────────────────
function StudyDetailDrawer({ study, onClose }) {
  const [tocOpen, setTocOpen] = useState(false);
  if (!study) return null;
  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex items-end justify-center"
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      >
        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
        <motion.div
          className="relative z-10 bg-white w-full max-w-2xl max-h-[88vh] overflow-y-auto rounded-t-2xl shadow-2xl"
          initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
          transition={{ type: 'spring', damping: 28, stiffness: 260 }}
        >
          {/* Header */}
          <div className="sticky top-0 bg-navy text-white px-6 py-4 flex items-start justify-between gap-4 z-10">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <span className="font-display text-[10px] text-white/40 tracking-widest">ID-{String(study.id).padStart(4,'0')}</span>
                {study.irr && <span className="text-[10px] bg-violet-500 text-white px-2 py-0.5 font-bold">IRR {study.irr}%</span>}
                {study.free
                  ? <span className="text-[10px] bg-green-500/20 border border-green-400/40 text-green-300 px-2 py-0.5">مجاني</span>
                  : <span className="text-[11px] font-black text-cta">${study.price?.toLocaleString()}</span>
                }
              </div>
              <h2 className="text-white font-bold text-sm leading-snug">{study.title}</h2>
              <p className="text-white/50 text-[11px] mt-1">{study.author} · {study.authorCredential}</p>
            </div>
            <button onClick={onClose} className="p-2 rounded-lg hover:bg-white/10 transition-colors shrink-0">
              <X size={18} className="text-white/70" />
            </button>
          </div>

          <div className="p-6 space-y-5" dir="rtl">
            {/* Stats row */}
            <div className="grid grid-cols-3 gap-3">
              {[
                [FileSearch, `${study.pages} صفحة`, 'text-violet-600'],
                [MapPin, study.city, 'text-brand'],
                [Calendar, study.date, 'text-charcoal/60'],
              ].map(([Icon, val, cls]) => (
                <div key={val} className="bg-cream rounded-xl p-3 text-center">
                  <Icon size={16} className={`${cls} mx-auto mb-1`} />
                  <p className="text-xs font-bold text-navy">{val}</p>
                </div>
              ))}
            </div>

            {/* IRR/NPV */}
            {study.irr && (
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-violet-50 border border-violet-200 rounded-xl p-3 text-center">
                  <p className="text-violet-600 font-black text-2xl">{study.irr}%</p>
                  <p className="text-violet-700/70 text-xs">معدل العائد الداخلي IRR</p>
                </div>
                <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 text-center">
                  <p className="text-emerald-600 font-black text-xl">${(study.npv / 1_000_000).toFixed(1)}M</p>
                  <p className="text-emerald-700/70 text-xs">صافي القيمة الحالية NPV</p>
                </div>
              </div>
            )}

            {/* Summary */}
            <div>
              <p className="text-navy font-bold text-xs mb-1.5">نبذة عن الدراسة</p>
              <p className="text-charcoal/70 text-sm leading-relaxed">{study.summary}</p>
            </div>

            {/* Methodology pills */}
            <div>
              <p className="text-navy font-bold text-xs mb-2">المنهجية المتبعة</p>
              <div className="flex flex-wrap gap-2">
                {study.methodology.map(m => (
                  <span key={m} className="text-[11px] bg-navy/5 border border-navy/10 text-navy/70 px-3 py-1 rounded-full">{m}</span>
                ))}
              </div>
            </div>

            {/* TOC accordion */}
            <div>
              <button
                onClick={() => setTocOpen(o => !o)}
                className="w-full flex items-center justify-between p-3 bg-cream rounded-xl text-navy font-bold text-xs"
              >
                <span>جدول المحتويات ({study.toc.length} أقسام)</span>
                <ChevronDown size={14} className={`transition-transform ${tocOpen ? 'rotate-180' : ''}`} />
              </button>
              <AnimatePresence>
                {tocOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }} className="overflow-hidden"
                  >
                    <div className="pt-2 space-y-1">
                      {study.toc.map((item, i) => (
                        <div key={i} className="flex items-center gap-3 text-xs text-charcoal/70 py-1.5 border-b border-navy/5">
                          <span className="font-display text-navy/30 w-6 text-center">{String(i+1).padStart(2,'0')}</span>
                          {item}
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Key findings */}
            <div>
              <p className="text-navy font-bold text-xs mb-2">أبرز النتائج</p>
              <div className="space-y-2">
                {study.findings.map((f, i) => (
                  <div key={i} className="flex items-start gap-2 text-xs text-charcoal/70">
                    <CheckCircle size={12} className="text-green-500 shrink-0 mt-0.5" />
                    {f}
                  </div>
                ))}
              </div>
            </div>

            {/* Tags */}
            <div className="flex flex-wrap gap-1.5">
              {study.tags.map(t => (
                <span key={t} className="text-[10px] bg-violet-50 border border-violet-200 text-violet-700 px-2 py-0.5 font-bold">{t}</span>
              ))}
            </div>

            {/* CTA */}
            <div className="flex gap-3">
              {study.free ? (
                <button onClick={() => { toast.success('جارٍ تحميل التقرير...'); onClose(); }}
                  className="flex-1 btn-cta flex items-center justify-center gap-2">
                  <Download size={14} /> تحميل مجاني
                </button>
              ) : (
                <>
                  <button onClick={() => { toast('سيتواصل معنا مستشار لإتمام الشراء', { icon: '🔒' }); onClose(); }}
                    className="flex-1 bg-violet-600 text-white font-bold text-sm py-3 rounded-xl hover:bg-violet-700 transition-colors flex items-center justify-center gap-2">
                    <DollarSign size={14} /> شراء — ${study.price?.toLocaleString()}
                  </button>
                  <button onClick={() => { toast('تمت إضافة الدراسة للمقارنة'); onClose(); }}
                    className="px-4 py-3 border border-navy/20 rounded-xl text-navy text-sm hover:bg-navy/5 transition-colors">
                    <Download size={14} />
                  </button>
                </>
              )}
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

// ── IRR Calculator ────────────────────────────────────────────────────────────
function IRRCalculator() {
  const [inv, setInv]     = useState('');
  const [rev, setRev]     = useState('');
  const [costs, setCosts] = useState('');
  const [years, setYears] = useState('10');
  const [result, setResult] = useState(null);

  const calculate = () => {
    const I = parseFloat(inv);
    const R = parseFloat(rev);
    const C = parseFloat(costs);
    const Y = parseInt(years);
    if (!I || !R || !C || !Y) { toast.error('أدخل جميع القيم'); return; }
    const annualCF = (R - C) * 12;
    const npv10 = (annualCF / 0.12) * (1 - Math.pow(1.12, -Y)) - I;
    let irr = 0;
    for (let r = 0.01; r <= 0.5; r += 0.001) {
      const pv = (annualCF / r) * (1 - Math.pow(1 + r, -Y));
      if (pv >= I) { irr = r; break; }
    }
    const payback = annualCF > 0 ? I / annualCF : Infinity;
    setResult({ irr: (irr * 100).toFixed(1), npv: npv10.toFixed(0), payback: payback.toFixed(1), monthly: annualCF / 12 });
  };

  return (
    <div className="blueprint-card overflow-hidden">
      <div className="bg-navy px-5 py-3 flex items-center justify-between">
        <div>
          <p className="text-white font-bold text-sm">حاسبة IRR / NPV</p>
          <p className="text-white/40 text-[10px] font-display tracking-widest">FINANCIAL CALCULATOR</p>
        </div>
        <Calculator size={18} className="text-violet-400" />
      </div>
      <div className="p-5 space-y-3">
        <div className="grid grid-cols-2 gap-3">
          {[
            ['الاستثمار الأولي ($)', inv, setInv, 'مثال: 500,000'],
            ['إيراد شهري متوقع ($)', rev, setRev, 'مثال: 15,000'],
            ['تكاليف تشغيل شهرية ($)', costs, setCosts, 'مثال: 5,000'],
            ['مدة الاستثمار (سنة)', years, setYears, 'مثال: 10'],
          ].map(([label, val, setter, ph]) => (
            <div key={label}>
              <label className="text-charcoal/60 text-[10px] mb-1 block">{label}</label>
              <input
                value={val} onChange={e => setter(e.target.value)} placeholder={ph}
                type="number" min="0"
                className="input-field text-sm w-full"
              />
            </div>
          ))}
        </div>
        <button onClick={calculate} className="w-full btn-cta flex items-center justify-center gap-2">
          <Zap size={14} /> احسب
        </button>
        <AnimatePresence>
          {result && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              className="grid grid-cols-2 gap-2">
              {[
                [result.irr + '%', 'IRR', result.irr > 12 ? 'text-green-600' : 'text-red-500'],
                ['$' + Math.round(result.monthly).toLocaleString(), 'صافي شهري', 'text-violet-600'],
                [result.payback + ' سنة', 'الاسترداد', 'text-amber-600'],
                ['$' + Math.round(result.npv).toLocaleString(), 'NPV', result.npv > 0 ? 'text-emerald-600' : 'text-red-500'],
              ].map(([val, label, cls]) => (
                <div key={label} className="bg-cream rounded-xl p-3 text-center">
                  <p className={`font-black text-lg ${cls}`}>{val}</p>
                  <p className="text-charcoal/50 text-[10px]">{label}</p>
                </div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

// ── Market City Grid ──────────────────────────────────────────────────────────
function MarketCityGrid() {
  const colorCls = { emerald: 'text-emerald-600', sky: 'text-sky-600', red: 'text-red-500' };
  const bgCls    = { emerald: 'bg-emerald-50 border-emerald-200', sky: 'bg-sky-50 border-sky-200', red: 'bg-red-50 border-red-200' };
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <h3 className="text-navy font-black text-lg">خريطة أداء الأسواق</h3>
        <span className="text-[10px] font-display text-charcoal/40 tracking-widest">Q2 2025 YoY%</span>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        {MARKET_DATA.map(m => (
          <div key={m.city} className={`rounded-xl border p-3 ${bgCls[m.color]}`}>
            <div className="flex items-center justify-between mb-2">
              <p className="text-navy font-bold text-xs">{m.city}</p>
              <span className={`font-black text-sm ${colorCls[m.color]}`}>
                {m.change > 0 ? '+' : ''}{m.change}%
              </span>
            </div>
            <Sparkline data={m.spark} color={m.color} />
            <div className="mt-2 flex items-center justify-between">
              <span className="text-[9px] text-charcoal/40 font-display">VOL: {m.volume}</span>
              {m.change > 0
                ? <TrendingUp size={10} className="text-emerald-500" />
                : <TrendingDown size={10} className="text-red-400" />
              }
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Experts Grid ──────────────────────────────────────────────────────────────
function ExpertsGrid() {
  const colorCls = {
    violet: 'bg-violet-50 border-violet-200 text-violet-700',
    brand:  'bg-brand/8 border-brand/20 text-navy',
    emerald:'bg-emerald-50 border-emerald-200 text-emerald-700',
    amber:  'bg-amber-50 border-amber-200 text-amber-700',
    red:    'bg-red-50 border-red-200 text-red-700',
    sky:    'bg-sky-50 border-sky-200 text-sky-700',
  };
  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {EXPERTS.map((ex, i) => (
        <motion.div key={ex.name}
          initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }} transition={{ delay: i * 0.07 }}
          className="bg-white p-5 hover:-translate-y-1 transition-all shadow-[0_2px_8px_rgba(31,42,56,0.06)] hover:shadow-[0_16px_48px_rgba(31,42,56,0.13)] rounded-lg"
        >
          <div className="flex items-start justify-between mb-3">
            <div className="w-12 h-12 rounded-xl bg-navy flex items-center justify-center text-white font-black text-lg shrink-0">
              {ex.name.split(' ')[1]?.[0] || ex.name[0]}
            </div>
            <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${ex.avail ? 'bg-green-50 border-green-300 text-green-700' : 'bg-charcoal/5 border-charcoal/15 text-charcoal/40'}`}>
              {ex.avail ? '● متاح الآن' : '○ مشغول'}
            </span>
          </div>
          <p className="text-navy font-bold text-sm">{ex.name}</p>
          <p className="text-charcoal/60 text-xs mb-2">{ex.title}</p>
          <div className="flex flex-wrap gap-1 mb-3">
            {ex.credential.split(' · ').map(c => (
              <span key={c} className={`text-[9px] font-bold px-2 py-0.5 rounded-sm border ${colorCls[ex.color]}`}>{c}</span>
            ))}
          </div>
          <p className="text-charcoal/50 text-[11px] mb-3">{ex.specialty}</p>
          <div className="flex items-center justify-between border-t border-navy/8 pt-3">
            <div className="flex items-center gap-1 text-xs text-charcoal/50">
              <Briefcase size={11} /> <span>{ex.projects} مشروع</span>
            </div>
            <div className="flex items-center gap-1 text-xs text-charcoal/50">
              <MapPin size={11} /> {ex.city}
            </div>
          </div>
          <button onClick={() => toast(`سيتواصل ${ex.name} معك قريباً`)}
            className="w-full mt-3 border border-violet-500/30 text-violet-600 text-xs py-2 rounded-xl hover:bg-violet-50 transition-colors font-medium">
            طلب استشارة
          </button>
        </motion.div>
      ))}
    </div>
  );
}

// ── Study Tracker ─────────────────────────────────────────────────────────────
function StudyTracker() {
  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white p-6 shadow-[0_2px_8px_rgba(31,42,56,0.06)] rounded-lg">
        <div className="flex items-center justify-between mb-6">
          <div>
            <p className="text-navy font-black text-base">REQ-2025-0412</p>
            <p className="text-charcoal/50 text-xs">دراسة جدوى مجمع سكني — دمشق الجديدة</p>
          </div>
          <span className="text-[10px] font-bold bg-violet-50 border border-violet-200 text-violet-700 px-3 py-1 rounded-full">
            قيد التنفيذ
          </span>
        </div>
        <div className="relative">
          <div className="absolute right-4 top-4 bottom-4 w-0.5 bg-navy/8" />
          {TRACKER_STAGES.map((s, i) => (
            <div key={s.id} className="flex gap-4 mb-5 last:mb-0">
              <div className={`w-9 h-9 rounded-xl border-2 flex items-center justify-center shrink-0 z-10 ${
                s.done ? 'bg-green-500 border-green-500' : s.active ? 'bg-violet-500 border-violet-500' : 'bg-white border-navy/15'
              }`}>
                {s.done
                  ? <CheckCircle size={16} className="text-white" />
                  : s.active
                  ? <div className="w-2.5 h-2.5 bg-white rounded-full animate-pulse" />
                  : <span className="text-charcoal/30 font-display text-xs">{String(i+1).padStart(2,'0')}</span>
                }
              </div>
              <div className="pt-1.5">
                <p className={`text-sm font-bold ${s.done ? 'text-green-700' : s.active ? 'text-violet-700' : 'text-charcoal/40'}`}>
                  {s.label}
                </p>
                {s.active && <p className="text-xs text-violet-500 mt-0.5">يعمل عليها الفريق الآن — متوقع التسليم: 28 مايو 2026</p>}
                {s.done && <p className="text-xs text-green-600 mt-0.5">مكتمل ✓</p>}
              </div>
            </div>
          ))}
        </div>
        <div className="mt-6 bg-cream rounded-xl p-4 text-xs text-charcoal/60 space-y-1">
          <p className="text-navy font-bold mb-2">رسالة من الفريق</p>
          <p>مرحباً، الدراسة في مرحلة تحليل السوق. سنرسل مسودة تنفيذية للمراجعة يوم الأربعاء.</p>
        </div>
      </div>
    </div>
  );
}

// ── Study Type Selector ───────────────────────────────────────────────────────
function StudyTypeSelector({ value, onChange }) {
  const colorMap = {
    violet:  { active: 'border-violet-500 bg-violet-50 text-violet-700', icon: 'text-violet-500' },
    brand:   { active: 'border-brand bg-brand/8 text-navy',              icon: 'text-brand' },
    emerald: { active: 'border-emerald-500 bg-emerald-50 text-emerald-700', icon: 'text-emerald-500' },
    amber:   { active: 'border-amber-500 bg-amber-50 text-amber-700',    icon: 'text-amber-500' },
    red:     { active: 'border-red-500 bg-red-50 text-red-700',          icon: 'text-red-500' },
    sky:     { active: 'border-sky-500 bg-sky-50 text-sky-700',          icon: 'text-sky-500' },
  };
  const selected = STUDY_TYPES.find(t => t.value === value);
  return (
    <div>
      <div className="grid grid-cols-2 gap-0 border border-navy/12 bg-white/50 rounded-xl overflow-hidden">
        {STUDY_TYPES.map((t, idx) => {
          const c = colorMap[t.color];
          const active = value === t.value;
          const bRight = idx % 2 === 0 ? 'border-l border-navy/10' : '';
          const bBottom = idx < STUDY_TYPES.length - 2 ? 'border-b border-navy/10' : '';
          return (
            <button key={t.value} type="button" onClick={() => onChange(t.value)}
              className={`flex items-center gap-2 p-2.5 text-right transition-all text-xs font-medium ${bRight} ${bBottom} ${active ? c.active + ' shadow-inner' : 'bg-transparent text-charcoal/60 hover:bg-navy/5'}`}>
              <t.icon size={13} className={active ? c.icon : 'text-charcoal/40'} />
              <span className="leading-tight text-[10px]">{t.label}</span>
            </button>
          );
        })}
      </div>
      {selected && (
        <p className="text-violet-600 text-[10px] font-bold mt-1.5 flex items-center gap-1">
          <DollarSign size={9} /> سعر هذه الدراسة: {selected.price}
        </p>
      )}
    </div>
  );
}

// ── Request Form ──────────────────────────────────────────────────────────────
function RequestForm() {
  const { pushCrossHint } = useGlobalData();
  const [step, setStep] = useState(1);
  const [sent, setSent] = useState(false);
  const [form, setForm] = useState({
    studyType:'', governorate:'', district:'', projectName:'',
    projectDesc:'', area:'', budget:'', timeline:'',
    name:'', company:'', phone:'', email:'', notes:'',
  });
  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));
  const canNext1 = form.studyType && form.governorate && form.projectName;
  const canNext2 = form.budget && form.timeline;
  const canSubmit = form.name && form.phone;

  const submit = (e) => {
    e.preventDefault();
    if (!canSubmit) { toast.error('يرجى إدخال اسمك ورقم هاتفك'); return; }
    setSent(true);
    toast.success('تم إرسال طلبك! سنتواصل معك خلال 24 ساعة');
    pushCrossHint({
      emoji: '⚖️',
      text: 'هل تحتاج إلى تخليص المعاملات القانونية أو سند الملكية لموقع الدراسة؟',
      label: 'قسم التخليص',
      to: '/clearing'
    });
  };

  if (sent) return (
    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
      className="bg-white p-8 text-center shadow-[0_2px_8px_rgba(31,42,56,0.06)] rounded-lg">
      <div className="w-16 h-16 rounded-full bg-green-50 border-2 border-green-200 flex items-center justify-center mx-auto mb-4">
        <CheckCircle size={32} className="text-green-500" />
      </div>
      <p className="text-navy font-black text-lg mb-2">تم استلام طلبك</p>
      <p className="text-charcoal/60 text-sm mb-4">سيتواصل معك خبراؤنا خلال <span className="text-navy font-bold">24 ساعة</span></p>
      <div className="bg-cream rounded-xl p-4 text-right space-y-1.5 text-xs text-charcoal/60 mb-5">
        <p><span className="font-bold text-navy">الدراسة:</span> {STUDY_TYPES.find(t => t.value === form.studyType)?.label}</p>
        <p><span className="font-bold text-navy">الموقع:</span> {form.governorate}{form.district ? ' — ' + form.district : ''}</p>
        <p><span className="font-bold text-navy">المشروع:</span> {form.projectName}</p>
      </div>
      <button onClick={() => { setSent(false); setStep(1); setForm({ studyType:'',governorate:'',district:'',projectName:'',projectDesc:'',area:'',budget:'',timeline:'',name:'',company:'',phone:'',email:'',notes:'' }); }}
        className="text-xs text-brand hover:text-navy transition-colors">إرسال طلب آخر</button>
    </motion.div>
  );

  return (
    <div className="blueprint-card overflow-hidden">
      <div className="bg-navy px-6 py-4 border-b border-navy/20 flex justify-between items-center">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-1.5 h-1.5 bg-violet-500" />
            <p className="text-white font-bold text-sm uppercase tracking-widest">طلب دراسة مخصصة</p>
          </div>
          <p className="text-white/50 text-[10px] font-display tracking-widest">SPEC-REQ-01 // 24H RESPONSE</p>
        </div>
        <Send size={20} strokeWidth={1.5} className="text-violet-400" />
      </div>
      <div className="flex border-b border-navy/10 bg-white/40">
        {[['1','تفاصيل المشروع'],['2','النطاق والميزانية'],['3','بياناتك']].map(([n, label], idx) => {
          const num = idx + 1; const done = step > num; const active = step === num;
          return (
            <div key={n} className={`flex-1 py-2 px-3 text-[10px] font-bold border-r border-navy/5 last:border-0 ${active ? 'bg-violet-50 text-violet-700' : done ? 'bg-green-50 text-green-700' : 'text-charcoal/40'}`}>
              <span className={`font-display text-xs mr-1 ${active ? 'text-violet-500' : done ? 'text-green-500' : 'text-charcoal/30'}`}>{done ? 'OK' : `0${n}`}</span>
              <span className="uppercase tracking-wider">{label}</span>
            </div>
          );
        })}
      </div>
      <form onSubmit={submit} className="p-5 space-y-4">
        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div key="s1" initial={{ opacity:0, x:20 }} animate={{ opacity:1, x:0 }} exit={{ opacity:0, x:-20 }} className="space-y-4">
              <div>
                <label className="text-charcoal/60 text-xs mb-2 block font-medium">نوع الدراسة *</label>
                <StudyTypeSelector value={form.studyType} onChange={v => set('studyType', v)} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-charcoal/60 text-xs mb-1 block">المحافظة *</label>
                  <select value={form.governorate} onChange={e => set('governorate', e.target.value)} className="input-field text-sm">
                    <option value="">اختر</option>
                    {GOVERNORATES.map(g => <option key={g}>{g}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-charcoal/60 text-xs mb-1 block">المنطقة / الحي</label>
                  <input value={form.district} onChange={e => set('district', e.target.value)} placeholder="المزة، الفرقان..." className="input-field text-sm" />
                </div>
              </div>
              <div>
                <label className="text-charcoal/60 text-xs mb-1 block">اسم المشروع *</label>
                <input value={form.projectName} onChange={e => set('projectName', e.target.value)} placeholder="مجمع سكني 80 وحدة" className="input-field text-sm" />
              </div>
              <div>
                <label className="text-charcoal/60 text-xs mb-1 block">وصف المشروع</label>
                <textarea value={form.projectDesc} onChange={e => set('projectDesc', e.target.value)} rows={2} placeholder="نوع الاستخدام، المساحة، الهدف..." className="input-field text-sm resize-none" />
              </div>
              <button type="button" disabled={!canNext1} onClick={() => setStep(2)}
                className="w-full btn-cta flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed">
                التالي <ChevronRight size={15} />
              </button>
            </motion.div>
          )}
          {step === 2 && (
            <motion.div key="s2" initial={{ opacity:0, x:20 }} animate={{ opacity:1, x:0 }} exit={{ opacity:0, x:-20 }} className="space-y-4">
              <div>
                <label className="text-charcoal/60 text-xs mb-1 block">مساحة المشروع (م²)</label>
                <div className="relative">
                  <input value={form.area} onChange={e => set('area', e.target.value)} placeholder="5000" type="number" min="0" className="input-field text-sm pl-12" />
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-charcoal/40 text-xs">م²</span>
                </div>
              </div>
              <div>
                <label className="text-charcoal/60 text-xs mb-2 block font-medium">الميزانية المتوقعة *</label>
                <div className="grid grid-cols-1 gap-1.5">
                  {BUDGETS.map(b => (
                    <button key={b.value} type="button" onClick={() => set('budget', b.value)}
                      className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm text-right transition-all ${form.budget === b.value ? 'border-violet-500 bg-violet-50 text-violet-700 font-bold' : 'border-navy/12 bg-white text-charcoal/60 hover:border-navy/30'}`}>
                      <DollarSign size={13} className={form.budget === b.value ? 'text-violet-500' : 'text-charcoal/30'} /> {b.label}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-charcoal/60 text-xs mb-2 block font-medium">الجدول الزمني *</label>
                <div className="grid grid-cols-2 gap-2">
                  {TIMELINES.map(t => (
                    <button key={t.value} type="button" onClick={() => set('timeline', t.value)}
                      className={`flex items-center gap-1.5 px-3 py-2.5 rounded-xl border text-xs text-right transition-all ${form.timeline === t.value ? 'border-violet-500 bg-violet-50 text-violet-700 font-bold' : 'border-navy/12 bg-white text-charcoal/60 hover:border-navy/30'}`}>
                      <Calendar size={12} className={form.timeline === t.value ? 'text-violet-500' : 'text-charcoal/30'} /> {t.label}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex gap-2">
                <button type="button" onClick={() => setStep(1)} className="flex-1 py-2.5 rounded-xl border border-navy/15 text-charcoal/60 text-sm hover:border-brand/40 hover:text-navy transition-all">رجوع</button>
                <button type="button" disabled={!canNext2} onClick={() => setStep(3)}
                  className="flex-1 btn-cta flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed">
                  التالي <ChevronRight size={15} />
                </button>
              </div>
            </motion.div>
          )}
          {step === 3 && (
            <motion.div key="s3" initial={{ opacity:0, x:20 }} animate={{ opacity:1, x:0 }} exit={{ opacity:0, x:-20 }} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-charcoal/60 text-xs mb-1 block">الاسم الكامل *</label>
                  <div className="relative"><User size={13} className="absolute right-3 top-1/2 -translate-y-1/2 text-charcoal/40" />
                    <input value={form.name} onChange={e => set('name', e.target.value)} placeholder="اسمك" className="input-field text-sm pr-9" />
                  </div>
                </div>
                <div>
                  <label className="text-charcoal/60 text-xs mb-1 block">الشركة</label>
                  <div className="relative"><Building2 size={13} className="absolute right-3 top-1/2 -translate-y-1/2 text-charcoal/40" />
                    <input value={form.company} onChange={e => set('company', e.target.value)} placeholder="اختياري" className="input-field text-sm pr-9" />
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-charcoal/60 text-xs mb-1 block">رقم الهاتف *</label>
                  <div className="relative"><Phone size={13} className="absolute right-3 top-1/2 -translate-y-1/2 text-charcoal/40" />
                    <input value={form.phone} onChange={e => set('phone', e.target.value)} placeholder="+963 ..." className="input-field text-sm pr-9 font-mono" />
                  </div>
                </div>
                <div>
                  <label className="text-charcoal/60 text-xs mb-1 block">البريد الإلكتروني</label>
                  <div className="relative"><Mail size={13} className="absolute right-3 top-1/2 -translate-y-1/2 text-charcoal/40" />
                    <input value={form.email} onChange={e => set('email', e.target.value)} placeholder="اختياري" type="email" className="input-field text-sm pr-9" />
                  </div>
                </div>
              </div>
              <div>
                <label className="text-charcoal/60 text-xs mb-1 block">ملاحظات</label>
                <textarea value={form.notes} onChange={e => set('notes', e.target.value)} rows={2} placeholder="أي تفاصيل إضافية..." className="input-field text-sm resize-none" />
              </div>
              {form.phone && (
                <a href={`https://wa.me/${form.phone.replace(/\D/g,'')}?text=${encodeURIComponent(`طلب دراسة: ${STUDY_TYPES.find(t=>t.value===form.studyType)?.label||form.studyType} في ${form.governorate}`)}`}
                  target="_blank" rel="noreferrer"
                  className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl border border-green-400/50 bg-green-50 text-green-700 text-sm font-medium hover:bg-green-100 transition-colors">
                  <MessageCircle size={14} /> أرسل عبر واتساب
                </a>
              )}
              <div className="bg-cream rounded-xl p-3 space-y-1 text-xs text-charcoal/60">
                <p className="text-navy font-bold text-xs mb-1.5">ملخص الطلب</p>
                <p><span className="text-navy font-semibold">الدراسة:</span> {STUDY_TYPES.find(t=>t.value===form.studyType)?.label||'—'}</p>
                <p><span className="text-navy font-semibold">الموقع:</span> {form.governorate}{form.district?' — '+form.district:''}</p>
                <p><span className="text-navy font-semibold">الميزانية:</span> {BUDGETS.find(b=>b.value===form.budget)?.label||'—'}</p>
              </div>
              <div className="flex gap-2">
                <button type="button" onClick={() => setStep(2)} className="flex-1 py-2.5 rounded-xl border border-navy/15 text-charcoal/60 text-sm hover:border-brand/40 hover:text-navy transition-all">رجوع</button>
                <button type="submit" disabled={!canSubmit} className="flex-1 btn-cta flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed">
                  <Send size={14} /> إرسال الطلب
                </button>
              </div>
              <p className="text-charcoal/40 text-[10px] text-center flex items-center justify-center gap-1"><Shield size={10} /> بياناتك محمية وسرية</p>
            </motion.div>
          )}
        </AnimatePresence>
      </form>
    </div>
  );
}

// ── Study Card ────────────────────────────────────────────────────────────────
function StudyCard({ study, index, onSelect }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }} transition={{ duration: 0.45, delay: index * 0.06 }}
      className="blueprint-card p-5 hover:border-violet-500/60 hover:-translate-y-1 hover:shadow-[0_4px_20px_rgba(124,58,237,0.08)] transition-all duration-300 group overflow-hidden cursor-pointer"
      onClick={() => onSelect(study)}
    >
      <div className="absolute -bottom-8 -left-8 text-violet-500/5 pointer-events-none rotate-[-15deg]">
        <Award size={120} strokeWidth={1} />
      </div>
      <div className="relative z-10 flex items-start justify-between gap-3 mb-3 border-b border-navy/10 pb-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1.5 flex-wrap">
            <span className="font-display tracking-widest text-[10px] text-navy/40">ID-{String(study.id).padStart(4,'0')}</span>
            {study.free
              ? <span className="text-[10px] bg-green-50/50 border border-green-500/30 text-green-700 px-2 py-0.5 font-bold">مجاني</span>
              : <span className="text-[11px] font-black text-violet-600">${study.price?.toLocaleString()}</span>
            }
            {study.irr && <span className="text-[10px] bg-violet-50 border border-violet-200 text-violet-700 px-2 py-0.5 font-bold">IRR {study.irr}%</span>}
          </div>
          <h3 className="text-navy font-bold text-sm leading-snug">{study.title}</h3>
        </div>
        <div className="text-right shrink-0">
          <span className="block font-display text-navy/40 text-[10px] tracking-wider">{study.date.replace(/-/g,'.')}</span>
          <span className="block text-[10px] text-charcoal/40 mt-1">{study.city}</span>
        </div>
      </div>
      <p className="relative z-10 text-charcoal/60 text-xs leading-relaxed mb-4 line-clamp-2">{study.summary}</p>
      <div className="relative z-10 flex items-center justify-between text-xs border-t border-navy/10 pt-3">
        <div className="flex items-center gap-3">
          <span className="text-charcoal/50 flex items-center gap-1 font-display tracking-wider">
            <FileSearch size={11} className="text-navy/40" /> {study.pages}p
          </span>
          <span className="text-charcoal/50 flex items-center gap-1"><User size={11} className="text-navy/40" /> {study.author.replace('م. ','')}</span>
          <span className="flex items-center gap-0.5">
            {[...Array(5)].map((_,i) => <Star key={i} size={10} className={i < study.rating ? 'text-yellow-400 fill-yellow-400' : 'text-navy/15'} />)}
          </span>
        </div>
        <span className="flex items-center gap-1 text-violet-600 text-[11px] font-medium group-hover:underline">
          عرض التفاصيل <ChevronRight size={12} />
        </span>
      </div>
    </motion.div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
// ── Expert Application Modal ──────────────────────────────────────────────────
const CREDENTIALS = ['MRICS','IVS','LEED','UNOPS','PMP','PE','أخرى'];
const SPECIALTIES = ['تقييم عقاري','دراسات جدوى','هندسة إنشائية','تخطيط عمراني','استشارات بيئية','هندسة معمارية'];
const PROVINCES = ['دمشق','ريف دمشق','حلب','حمص','حماة','اللاذقية','طرطوس','إدلب','دير الزور','الرقة','الحسكة','السويداء','درعا','القنيطرة'];

function ExpertApplyModal({ onClose }) {
  const [form, setForm] = useState({
    name: '', specialty: SPECIALTIES[0], credentials: [], city: 'دمشق',
    years: '', phone: '', email: '', bio: '',
  });
  const [submitted, setSubmitted] = useState(false);

  const toggleCred = (c) =>
    setForm(f => ({ ...f, credentials: f.credentials.includes(c) ? f.credentials.filter(x => x !== c) : [...f.credentials, c] }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.phone || !form.email) { toast.error('يرجى تعبئة الاسم والبريد والهاتف'); return; }
    if (isConfigured) {
      const { error } = await supabase.from('expert_applications').insert({
        name:        form.name.trim(),
        specialty:   form.specialty,
        credentials: form.credentials,
        city:        form.city,
        years:       form.years ? Number(form.years) : null,
        phone:       form.phone.trim(),
        email:       form.email.trim(),
        bio:         form.bio.trim() || null,
      });
      if (error) { toast.error('حدث خطأ أثناء الإرسال، حاول مرة أخرى'); return; }
      sendEmail({
        to: 'hameddewihy@gmail.com',
        subject: `طلب انضمام خبير جديد — ${form.name}`,
        html: `<div dir="rtl" style="font-family:Arial,sans-serif">
          <h2>طلب انضمام خبير جديد</h2>
          <p><strong>الاسم:</strong> ${form.name}</p>
          <p><strong>التخصص:</strong> ${form.specialty}</p>
          <p><strong>المدينة:</strong> ${form.city}</p>
          <p><strong>سنوات الخبرة:</strong> ${form.years || 'غير محدد'}</p>
          <p><strong>الهاتف:</strong> ${form.phone}</p>
          <p><strong>البريد:</strong> ${form.email}</p>
          ${form.bio ? `<p><strong>نبذة:</strong> ${form.bio}</p>` : ''}
        </div>`,
      });
    }
    setSubmitted(true);
    toast.success('تم استلام طلبك — سيتواصل معك فريق RESURGO خلال 48 ساعة');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy/50 backdrop-blur-sm" dir="rtl">
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-lg border border-navy/10 max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between p-5 border-b border-navy/8 shrink-0">
          <div>
            <p className="text-navy font-black text-base">الانضمام لشبكة خبراء RESURGO</p>
            <p className="text-charcoal/50 text-xs mt-0.5">ابنِ محفظة مشاريع دولية مع أكبر منصة عقارية سورية</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-lg hover:bg-cream flex items-center justify-center text-charcoal/40 hover:text-navy transition-colors">
            <X size={16} />
          </button>
        </div>

        {submitted ? (
          <div className="flex-1 flex flex-col items-center justify-center p-10 text-center">
            <CheckCircle size={52} className="text-green-500 mb-4" />
            <p className="text-navy font-black text-lg mb-2">تم استلام طلبك!</p>
            <p className="text-charcoal/60 text-sm mb-6">سيراجع فريقنا ملفك ويتواصل معك على {form.email} خلال 48 ساعة.</p>
            <button onClick={onClose} className="bg-brand text-white px-8 py-2.5 rounded-xl font-bold text-sm">إغلاق</button>
          </div>
        ) : (
          <>
            <div className="overflow-y-auto flex-1 p-5">
              <form id="expert-apply-form" onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-charcoal/60 block mb-1">الاسم الكامل *</label>
                  <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required
                    placeholder="م. أحمد الخطيب"
                    className="w-full border border-navy/15 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-brand" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-charcoal/60 block mb-1">التخصص</label>
                    <select value={form.specialty} onChange={e => setForm(f => ({ ...f, specialty: e.target.value }))}
                      className="w-full border border-navy/15 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-brand">
                      {SPECIALTIES.map(s => <option key={s}>{s}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-charcoal/60 block mb-1">المدينة</label>
                    <select value={form.city} onChange={e => setForm(f => ({ ...f, city: e.target.value }))}
                      className="w-full border border-navy/15 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-brand">
                      {PROVINCES.map(c => <option key={c}>{c}</option>)}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="text-xs font-bold text-charcoal/60 block mb-1.5">الشهادات والاعتمادات</label>
                  <div className="flex flex-wrap gap-2">
                    {CREDENTIALS.map(c => (
                      <button key={c} type="button" onClick={() => toggleCred(c)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${form.credentials.includes(c) ? 'bg-brand text-white border-brand' : 'border-navy/15 text-charcoal/60 hover:border-brand/40'}`}>
                        {c}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-xs font-bold text-charcoal/60 block mb-1">سنوات الخبرة</label>
                  <input type="number" min="1" max="50" value={form.years} onChange={e => setForm(f => ({ ...f, years: e.target.value }))}
                    placeholder="10"
                    className="w-full border border-navy/15 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-brand" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-charcoal/60 block mb-1">رقم الهاتف *</label>
                    <input value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} required
                      placeholder="+963 9XX XXX XXX" dir="ltr"
                      className="w-full border border-navy/15 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-brand" />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-charcoal/60 block mb-1">البريد الإلكتروني *</label>
                    <input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} required
                      placeholder="expert@email.com" dir="ltr"
                      className="w-full border border-navy/15 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-brand" />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-bold text-charcoal/60 block mb-1">نبذة مختصرة</label>
                  <textarea value={form.bio} onChange={e => setForm(f => ({ ...f, bio: e.target.value }))}
                    rows={3} placeholder="اكتب نبذة عن خبرتك وأبرز مشاريعك..."
                    className="w-full border border-navy/15 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-brand resize-none" />
                </div>
              </form>
            </div>
            <div className="flex gap-2 p-5 border-t border-navy/8 shrink-0">
              <button form="expert-apply-form" type="submit"
                className="flex-1 bg-brand hover:bg-brand/90 text-white font-bold py-2.5 rounded-xl text-sm transition-colors flex items-center justify-center gap-2">
                <Send size={14} /> إرسال الطلب
              </button>
              <button onClick={onClose} className="px-4 border border-navy/15 text-charcoal/60 rounded-xl text-sm hover:text-navy transition-colors">إلغاء</button>
            </div>
          </>
        )}
      </motion.div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function StudiesPage() {
  const [pageTab, setPageTab]     = useState('catalog');
  const [cat, setCat]             = useState('all');
  const [query, setQuery]         = useState('');
  const [cityFilter, setCityFilter] = useState('all');
  const [priceFilter, setPriceFilter] = useState('all');
  const [selectedStudy, setSelectedStudy] = useState(null);
  const [showExpertApply, setShowExpertApply] = useState(false);

  const cities = ['all', ...Array.from(new Set(STUDIES.map(s => s.city)))];

  const filtered = useMemo(() => {
    let list = cat === 'all' ? STUDIES : STUDIES.filter(s => s.cat === cat);
    if (cityFilter !== 'all') list = list.filter(s => s.city === cityFilter);
    if (priceFilter === 'free') list = list.filter(s => s.free);
    if (priceFilter === 'under-1000') list = list.filter(s => !s.free && s.price < 1000);
    if (priceFilter === 'over-1000') list = list.filter(s => !s.free && s.price >= 1000);
    if (query.trim()) {
      const q = query.trim().toLowerCase();
      list = list.filter(s =>
        s.title.toLowerCase().includes(q) ||
        s.summary.toLowerCase().includes(q) ||
        s.tags.some(t => t.toLowerCase().includes(q)) ||
        s.city.includes(q)
      );
    }
    return list;
  }, [cat, cityFilter, priceFilter, query]);

  const marketIndices = MARKET_DATA.slice(0, 8);

  return (
    <div className="min-h-screen bg-engineering-grid" dir="rtl">
      <SEO
        title="الدراسات العقارية"
        description="تقارير وتحليلات السوق العقاري السوري — دراسات الجدوى والمقارنات"
        path="/studies"
      />
      <PageHero
        num="04"
        eyebrow="منصة الدراسات والجدوى"
        title={<h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white leading-[1.4]">التقارير الهندسية<br /><span className="text-violet-400">والمخططات التنفيذية.</span></h1>}
        subtitle="دراسات جدوى اقتصادية · تقارير هندسية معتمدة · تحليلات السوق العقاري السوري"
        accent="bg-violet-500"
        breadcrumb={[{ label: 'الرئيسية', to: '/' }, { label: 'الدراسات' }]}
      />

      {/* Market ticker */}
      <div className="bg-navy border-b border-white/10 px-4 py-2 overflow-x-auto text-white">
        <div className="max-w-7xl mx-auto flex items-center gap-8 text-[11px] whitespace-nowrap font-display tracking-widest uppercase">
          <span className="text-violet-400 flex items-center gap-1.5 shrink-0 font-bold"><TrendingUp size={12} /> Q2 2025 INDICES:</span>
          {marketIndices.map((m, idx) => (
            <span key={m.city} className={`flex items-center gap-2 ${idx !== marketIndices.length - 1 ? 'border-l border-white/10 pl-8' : ''}`}>
              <span className="text-white/50">{m.city}</span>
              <span className={m.change > 0 ? 'text-green-400' : 'text-red-400'}>
                {m.change > 0 ? '▲' : '▼'} {m.change > 0 ? '+' : ''}{m.change}%
              </span>
            </span>
          ))}
        </div>
      </div>

      {/* Page tabs */}
      <div className="bg-white/60 backdrop-blur-sm border-b border-navy/10 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex gap-1">
            {PAGE_TABS.map(tab => (
              <button key={tab.id} onClick={() => setPageTab(tab.id)}
                className={`flex items-center gap-2 px-5 py-3.5 text-xs font-bold border-b-2 transition-all ${pageTab === tab.id ? 'border-violet-500 text-violet-700' : 'border-transparent text-charcoal/50 hover:text-navy hover:border-navy/20'}`}>
                <tab.icon size={13} /> {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">

        {/* ── TAB: CATALOG ── */}
        {pageTab === 'catalog' && (
          <div className="grid lg:grid-cols-[1fr_360px] gap-8">
            <div>
              {/* Search + filter bar */}
              <div className="bg-white border border-navy/[0.08] rounded-xl p-4 mb-6 space-y-3">
                <div className="relative">
                  <Search size={15} className="absolute right-3 top-1/2 -translate-y-1/2 text-charcoal/40" />
                  <input
                    value={query} onChange={e => setQuery(e.target.value)}
                    placeholder="ابحث عن دراسة، مدينة، كلمة مفتاحية..."
                    className="input-field pr-9 text-sm w-full"
                  />
                </div>
                <div className="flex gap-2 flex-wrap items-center">
                  <SlidersHorizontal size={13} className="text-charcoal/40 shrink-0" />
                  <select value={cityFilter} onChange={e => setCityFilter(e.target.value)} className="text-xs border border-navy/12 rounded-lg px-3 py-1.5 bg-white text-charcoal/70">
                    <option value="all">كل المدن</option>
                    {cities.filter(c => c !== 'all').map(c => <option key={c}>{c}</option>)}
                  </select>
                  <select value={priceFilter} onChange={e => setPriceFilter(e.target.value)} className="text-xs border border-navy/12 rounded-lg px-3 py-1.5 bg-white text-charcoal/70">
                    <option value="all">كل الأسعار</option>
                    <option value="free">مجاني</option>
                    <option value="under-1000">أقل من $1,000</option>
                    <option value="over-1000">$1,000 وأكثر</option>
                  </select>
                </div>
                {/* Category pills */}
                <div className="flex gap-1.5 flex-wrap">
                  {CATEGORIES.map(({ id, label, icon: Icon }) => (
                    <button key={id} onClick={() => setCat(id)}
                      className={`flex items-center gap-1 px-3 py-1.5 rounded-full border text-[11px] font-medium transition-all ${cat === id ? 'bg-violet-500 border-violet-500 text-white' : 'border-navy/15 text-charcoal/60 hover:border-violet-400/40 hover:text-navy'}`}>
                      <Icon size={11} /> {label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Results count */}
              <p className="text-charcoal/40 text-xs mb-4 font-display tracking-wider">{filtered.length} دراسة / تقرير</p>

              {/* Studies grid */}
              <AnimatePresence mode="popLayout">
                <motion.div key={`${cat}-${cityFilter}-${priceFilter}-${query}`} className="grid sm:grid-cols-2 gap-4 mb-10">
                  {filtered.length > 0
                    ? filtered.map((s, i) => <StudyCard key={s.id} study={s} index={i} onSelect={setSelectedStudy} />)
                    : <div className="col-span-2 text-center py-16 text-charcoal/40">
                        <FileSearch size={40} className="mx-auto mb-3 opacity-30" />
                        <p className="text-sm">لا توجد دراسات تطابق معايير البحث</p>
                      </div>
                  }
                </motion.div>
              </AnimatePresence>

              {/* How it works */}
              <motion.div initial={{ opacity:0, y:20 }} whileInView={{ opacity:1, y:0 }} viewport={{ once:true }} className="bg-white p-6 mb-8 shadow-[0_2px_8px_rgba(31,42,56,0.06)] rounded-lg">
                <p className="text-violet-600 text-xs font-bold tracking-widest uppercase mb-1">كيف يعمل؟</p>
                <h3 className="text-navy font-black text-lg mb-5">خطوات طلب دراسة مخصصة</h3>
                <div className="space-y-0">
                  {PROCESS_STEPS.map((s, i) => (
                    <div key={s.num} className="flex gap-4 relative">
                      <div className="flex flex-col items-center">
                        <div className="w-9 h-9 rounded-xl bg-violet-50 border-2 border-violet-200 flex items-center justify-center text-violet-600 font-black text-xs shrink-0">{s.num}</div>
                        {i < PROCESS_STEPS.length - 1 && <div className="w-0.5 flex-1 bg-navy/8 my-1" />}
                      </div>
                      <div className="pb-5 flex-1">
                        <p className="text-navy font-bold text-sm">{s.title}</p>
                        <p className="text-charcoal/60 text-xs mt-0.5">{s.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>

              {/* Cross-links */}
              <div className="grid sm:grid-cols-2 gap-4">
                <Link to="/crowdfund" className="bg-white p-4 flex items-center gap-4 hover:-translate-y-1 transition-all group shadow-[0_2px_8px_rgba(31,42,56,0.06)] hover:shadow-[0_8px_24px_rgba(31,42,56,0.10)] rounded-lg">
                  <div className="w-12 h-12 rounded-xl bg-cta/10 border border-cta/20 flex items-center justify-center shrink-0">
                    <Globe size={22} className="text-cta" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-navy font-bold text-sm">مشاريع تحتاج دراسة جدوى</p>
                    <p className="text-charcoal/55 text-xs mt-0.5">استعرض مشاريع التمويل الجماعي التي تحتاج تقييم</p>
                  </div>
                  <ChevronRight size={14} className="text-cta/60 shrink-0 group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link to="/properties" className="bg-white p-4 flex items-center gap-4 hover:-translate-y-1 transition-all group shadow-[0_2px_8px_rgba(31,42,56,0.06)] hover:shadow-[0_8px_24px_rgba(31,42,56,0.10)] rounded-lg">
                  <div className="w-12 h-12 rounded-xl bg-brand/10 border border-brand/20 flex items-center justify-center shrink-0">
                    <Home size={22} className="text-brand" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-navy font-bold text-sm">عقارات تحتاج تقرير تقييم</p>
                    <p className="text-charcoal/55 text-xs mt-0.5">عقارات في السوق تحتاج تقييم IVS رسمي قبل البيع</p>
                  </div>
                  <ChevronRight size={14} className="text-brand/60 shrink-0 group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link to="/valuation" className="bg-white p-4 flex items-center gap-4 hover:-translate-y-1 transition-all group sm:col-span-2 shadow-[0_2px_8px_rgba(31,42,56,0.06)] hover:shadow-[0_8px_24px_rgba(31,42,56,0.10)] rounded-lg">
                  <div className="w-12 h-12 rounded-xl bg-violet-50 border border-violet-200 flex items-center justify-center shrink-0">
                    <FileSearch size={22} className="text-violet-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-navy font-bold text-sm flex items-center gap-2">
                      التقييم العقاري المعتمد — IVS 2025
                      <span className="text-[9px] bg-green-50 border border-green-200 text-green-700 font-bold px-2 py-0.5 rounded-full">تقدير مجاني</span>
                    </p>
                    <p className="text-charcoal/55 text-xs mt-0.5">الدراسة + التقييم = صورة استثمارية متكاملة. تقدير آلي فوري مجاني أو تقرير MRICS معتمد للبيع والتمويل</p>
                  </div>
                  <ChevronRight size={14} className="text-violet-400 shrink-0 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </div>

            {/* Right column */}
            <div className="space-y-5">
              <RequestForm />
              <IRRCalculator />
              {/* Trust badges */}
              <div className="bg-white p-5 shadow-[0_2px_8px_rgba(31,42,56,0.06)] rounded-lg">
                <p className="text-charcoal/50 text-xs font-semibold uppercase tracking-wider mb-4">لماذا RESURGO؟</p>
                <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-3 flex items-start gap-3 mb-4">
                  <Shield className="text-green-600 shrink-0 mt-0.5" size={16} />
                  <div>
                    <p className="text-green-700 font-bold text-xs mb-0.5">مدفوعاتك محمية (Escrow)</p>
                    <p className="text-green-700/70 text-[10px] leading-relaxed">تُحوَّل للخبير فقط بعد استلامك الدراسة كاملة.</p>
                  </div>
                </div>
                <div className="space-y-3">
                  {[
                    [Shield, 'معتمد وفق IVS 2025 · RICS', 'تقارير بأعلى المعايير الدولية'],
                    [Users, 'فريق من 40+ خبيراً', 'مهندسون ومحللون ماليون معتمدون'],
                    [Award, 'أكثر من 250 دراسة منجزة', 'بتقييم 4.9/5 من عملائنا'],
                    [Clock, 'تسليم في الموعد', 'نلتزم بالجدول الزمني المتفق عليه'],
                  ].map(([Icon, title, desc]) => (
                    <div key={title} className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-lg bg-violet-50 border border-violet-100 flex items-center justify-center shrink-0">
                        <Icon size={14} className="text-violet-500" />
                      </div>
                      <div>
                        <p className="text-navy font-bold text-xs">{title}</p>
                        <p className="text-charcoal/50 text-[11px]">{desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Platform stats */}
              <div className="bg-white p-5 shadow-[0_2px_8px_rgba(31,42,56,0.06)] rounded-lg">
                <p className="text-charcoal/50 text-xs font-semibold uppercase tracking-wider mb-4">إحصائيات المنصة</p>
                <div className="grid grid-cols-2 gap-3">
                  {[['142','دراسة جدوى','text-violet-600'],['89','تقرير هندسي','text-brand'],['38','تقرير سوق','text-emerald-600'],['14','محافظة','text-cta']].map(([val,label,cls]) => (
                    <div key={label} className="bg-cream rounded-xl p-3 text-center">
                      <p className={`font-black text-xl ${cls}`}>{val}</p>
                      <p className="text-charcoal/50 text-[10px] mt-0.5">{label}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Free report CTA */}
              <div className="bg-white p-5 text-center shadow-[0_2px_8px_rgba(31,42,56,0.06)] rounded-lg">
                <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center mx-auto mb-3">
                  <BookOpen size={22} className="text-emerald-500" />
                </div>
                <p className="text-navy font-bold text-sm mb-1">تقرير السوق مجاناً</p>
                <p className="text-charcoal/60 text-xs mb-4">أحدث مؤشرات السوق العقاري السوري Q2 2025</p>
                <button onClick={() => toast.success('جارٍ تحميل التقرير المجاني...')}
                  className="w-full text-sm border border-emerald-500/40 text-emerald-600 hover:bg-emerald-50 py-2.5 rounded-xl transition-colors flex items-center justify-center gap-2 font-medium">
                  <Download size={14} /> تحميل مجاني
                </button>
              </div>

              {/* Emergency contact */}
              <div className="bg-navy text-white p-5 rounded-lg shadow-[0_2px_8px_rgba(31,42,56,0.18)]">
                <div className="flex items-center gap-2 mb-2">
                  <AlertCircle size={15} className="text-cta" />
                  <p className="text-white font-bold text-sm">تحتاج استشارة عاجلة؟</p>
                </div>
                <p className="text-white/60 text-xs mb-4">فريقنا متاح للرد الفوري على استفساراتك</p>
                <a href="https://wa.me/963000000000?text=مرحباً%2C%20أود%20الاستفسار%20عن%20دراسة"
                  target="_blank" rel="noreferrer"
                  className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-green-400/40 bg-green-500/15 text-white text-sm font-medium hover:bg-green-500/25 transition-colors">
                  <MessageCircle size={14} className="text-green-400" /> تواصل عبر واتساب
                </a>
              </div>
            </div>
          </div>
        )}

        {/* ── TAB: MARKET ── */}
        {pageTab === 'market' && (
          <div className="space-y-8">
            <MarketCityGrid />
            <div className="bg-white p-6 shadow-[0_2px_8px_rgba(31,42,56,0.06)] rounded-lg">
              <h3 className="text-navy font-black text-lg mb-2">تفسير المؤشرات</h3>
              <p className="text-charcoal/60 text-sm leading-relaxed mb-4">
                المؤشرات تعكس التغير السنوي في الأسعار مقارنةً بـ Q2 2024 استناداً إلى بيانات عقود البيع المسجلة. الأسواق الحمراء (إدلب، دير الزور، الرقة) تعكس الهشاشة الأمنية لا انهياراً هيكلياً، ومن المتوقع تعافيها مع الاستقرار.
              </p>
              <div className="grid sm:grid-cols-3 gap-4">
                {[
                  ['الأكثر نمواً', 'اللاذقية +15.3%', 'text-emerald-600', 'bg-emerald-50'],
                  ['الأعلى حجماً', 'دمشق 1,840 صفقة', 'text-violet-600', 'bg-violet-50'],
                  ['أكثر التوقعات', 'حلب — تسارع 2025', 'text-brand', 'bg-brand/8'],
                ].map(([label, val, cls, bg]) => (
                  <div key={label} className={`${bg} rounded-xl p-4 text-center`}>
                    <p className="text-charcoal/50 text-[10px] mb-1">{label}</p>
                    <p className={`font-black text-sm ${cls}`}>{val}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-white p-6 shadow-[0_2px_8px_rgba(31,42,56,0.06)] rounded-lg">
              <h3 className="text-navy font-black text-base mb-4">توقعات H2 2025</h3>
              <div className="space-y-3">
                {[
                  ['دمشق', 'نمو مستمر 6-9% في ظل الاستقرار السياسي', 'emerald'],
                  ['حلب', 'تسارع ملحوظ — إعادة الإعمار تبدأ مرحلة جديدة', 'emerald'],
                  ['اللاذقية', 'ذروة الطلب في الصيف — موسمية عالية', 'sky'],
                  ['إدلب', 'تعافٍ حذر رهنه الاستقرار الأمني', 'amber'],
                  ['دير الزور', 'يتوقف على قرارات إعادة الإعمار الحكومي', 'red'],
                ].map(([city, text, color]) => {
                  const cls = { emerald:'text-emerald-600 bg-emerald-50', sky:'text-sky-600 bg-sky-50', amber:'text-amber-600 bg-amber-50', red:'text-red-500 bg-red-50' };
                  return (
                    <div key={city} className="flex items-start gap-3">
                      <span className={`text-[10px] font-bold px-2 py-1 rounded-lg shrink-0 ${cls[color]}`}>{city}</span>
                      <p className="text-charcoal/60 text-xs pt-1">{text}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* ── TAB: EXPERTS ── */}
        {pageTab === 'experts' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-navy font-black text-2xl">فريق الخبراء</h2>
                <p className="text-charcoal/55 text-sm mt-1">محترفون معتمدون دولياً في تقييم العقارات والدراسات الهندسية</p>
              </div>
              <div className="text-right hidden sm:block">
                <p className="text-charcoal/40 text-[10px] font-display tracking-widest">40+ EXPERT</p>
                <p className="text-charcoal/40 text-[10px]">MRICS · IVS · LEED · UNOPS</p>
              </div>
            </div>
            <ExpertsGrid />
            <div className="bg-white p-6 text-center shadow-[0_2px_8px_rgba(31,42,56,0.06)] rounded-lg">
              <p className="text-navy font-bold text-base mb-2">هل أنت خبير عقاري أو هندسي؟</p>
              <p className="text-charcoal/60 text-sm mb-4">انضم لشبكة RESURGO وابنِ محفظة مشاريع دولية</p>
              <button onClick={() => setShowExpertApply(true)}
                className="btn-cta px-8 flex items-center justify-center gap-2 mx-auto">
                <ExternalLink size={14} /> تقدم للانضمام
              </button>
            </div>
          </div>
        )}

        {/* ── TAB: TRACKER ── */}
        {pageTab === 'tracker' && (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-navy font-black text-2xl mb-2">متابعة طلبك</h2>
              <p className="text-charcoal/55 text-sm">تابع حالة دراستك في الوقت الفعلي</p>
            </div>
            <StudyTracker />
            <div className="bg-white p-5 max-w-2xl mx-auto shadow-[0_2px_8px_rgba(31,42,56,0.06)] rounded-lg">
              <p className="text-navy font-bold text-sm mb-3">لا تجد طلبك؟</p>
              <p className="text-charcoal/60 text-xs mb-3">أرسل رقم طلبك عبر واتساب ليحدّثك الفريق فوراً</p>
              <a href="https://wa.me/963000000000?text=أريد%20متابعة%20طلب%20رقم%20REQ-"
                target="_blank" rel="noreferrer"
                className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl border border-green-400/50 bg-green-50 text-green-700 text-sm font-medium hover:bg-green-100 transition-colors">
                <MessageCircle size={14} /> تواصل لمتابعة طلبك
              </a>
            </div>
          </div>
        )}

      </div>

      {/* Study Detail Drawer */}
      <AnimatePresence>
        {selectedStudy && (
          <StudyDetailDrawer study={selectedStudy} onClose={() => setSelectedStudy(null)} />
        )}
      </AnimatePresence>

      {/* Expert Apply Modal */}
      <AnimatePresence>
        {showExpertApply && (
          <ExpertApplyModal onClose={() => setShowExpertApply(false)} />
        )}
      </AnimatePresence>
    </div>
  );
}
