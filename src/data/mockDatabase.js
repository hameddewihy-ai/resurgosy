// ── Central Mock Database for RESURGO ──────────────────────────────────────────
// Schema version: 1.0 — aligned with src/data/schema.js
// Future: replace raw arrays with API calls to the same contract.

// ── UUID + timestamp enrichment ───────────────────────────────────────────────
// Derives a stable UUID-like string from an entity prefix + legacy id.
// When a real DB is introduced, swap these for actual UUIDs from the backend.
function makeUUID(prefix, id) {
  const hex = String(id).replace(/\D/g, '').padStart(12, '0');
  return `${prefix}-0000-4000-a000-${hex}`;
}

export function enrichRecords(prefix, records, timestampBase = '2025-01-01T00:00:00Z') {
  return records.map((r, i) => ({
    uuid: r.uuid ?? makeUUID(prefix, r.id ?? i + 1),
    created_at: r.created_at ?? timestampBase,
    updated_at: r.updated_at ?? timestampBase,
    ...r,
  }));
}

// ── Mock Data Aggregation ───────────────────────────────────────────────────

export const INITIAL_DEVELOPERS = [
  {
    id: 1, name: 'مجموعة الشام للتطوير العقاري', initials: 'شت', color: '#5979bb', city: 'دمشق', founded: 2008,
    projectsCount: 12, completedCount: 9, rating: 4.8, verified: true, specialty: ['سكني', 'تجاري'],
    description: 'رائدة في تطوير المجمعات السكنية الفاخرة في دمشق وريفها منذ 2008', totalUnits: 2400,
    coverImage: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&q=80',
    about: 'مجموعة الشام للتطوير العقاري هي إحدى أبرز شركات التطوير في سوريا، أسست محفظتها على مبادئ الجودة والابتكار. تمتلك الشركة خبرة واسعة في تنفيذ المشاريع السكنية والتجارية الفاخرة بمعايير دولية.',
    certifications: ['ISO 9001:2015', 'شهادة الجودة السورية', 'عضو غرفة التجارة الدمشقية'],
    phone: '+963 11 223 4567',
    email: 'info@alsham-dev.sy',
    employees: 320,
  },
  {
    id: 2, name: 'شركة الفرات للإنشاء والتطوير', initials: 'فر', color: '#f37124', city: 'حلب', founded: 2011,
    projectsCount: 8, completedCount: 6, rating: 4.6, verified: true, specialty: ['سكني', 'صناعي'],
    description: 'خبرة 13 عاماً في إنشاء المجمعات السكنية والمناطق الصناعية في شمال سوريا', totalUnits: 1600,
    coverImage: 'https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=800&q=80',
    about: 'شركة الفرات للإنشاء والتطوير تعمل من حلب لتطوير مجمعات سكنية ومناطق صناعية تخدم المجتمع الحلبي. تتميز الشركة بكفاءة تنفيذية عالية وقدرة على تسليم المشاريع في وقتها المحدد.',
    certifications: ['ISO 9001:2015', 'عضو اتحاد المقاولين السوريين', 'شهادة السلامة OHSAS'],
    phone: '+963 21 345 6789',
    email: 'contact@alfurat-dev.sy',
    employees: 215,
  },
  {
    id: 3, name: 'مؤسسة البحر للاستثمار العقاري', initials: 'بح', color: '#0ea5e9', city: 'اللاذقية', founded: 2015,
    projectsCount: 6, completedCount: 4, rating: 4.7, verified: true, specialty: ['سكني', 'سياحي'],
    description: 'تخصص في المشاريع السياحية والسكنية الفاخرة على الساحل السوري', totalUnits: 980,
    coverImage: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&q=80',
    about: 'مؤسسة البحر للاستثمار العقاري رائدة في تطوير المشاريع السياحية والسكنية على الساحل السوري. تجمع الشركة بين التصميم المعماري المبتكر والبيئة الطبيعية الخلابة لخلق مجتمعات ساحلية متكاملة.',
    certifications: ['عضو اتحاد السياحة السورية', 'ISO 14001 بيئي', 'شهادة الاستدامة الخضراء'],
    phone: '+963 41 456 7890',
    email: 'info@albahr-invest.sy',
    employees: 120,
  },
  {
    id: 4, name: 'الوطنية للتطوير والاستثمار', initials: 'وط', color: '#16a34a', city: 'دمشق', founded: 2005,
    projectsCount: 18, completedCount: 15, rating: 4.9, verified: true, specialty: ['تجاري', 'إداري'],
    description: 'الأكثر خبرة في تطوير الأبراج التجارية والمراكز الإدارية في العاصمة', totalUnits: 3200,
    coverImage: 'https://images.unsplash.com/photo-1494526585095-c41746248156?w=800&q=80',
    about: 'الوطنية للتطوير والاستثمار هي الشركة الأولى في سوريا من حيث عدد الأبراج التجارية المنفذة. تأسست عام 2005 وبنت سمعة راسخة على الالتزام بأعلى معايير الجودة والتسليم في الموعد المحدد.',
    certifications: ['ISO 9001:2015', 'ISO 14001:2015', 'عضو مجلس الأعمال السوري', 'LEED Certified'],
    phone: '+963 11 567 8901',
    email: 'invest@alwataniya-dev.sy',
    employees: 480,
  },
  {
    id: 5, name: 'شركة حمص للمشاريع الإنشائية', initials: 'حم', color: '#9333ea', city: 'حمص', founded: 2012,
    projectsCount: 7, completedCount: 5, rating: 4.4, verified: false, specialty: ['سكني'],
    description: 'متخصصة في إعادة الإعمار وتطوير الأحياء السكنية في مدينة حمص', totalUnits: 1100,
    coverImage: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800&q=80',
    about: 'شركة حمص للمشاريع الإنشائية تأسست في أعقاب الأزمة لتقود مبادرات إعادة الإعمار في المدينة. تعمل الشركة على توفير وحدات سكنية عالية الجودة بأسعار تنافسية لأبناء حمص.',
    certifications: ['عضو غرفة التجارة الحمصية', 'شهادة مقاول من الفئة الأولى'],
    phone: '+963 31 678 9012',
    email: 'homs@homs-projects.sy',
    employees: 95,
  },
  {
    id: 6, name: 'دار طرطوس للتطوير', initials: 'طس', color: '#dc2626', city: 'طرطوس', founded: 2017,
    projectsCount: 4, completedCount: 2, rating: 4.5, verified: true, specialty: ['سكني', 'سياحي'],
    description: 'شركة صاعدة تطور مشاريع سكنية وسياحية على ساحل طرطوس', totalUnits: 560,
    coverImage: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800&q=80',
    about: 'دار طرطوس للتطوير شركة متخصصة في إنشاء المجتمعات الساحلية المتكاملة على شاطئ طرطوس الجميل. تجمع بين الإقامة الدائمة والاستثمار السياحي في مشاريع متعددة الاستخدام.',
    certifications: ['عضو غرفة السياحة السورية', 'ISO 9001:2015', 'شهادة المقاول المعتمد'],
    phone: '+963 43 789 0123',
    email: 'info@dar-tartous.sy',
    employees: 75,
  },
];

export const INITIAL_PROJECTS = [
  {
    id: 1, developerId: 1, developerName: 'مجموعة الشام للتطوير العقاري', name: 'برج الشام السكني', city: 'دمشق', district: 'المزة',
    type: 'سكني', status: 'قيد الإنشاء', progress: 65, totalUnits: 180, availableUnits: 42, sold: 138, delivery: 'Q2 2026',
    priceFrom: 85000, image: 'https://images.unsplash.com/photo-1486325212027-8081e485255e?w=700&q=80', features: ['موقف متعدد الطوابق', 'حديقة مشتركة', 'أمن 24/7', 'مصعد ذكي', 'طاقة شمسية', 'نظام تكييف مركزي'],
    nextMilestone: 'إنهاء الهيكل',
    images: [
      'https://images.unsplash.com/photo-1486325212027-8081e485255e?w=900&q=80',
      'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=900&q=80',
      'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=900&q=80',
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=900&q=80',
    ],
    lat: 33.5024, lng: 36.2566,
    description: 'برج الشام السكني مشروع راقٍ يضم 180 وحدة سكنية موزعة على 12 طابقاً في قلب حي المزة الراقي بدمشق. يتميز المشروع بتشطيبات عالية المستوى وخدمات متكاملة تناسب أسلوب الحياة العصري.',
    paymentPlan: [
      { label: 'عند التعاقد', pct: 20 },
      { label: 'خلال الإنشاء', pct: 50 },
      { label: 'عند التسليم', pct: 30 },
    ],
    floorPlans: [
      { type: 'شقة 1 غرفة', area: 75, count: 40, priceFrom: 55000 },
      { type: 'شقة 2 غرفة', area: 110, count: 80, priceFrom: 75000 },
      { type: 'شقة 3 غرف', area: 150, count: 50, priceFrom: 95000 },
      { type: 'بنتهاوس', area: 220, count: 10, priceFrom: 180000 },
    ],
    investProjectId: 'inv-1',
  },
  {
    id: 2, developerId: 4, developerName: 'الوطنية للتطوير والاستثمار', name: 'مركز بيزنس دمشق', city: 'دمشق', district: 'كفرسوسة',
    type: 'تجاري', status: 'قيد الإنشاء', progress: 82, totalUnits: 120, availableUnits: 18, sold: 102, delivery: 'Q4 2025',
    priceFrom: 150000, image: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=700&q=80', features: ['مكاتب ذكية', 'صالة مؤتمرات', 'واجهة زجاجية', 'موقف 300 سيارة', 'مركز بيانات', 'خدمات فندقية'],
    nextMilestone: 'الواجهات الزجاجية',
    images: [
      'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=900&q=80',
      'https://images.unsplash.com/photo-1497366216548-37526070297c?w=900&q=80',
      'https://images.unsplash.com/photo-1460317442991-0ec209397118?w=900&q=80',
    ],
    lat: 33.5089, lng: 36.2847,
    description: 'مركز بيزنس دمشق هو مجمع مكاتب ذكي من الدرجة الأولى يلبي احتياجات الشركات الكبرى والمتوسطة في العاصمة. يوفر المشروع بيئة عمل متطورة بأعلى معايير الكفاءة التشغيلية.',
    paymentPlan: [
      { label: 'عند التعاقد', pct: 30 },
      { label: 'خلال الإنشاء', pct: 40 },
      { label: 'عند التسليم', pct: 30 },
    ],
    floorPlans: [
      { type: 'مكتب صغير', area: 50, count: 40, priceFrom: 80000 },
      { type: 'مكتب متوسط', area: 120, count: 50, priceFrom: 150000 },
      { type: 'طابق كامل', area: 400, count: 30, priceFrom: 420000 },
    ],
    investProjectId: null,
  },
  {
    id: 3, developerId: 3, developerName: 'مؤسسة البحر للاستثمار العقاري', name: 'قرية البحر السياحية', city: 'اللاذقية', district: 'الشاطئ الأزرق',
    type: 'سياحي', status: 'مخطط', progress: 20, totalUnits: 80, availableUnits: 80, sold: 0, delivery: 'Q1 2027',
    priceFrom: 120000, image: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=700&q=80', features: ['إطلالة بحرية', 'حمام سباحة', 'مطعم فاخر', 'ملاعب رياضية', 'مرسى خاص', 'سبا ومركز صحي'],
    nextMilestone: 'أعمال الحفر',
    images: [
      'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=900&q=80',
      'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=900&q=80',
      'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=900&q=80',
      'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=900&q=80',
    ],
    lat: 35.5317, lng: 35.7867,
    description: 'قرية البحر السياحية مشروع سياحي استثنائي على الشاطئ الأزرق في اللاذقية، يجمع بين السكن الفاخر والاستثمار السياحي. يضم المشروع شاليهات وفلل بإطلالات بحرية مباشرة مع خدمات فندقية متكاملة.',
    paymentPlan: [
      { label: 'عند التعاقد', pct: 25 },
      { label: 'خلال الإنشاء', pct: 45 },
      { label: 'عند التسليم', pct: 30 },
    ],
    floorPlans: [
      { type: 'شاليه ساحلي', area: 90, count: 40, priceFrom: 120000 },
      { type: 'فيلا بحرية', area: 200, count: 30, priceFrom: 220000 },
      { type: 'فيلا بانورامية', area: 320, count: 10, priceFrom: 380000 },
    ],
    investProjectId: null,
  },
  {
    id: 4, developerId: 2, developerName: 'شركة الفرات للإنشاء والتطوير', name: 'مجمع الفرات السكني', city: 'حلب', district: 'الحمدانية',
    type: 'سكني', status: 'قيد الإنشاء', progress: 48, totalUnits: 240, availableUnits: 98, sold: 142, delivery: 'Q3 2026',
    priceFrom: 55000, image: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=700&q=80', features: ['مدرسة خاصة', 'مستوصف', 'ملعب أطفال', 'سوبر ماركت', 'مسجد', 'مواقف أرضية وطابقية'],
    nextMilestone: 'التمديدات الصحية',
    images: [
      'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=900&q=80',
      'https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=900&q=80',
      'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=900&q=80',
    ],
    lat: 36.1984, lng: 37.1583,
    description: 'مجمع الفرات السكني مشروع متكامل الخدمات في حي الحمدانية الراقي بحلب، يضم 240 وحدة سكنية متنوعة. يوفر المجمع بيئة سكنية متكاملة تلبي جميع احتياجات الأسرة من التعليم والصحة والترفيه.',
    paymentPlan: [
      { label: 'عند التعاقد', pct: 15 },
      { label: 'خلال الإنشاء', pct: 55 },
      { label: 'عند التسليم', pct: 30 },
    ],
    floorPlans: [
      { type: 'شقة 1 غرفة', area: 70, count: 60, priceFrom: 42000 },
      { type: 'شقة 2 غرفة', area: 100, count: 100, priceFrom: 58000 },
      { type: 'شقة 3 غرف', area: 140, count: 70, priceFrom: 78000 },
      { type: 'شقة 4 غرف', area: 185, count: 10, priceFrom: 105000 },
    ],
    investProjectId: null,
  },
  {
    id: 5, developerId: 1, developerName: 'مجموعة الشام للتطوير العقاري', name: 'تلال دمشق — فلل فاخرة', city: 'دمشق', district: 'قدسيا',
    type: 'سكني', status: 'مكتمل', progress: 100, totalUnits: 45, availableUnits: 3, sold: 42, delivery: 'مكتمل 2024',
    priceFrom: 320000, image: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=700&q=80', features: ['حديقة خاصة', 'مسبح خاص', 'كراج مغلق', 'أنظمة ذكية', 'مولّد كهربائي احتياطي', 'نظام أمن متكامل'],
    nextMilestone: 'التسليم النهائي',
    images: [
      'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=900&q=80',
      'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=900&q=80',
      'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=900&q=80',
    ],
    lat: 33.5450, lng: 36.2300,
    description: 'تلال دمشق مشروع الفلل الفاخرة المكتمل في منطقة قدسيا الهادئة على تلال دمشق. يضم 45 فيلا مستقلة بمساحات سخية وتشطيبات أوروبية، يمثل أرقى مستويات السكن في العاصمة.',
    paymentPlan: [
      { label: 'عند التعاقد', pct: 40 },
      { label: 'خلال التشطيب', pct: 35 },
      { label: 'عند التسليم', pct: 25 },
    ],
    floorPlans: [
      { type: 'فيلا A — طابقين', area: 350, count: 25, priceFrom: 320000 },
      { type: 'فيلا B — ثلاثة طوابق', area: 480, count: 15, priceFrom: 450000 },
      { type: 'فيلا C — بانورامية', area: 600, count: 5, priceFrom: 680000 },
    ],
    investProjectId: null,
  },
];

export const RAW_PROPERTIES = [
  {
    id: 1, title: 'شقة فاخرة — المزة فيلات غربية', city: 'دمشق', district: 'المزة', type: 'سكني', subtype: 'شقة',
    status: 'للبيع', price: 85000, priceDisplay: '85,000 $', area: 180, rooms: 3, baths: 2, floor: 4, totalFloors: 8,
    rating: 5, verified: true, avm: 88500, lat: 33.5024, lng: 36.2566,
    images: [
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=900&q=80',
    ],
    tags: ['مصعد', 'موقف سيارات', 'حراسة 24/7', 'طاقة شمسية'],
    desc: 'شقة فاخرة في قلب المزة فيلات الغربية، تتميز بتشطيبات عالية الجودة وإطلالة رائعة على جبل قاسيون.',
    ownerName: 'أحمد الكردي', ownerPhone: '+963 11 444 5566', date: '2025-05-10',
    virtualTourUrl: 'https://kuula.co/share/collection/7l1B2?logo=0&info=0&fs=1&vr=1&sd=1&initload=0&thumbs=1',
  },
  {
    id: 2, title: 'مبنى تجاري — باب توما', city: 'دمشق', district: 'باب توما', type: 'تجاري', subtype: 'مبنى تجاري',
    status: 'للبيع', price: 220000, priceDisplay: '220,000 $', area: 550, rooms: 0, baths: 4, floor: 0, totalFloors: 5,
    rating: 4, verified: true, avm: 215000, lat: 33.5138, lng: 36.3157,
    images: [
      'https://images.unsplash.com/photo-1486325212027-8081e485255e?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1494526585095-c41746248156?auto=format&fit=crop&w=900&q=80',
    ],
    tags: ['موقع مركزي', 'رخصة تجارية', 'مستودع', 'مصعد بضاعة'],
    desc: 'مبنى تجاري استراتيجي في منطقة باب توما السياحية، يضم 5 طوابق مخصصة للتجارة والمكاتب.',
    ownerName: 'سامر العمر', ownerPhone: '+963 11 555 7788', date: '2025-05-09',
  },
  {
    id: 3, title: 'فيلا — حي العزيزية', city: 'حلب', district: 'العزيزية', type: 'سكني', subtype: 'فيلا',
    status: 'للبيع', price: 150000, priceDisplay: '150,000 $', area: 320, rooms: 5, baths: 3, floor: 0, totalFloors: 2,
    rating: 5, verified: false, avm: 162000, lat: 36.1984, lng: 37.1583,
    images: [
      'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=900&q=80',
    ],
    tags: ['حديقة', 'مسبح', 'كراج مزدوج', 'غرفة حارس'],
    desc: 'فيلا فاخرة مستقلة في أرقى أحياء حلب مع حديقة خاصة ومسبح.',
    ownerName: 'خالد مصطفى', ownerPhone: '+963 21 333 4455', date: '2025-05-08',
  },
  {
    id: 4, title: 'شقة مفروشة — أبو رمانة', city: 'دمشق', district: 'أبو رمانة', type: 'سكني', subtype: 'شقة',
    status: 'للإيجار', price: 800, priceDisplay: '800 $/شهر', area: 120, rooms: 2, baths: 1, floor: 3, totalFloors: 6,
    rating: 4, verified: true, avm: 750, lat: 33.5089, lng: 36.2847,
    images: [
      'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=900&q=80',
    ],
    tags: ['مفروشة بالكامل', 'إنترنت فايبر', 'تكييف مركزي', 'أمن'],
    desc: 'شقة مفروشة بالكامل في قلب أبو رمانة، مثالية للإقامة قصيرة وطويلة الأمد.',
    ownerName: 'رنا الحسيني', ownerPhone: '+963 11 222 3344', date: '2025-05-11',
  },
  {
    id: 5, title: 'مستودع صناعي — الشيخ نجار', city: 'حلب', district: 'الشيخ نجار', type: 'صناعي', subtype: 'مستودع',
    status: 'للإيجار', price: 2500, priceDisplay: '2,500 $/شهر', area: 1200, rooms: 0, baths: 2, floor: 0, totalFloors: 1,
    rating: 3, verified: true, avm: 2300, lat: 36.2802, lng: 37.3415,
    images: ['https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=900&q=80'],
    tags: ['بوابة مجرّفة', 'كهرباء صناعية 380V', 'ساحة تحميل', 'مكتب إداري'],
    desc: 'مستودع صناعي ضمن المنطقة الصناعية الشيخ نجار، مجهّز بكافة الخدمات الصناعية مناسب للتصنيع والتخزين.',
    ownerName: 'محمد القاسم', ownerPhone: '+963 21 666 7799', date: '2025-05-06',
  },
  {
    id: 6, title: 'أرض سكنية — العدوي', city: 'حمص', district: 'العدوي', type: 'أرض', subtype: 'أرض سكنية',
    status: 'للبيع', price: 45000, priceDisplay: '45,000 $', area: 600, rooms: 0, baths: 0, floor: 0, totalFloors: 0,
    rating: 4, verified: false, avm: 48000, lat: 34.7272, lng: 36.7215,
    images: ['https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=900&q=80'],
    tags: ['واجهة شارع رئيسي', 'مخدّمة بالكامل', 'تصميم منجز'],
    desc: 'قطعة أرض سكنية في منطقة العدوي بحمص، مخدّمة بالمياه والكهرباء والمجاري.',
    ownerName: 'سليم الزهراوي', ownerPhone: '+963 31 111 2233', date: '2025-05-07',
  },
  {
    id: 7, title: 'شقة إطلالة بحر — حي الضباط', city: 'اللاذقية', district: 'حي الضباط', type: 'سكني', subtype: 'شقة',
    status: 'للبيع', price: 62000, priceDisplay: '62,000 $', area: 145, rooms: 3, baths: 2, floor: 2, totalFloors: 5,
    rating: 4, verified: true, avm: 65000, lat: 35.5317, lng: 35.7867,
    images: [
      'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=900&q=80',
    ],
    tags: ['إطلالة بحرية', 'طاقة شمسية', 'مصعد', 'قريب من الكورنيش'],
    desc: 'شقة ساحرة بإطلالة بحرية مباشرة من الصالون والمطبخ في أرقى أحياء اللاذقية.',
    ownerName: 'ليلى إبراهيم', ownerPhone: '+963 41 777 8890', date: '2025-05-10',
  },
  {
    id: 8, title: 'بنتهاوس — مشروع دمر', city: 'دمشق', district: 'دمر', type: 'سكني', subtype: 'بنتهاوس',
    status: 'للبيع', price: 340000, priceDisplay: '340,000 $', area: 420, rooms: 5, baths: 4, floor: 12, totalFloors: 12,
    rating: 5, verified: true, avm: 355000, lat: 33.5270, lng: 36.2100,
    images: [
      'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=900&q=80',
    ],
    tags: ['تراس 200م²', 'مسبح خاص', 'حراسة 24/7', 'جيم', 'سبا'],
    desc: 'بنتهاوس استثنائي يشغل الطابق الأخير كاملاً في برج دمر الراقي.',
    ownerName: 'طارق السيد', ownerPhone: '+963 11 999 0011', date: '2025-05-11',
  },
  {
    id: 9, title: 'محل تجاري — شارع الحمرا', city: 'دمشق', district: 'الحمرا', type: 'تجاري', subtype: 'محل تجاري',
    status: 'للإيجار', price: 1500, priceDisplay: '1,500 $/شهر', area: 80, rooms: 0, baths: 1, floor: 0, totalFloors: 1,
    rating: 4, verified: false, avm: 1600, lat: 33.5120, lng: 36.2900,
    images: ['https://images.unsplash.com/photo-1460317442991-0ec209397118?auto=format&fit=crop&w=900&q=80'],
    tags: ['واجهة زجاجية 6م', 'شارع تجاري حيوي', 'تكييف مركزي'],
    desc: 'محل تجاري في أفضل مواقع شارع الحمرا التجاري بدمشق، واجهة زجاجية بعرض 6 أمتار.',
    ownerName: 'مي الزهراوي', ownerPhone: '+963 11 333 4455', date: '2025-05-05',
  },
  {
    id: 10, title: 'فيلا — شاطئ الأزرق', city: 'طرطوس', district: 'شاطئ الأزرق', type: 'سكني', subtype: 'فيلا',
    status: 'للبيع', price: 185000, priceDisplay: '185,000 $', area: 280, rooms: 4, baths: 3, floor: 0, totalFloors: 2,
    rating: 5, verified: true, avm: 192000, lat: 34.8891, lng: 35.8866,
    images: [
      'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=900&q=80',
    ],
    tags: ['واجهة بحرية مباشرة', 'حديقة استوائية', 'مولد كهربائي', 'خزان مياه'],
    desc: 'فيلا ساحلية نادرة على الشاطئ الأزرق في طرطوس مباشرة على البحر.',
    ownerName: 'أيمن الصالح', ownerPhone: '+963 43 555 6677', date: '2025-05-09',
  },
  {
    id: 11, title: 'مكاتب إدارية — برج العقاريين', city: 'دمشق', district: 'المرجة', type: 'تجاري', subtype: 'مكتب',
    status: 'للإيجار', price: 3200, priceDisplay: '3,200 $/شهر', area: 240, rooms: 4, baths: 2, floor: 7, totalFloors: 15,
    rating: 5, verified: true, avm: 3100, lat: 33.5100, lng: 36.3000,
    images: [
      'https://images.unsplash.com/photo-1494526585095-c41746248156?auto=format&fit=crop&w=900&q=80',
    ],
    tags: ['إطلالة بانورامية', 'خدمات كاملة', 'موقف B2', 'قاعة اجتماعات'],
    desc: 'مكاتب إدارية فاخرة في الدور السابع من برج العقاريين وسط دمشق.',
    ownerName: 'نادية الكردي', ownerPhone: '+963 11 888 9900', date: '2025-05-08',
  },
  {
    id: 12, title: 'شقة عائلية — الهامة', city: 'دمشق', district: 'الهامة', type: 'سكني', subtype: 'شقة',
    status: 'للبيع', price: 110000, priceDisplay: '110,000 $', area: 200, rooms: 4, baths: 2, floor: 1, totalFloors: 4,
    rating: 4, verified: false, avm: 105000, lat: 33.5450, lng: 36.2300,
    images: [
      'https://images.unsplash.com/photo-1568605114967-8130f3a36994?auto=format&fit=crop&w=900&q=80',
    ],
    tags: ['منطقة هادئة', 'قريب من المدارس', 'حديقة مشتركة', 'غرفة خادمة'],
    desc: 'شقة عائلية واسعة في حي الهامة الهادئ بدمشق.',
    ownerName: 'سارة القاسم', ownerPhone: '+963 11 111 2200', date: '2025-05-07',
  },
];

export const INITIAL_PROPERTIES = RAW_PROPERTIES.map(p => {
  const history = [];
  let basePrice = p.price * 0.85; // Assume it appreciated ~15% over the year
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  for (let i = 0; i < 12; i++) {
    const randomFluctuation = (Math.random() * 0.04 - 0.01); // -1% to +3% change
    basePrice = basePrice * (1 + randomFluctuation);
    const finalPrice = i === 11 ? p.price : Math.round(basePrice);
    history.push({ month: months[i], price: finalPrice });
  }
  return { ...p, priceHistory: history };
});

export const INITIAL_JOBS = [
  {
    id: 'j001', title: 'مهندس إنشائي أول', company: 'شركة الإعمار السورية', city: 'دمشق', type: 'دوام كامل', spec: 'إنشائي',
    salary: '1,200 - 1,800 $', posted: '2026-05-10', urgent: true, skills: ['SAP2000', 'ETABS', 'AutoCAD', 'نقابة المهندسين'],
    desc: 'مطلوب مهندس إنشائي ذو خبرة لا تقل عن 5 سنوات للعمل في مشاريع إعادة الإعمار الكبرى في دمشق.', applicants: 14,
  },
  {
    id: 'j002', title: 'مهندس معماري — تصميم وإشراف', company: 'مكتب الرؤية للتصميم', city: 'دمشق', type: 'دوام كامل', spec: 'معماري',
    salary: '900 - 1,400 $', posted: '2026-05-09', urgent: false, skills: ['Revit', 'ArchiCAD', 'SketchUp', 'تصميم داخلي'],
    desc: 'نبحث عن مهندس معماري متميز للإشراف على مشاريع سكنية راقية وإعداد المخططات المعمارية.', applicants: 22,
  },
  {
    id: 'j003', title: 'مهندس مدني — مشاريع البنية التحتية', company: 'مجموعة الفرات للإنشاء', city: 'حلب', type: 'دوام كامل', spec: 'مدني',
    salary: '800 - 1,200 $', posted: '2026-05-08', urgent: true, skills: ['AutoCAD Civil 3D', 'تصميم طرق', 'شبكات المياه', 'AUTOCAD'],
    desc: 'مطلوب مهندس مدني لتصميم والإشراف على مشاريع البنية التحتية في مدينة حلب ومحيطها.', applicants: 9,
  },
  {
    id: 'j004', title: 'مهندس كهربائي — مشاريع سكنية', company: 'شركة التوازن للمقاولات', city: 'حمص', type: 'دوام كامل', spec: 'كهربائي',
    salary: '700 - 1,100 $', posted: '2026-05-07', urgent: true, skills: ['تصميم لوحات كهربائية', 'AutoCAD Electrical', 'IEC Standards', 'تمديدات كهربائية'],
    desc: 'نحتاج مهندس كهربائي لتنفيذ والإشراف على أعمال التمديدات الكهربائية في مشاريع الأبراج السكنية.', applicants: 17,
  },
  {
    id: 'j005', title: 'مهندس إشراف ميداني', company: 'الوطنية للتطوير والاستثمار', city: 'دمشق', type: 'دوام كامل', spec: 'إشراف',
    salary: '1,000 - 1,500 $', posted: '2026-05-06', urgent: false, skills: ['إشراف على التنفيذ', 'جدولة زمنية', 'MS Project', 'AutoCAD'],
    desc: 'مهندس إشراف ميداني متمرس لمتابعة سير الأعمال في موقع برج تجاري من 15 طابق وسط العاصمة.', applicants: 31,
  },
  {
    id: 'j006', title: 'مهندس تقدير تكاليف أول', company: 'شركة حمص للمشاريع', city: 'حلب', type: 'دوام كامل', spec: 'تقدير',
    salary: '950 - 1,400 $', posted: '2026-05-05', urgent: false, skills: ['Quantity Surveying', 'BOQ', 'Primavera', 'Excel المتقدم'],
    desc: 'مطلوب خبير تقدير تكاليف لإعداد جداول الكميات ودراسات الجدوى لمشاريع الإعمار في شمال سوريا.', applicants: 6,
  },
  {
    id: 'j007', title: 'مدير مشاريع — عقارات وإنشاء', company: 'مجموعة الشام للتطوير', city: 'دمشق', type: 'دوام كامل', spec: 'مدير مشاريع',
    salary: '1,800 - 2,800 $', posted: '2026-05-04', urgent: true, skills: ['PMP', 'Primavera P6', 'إدارة فرق العمل', 'التفاوض'],
    desc: 'مدير مشاريع أول بخبرة 8+ سنوات لإدارة محفظة مشاريع سكنية وتجارية بقيمة إجمالية تتجاوز 50 مليون دولار.', applicants: 8,
  },
  {
    id: 'j008', title: 'مهندس ميكانيك وتكييف', company: 'مؤسسة النجاح للمقاولات', city: 'دمشق', type: 'دوام كامل', spec: 'ميكانيك',
    salary: '750 - 1,100 $', posted: '2026-05-03', urgent: false, skills: ['HVAC', 'AutoCAD MEP', 'تمديدات صحية', 'أنظمة إطفاء'],
    desc: 'مهندس ميكانيك لتصميم وتنفيذ أنظمة التكييف والتهوية والتمديدات الصحية في مشاريع الأبراج.', applicants: 12,
  },
  {
    id: 'j009', title: 'مساح أراضي ومساحة جوية', company: 'شركة الدقة للمساحة والتخطيط', city: 'طرطوس', type: 'دوام كامل', spec: 'مساحة',
    salary: '600 - 900 $', posted: '2026-05-02', urgent: false, skills: ['Total Station', 'GPS/GNSS', 'GIS', 'AutoCAD Map'],
    desc: 'مساح أراضٍ لإجراء رفع مساحي وإعداد خرائط المواقع لمشاريع الساحل السوري والمخططات التنظيمية.', applicants: 5,
  },
  {
    id: 'j010', title: 'مصمم داخلي — مشاريع فاخرة', company: 'مكتب ليان للتصميم الداخلي', city: 'دمشق', type: 'دوام كامل', spec: 'مصمم داخلي',
    salary: '800 - 1,300 $', posted: '2026-05-01', urgent: false, skills: ['3ds Max', 'V-Ray', 'AutoCAD', 'SketchUp', 'Lumion'],
    desc: 'مصمم داخلي موهوب لتصميم وتنفيذ مشاريع سكنية وفندقية فاخرة مع إشراف على تطبيق المفهوم التصميمي.', applicants: 38,
  },
  {
    id: 'j011', title: 'مهندس سلامة وصحة مهنية', company: 'شركة الفرات للإنشاء', city: 'حلب', type: 'دوام كامل', spec: 'سلامة',
    salary: '700 - 1,050 $', posted: '2026-04-29', urgent: true, skills: ['NEBOSH', 'OHSAS 18001', 'خطط الطوارئ', 'تقييم المخاطر'],
    desc: 'مهندس سلامة وصحة مهنية لضمان تطبيق معايير السلامة في مواقع الإنشاء وإعداد تقارير الحوادث والاشتراطات.', applicants: 4,
  },
  {
    id: 'j012', title: 'BIM Coordinator — مشاريع ذكية', company: 'مكتب الرؤية للتصميم', city: 'دمشق', type: 'عن بعد', spec: 'BIM',
    salary: '1,100 - 1,700 $', posted: '2026-04-28', urgent: false, skills: ['Revit', 'Navisworks', 'BIM 360', 'IFC', 'LOD 300+'],
    desc: 'BIM Coordinator لإدارة نماذج المعلومات لمشروع برج ذكي. يمكن العمل عن بعد مع حضور دوري في الموقع.', applicants: 19,
  },
  {
    id: 'j013', title: 'مهندس معماري — مشاريع حكومية', company: 'المؤسسة العامة للإسكان', city: 'حمص', type: 'دوام كامل', spec: 'معماري',
    salary: '600 - 900 $', posted: '2026-04-27', urgent: false, skills: ['AutoCAD', 'ArchiCAD', 'تصاميم سكنية', 'كودات البناء السورية'],
    desc: 'مهندس معماري لتصميم مجمعات سكنية شعبية ضمن برامج الإسكان الحكومية في محافظة حمص.', applicants: 27,
  },
  {
    id: 'j014', title: 'محاسب مشاريع — قطاع إنشاءات', company: 'شركة الإعمار السورية', city: 'دمشق', type: 'دوام كامل', spec: 'محاسب مشاريع',
    salary: '700 - 1,000 $', posted: '2026-04-25', urgent: false, skills: ['محاسبة تكاليف', 'QuickBooks', 'Excel', 'تقارير مالية'],
    desc: 'محاسب مشاريع إنشائية لمتابعة الميزانيات والتدفق النقدي وإعداد التقارير المالية الدورية للمساهمين.', applicants: 16,
  },
  {
    id: 'j015', title: 'مهندس إنشائي — مشاريع صناعية', company: 'مجموعة الفرات للإنشاء', city: 'اللاذقية', type: 'دوام كامل', spec: 'إنشائي',
    salary: '1,000 - 1,500 $', posted: '2026-04-24', urgent: false, skills: ['STAAD Pro', 'AutoCAD', 'تصميم المستودعات', 'الخرسانة المسلحة'],
    desc: 'مهندس إنشائي متخصص بالمنشآت الصناعية لتصميم مستودعات ومصانع في المنطقة الصناعية باللاذقية.', applicants: 11,
  },
  {
    id: 'j016', title: 'مهندس كهربائي — طاقة شمسية', company: 'شركة التوازن للمقاولات', city: 'طرطوس', type: 'فريلانس', spec: 'كهربائي',
    salary: '400 - 700 $', posted: '2026-04-22', urgent: false, skills: ['أنظمة الطاقة الشمسية', 'Inverter', 'AutoCAD Electrical', 'Load Calculation'],
    desc: 'مهندس كهربائي فريلانس لتصميم وتركيب أنظمة الطاقة الشمسية للمجمعات السكنية والفندقية على الساحل السوري.', applicants: 23,
  },
  {
    id: 'j017', title: 'مهندس مدني — شبكات صرف صحي', company: 'شركة حمص للمشاريع', city: 'حماة', type: 'دوام كامل', spec: 'مدني',
    salary: '650 - 950 $', posted: '2026-04-20', urgent: true, skills: ['AutoCAD', 'شبكات الصرف الصحي', 'GIS', 'هيدرولوجيا'],
    desc: 'مهندس مدني متخصص بشبكات الصرف الصحي للإشراف على مشروع تأهيل شبكة الصرف الصحي في مدينة حماة.', applicants: 7,
  },
  {
    id: 'j018', title: 'مهندس إشراف — فلل سكنية فاخرة', company: 'مكتب ليان للتصميم الداخلي', city: 'دمشق', type: 'نصف دوام', spec: 'إشراف',
    salary: '500 - 800 $', posted: '2026-04-19', urgent: false, skills: ['إشراف على تشطيبات', 'مراقبة جودة', 'AutoCAD', 'تنسيق مع المقاولين'],
    desc: 'مهندس إشراف لمتابعة أعمال التشطيبات الداخلية والخارجية لمشروع فلل فاخرة في منطقة قدسيا بدمشق.', applicants: 19,
  },
  {
    id: 'j019', title: 'مشغّل حفارات ومعدات ثقيلة', company: 'مجموعة الطرق والبنى', city: 'حلب', type: 'دوام كامل', spec: 'ميكانيك',
    salary: '450 - 700 $', posted: '2026-05-15', urgent: true,
    skills: ['تشغيل حفارات CAT', 'رافعات شوكية', 'بوبكات وجرافات', 'رخصة مركبات ثقيلة'],
    desc: 'مطلوب مشغّل معدات ثقيلة (حفارات، رافعات، بوبكات) ذو خبرة لا تقل عن 3 سنوات للعمل في مشروع بنية تحتية بحلب. يُشترط رخصة قيادة مركبات ثقيلة سارية.', applicants: 8,
  },
];

export const INITIAL_ENGINEERS = [
  {
    id: 'e001', name: 'م. سامر الأسد', spec: 'إنشائي', city: 'دمشق', exp: 12, rating: 5, projects: 47, verified: true,
    skills: ['ETABS', 'SAP2000', 'Revit Structure', 'نقابة المهندسين'], avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&q=80', available: true,
  },
  {
    id: 'e002', name: 'م. رنا الكردي', spec: 'معماري', city: 'دمشق', exp: 8, rating: 5, projects: 29, verified: true,
    skills: ['Revit', 'SketchUp', 'Lumion', 'ArchiCAD'], avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100&q=80', available: true,
  },
  {
    id: 'e003', name: 'م. طارق الحلبي', spec: 'إنشائي', city: 'حلب', exp: 9, rating: 4, projects: 33, verified: true,
    skills: ['SAP2000', 'STAAD Pro', 'AutoCAD', 'تصميم خرسانة مسلحة'], avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&q=80', available: true,
  },
  {
    id: 'e004', name: 'م. عمر المصري', spec: 'مدني', city: 'حلب', exp: 6, rating: 4, projects: 18, verified: true,
    skills: ['Civil 3D', 'تصميم طرق', 'شبكات مياه', 'GIS'], avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&q=80', available: false,
  },
  {
    id: 'e005', name: 'م. دانا العمر', spec: 'كهربائي', city: 'اللاذقية', exp: 7, rating: 5, projects: 24, verified: true,
    skills: ['AutoCAD Electrical', 'تصميم لوحات', 'IEC', 'طاقة شمسية'], avatar: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=100&q=80', available: true,
  },
  {
    id: 'e006', name: 'م. يوسف الرشيد', spec: 'إشراف', city: 'حمص', exp: 14, rating: 5, projects: 61, verified: true,
    skills: ['MS Project', 'Primavera P6', 'إدارة عقود', 'FIDIC'], avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=100&q=80', available: true,
  },
  {
    id: 'e007', name: 'م. نادية محمود', spec: 'مصمم داخلي', city: 'دمشق', exp: 5, rating: 4, projects: 21, verified: false,
    skills: ['3ds Max', 'V-Ray', 'SketchUp', 'Lumion', 'Photoshop'], avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&q=80', available: true,
  },
  {
    id: 'e008', name: 'م. كريم الجابر', spec: 'مدير مشاريع', city: 'دمشق', exp: 16, rating: 5, projects: 82, verified: true,
    skills: ['PMP', 'Primavera P6', 'إدارة مخاطر', 'FIDIC', 'تفاوض عقود'], avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=100&q=80', available: false,
  },
  {
    id: 'e009', name: 'م. هيثم السيد', spec: 'ميكانيك', city: 'طرطوس', exp: 8, rating: 4, projects: 30, verified: true,
    skills: ['HVAC', 'AutoCAD MEP', 'أنظمة إطفاء', 'تمديدات صحية'], avatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=100&q=80', available: true,
  },
  {
    id: 'e010', name: 'م. ريم الخطيب', spec: 'تقدير', city: 'حلب', exp: 10, rating: 5, projects: 44, verified: true,
    skills: ['Quantity Surveying', 'BOQ', 'Excel متقدم', 'برامج التكاليف'], avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=100&q=80', available: true,
  },
  {
    id: 'e011', name: 'م. وليد الحمد', spec: 'إنشائي', city: 'اللاذقية', exp: 4, rating: 4, projects: 11, verified: false,
    skills: ['ETABS', 'AutoCAD', 'Revit Structure', 'خرسانة مسلحة'], avatar: 'https://images.unsplash.com/photo-1507591064344-4c6ce005b128?w=100&q=80', available: true,
  },
  {
    id: 'e012', name: 'م. مها الزبيدي', spec: 'مدني', city: 'حمص', exp: 11, rating: 4, projects: 38, verified: true,
    skills: ['شبكات صرف صحي', 'هيدرولوجيا', 'AutoCAD', 'GIS'], avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=100&q=80', available: false,
  },
  {
    id: 'e013', name: 'م. أحمد الكردي', spec: 'BIM', city: 'دمشق', exp: 6, rating: 5, projects: 19, verified: true,
    skills: ['Revit', 'Navisworks', 'BIM 360', 'IFC', 'Dynamo'], avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&q=80', available: true,
  },
  {
    id: 'e014', name: 'م. سلمى العاصي', spec: 'معماري', city: 'طرطوس', exp: 7, rating: 4, projects: 25, verified: true,
    skills: ['ArchiCAD', 'Lumion', 'SketchUp', 'تصميم فنادق', 'مناخ ساحلي'], avatar: 'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=100&q=80', available: true,
  },
  {
    id: 'e015', name: 'م. بلال النعيمي', spec: 'مساحة', city: 'حماة', exp: 9, rating: 4, projects: 52, verified: true,
    skills: ['Total Station', 'GPS/GNSS', 'GIS', 'رفع مساحي', 'خرائط طبوغرافية'], avatar: 'https://images.unsplash.com/photo-1506277886297-57a8bcc0bc1c?w=100&q=80', available: false,
  },
  {
    id: 'e016', name: 'م. لارا إبراهيم', spec: 'سلامة', city: 'دمشق', exp: 5, rating: 4, projects: 15, verified: true,
    skills: ['NEBOSH', 'OHSAS 18001', 'تقييم مخاطر', 'خطط الطوارئ', 'تدريب السلامة'], avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&q=80', available: true,
  },
];

export const INITIAL_TENDERS = [
  {
    id: 1, developerId: 1, developerName: 'مجموعة الشام للتطوير العقاري',
    title: 'أعمال إكساء خارجي — برج الشام السكني (12 طابق)',
    type: 'إكساء وتشطيب', specialty: 'مقاول عام',
    city: 'دمشق', district: 'المزة',
    budget: '850,000 $', deadline: '2026-06-15',
    desc: 'مطلوب مقاول متخصص لأعمال الإكساء الخارجي للبرج السكني من 12 طابق. يشمل الحجر الطبيعي والزجاج المزدوج.',
    requirements: ['خبرة 5+ سنوات في المشاريع الكبرى', 'شهادة ISO', 'ضمان 10 سنوات'],
    bidsCount: 4, status: 'مفتوح', postedDate: '2026-05-01', closingDate: '2026-06-15',
  },
  {
    id: 2, developerId: 1, developerName: 'مجموعة الشام للتطوير العقاري',
    title: 'تمديدات صحية وميكانيكية — الطوابق 1-6',
    type: 'ميكانيك وصحية', specialty: 'مقاول ميكانيك',
    city: 'دمشق', district: 'المزة',
    budget: '420,000 $', deadline: '2026-05-25',
    desc: 'مناقصة لتوريد وتركيب أنظمة الصرف الصحي والتدفئة والتكييف في الطوابق 1-6.',
    requirements: ['شهادة نقابة المهندسين', 'خبرة 3+ سنوات', 'ضمان 5 سنوات'],
    bidsCount: 8, status: 'مفتوح', postedDate: '2026-04-20', closingDate: '2026-05-25',
  },
  {
    id: 3, developerId: 4, developerName: 'الوطنية للتطوير والاستثمار',
    title: 'توريد وتركيب مصاعد بانورامية — 4 مصاعد',
    type: 'توريد ميكانيك', specialty: 'مورد متخصص',
    city: 'دمشق', district: 'كفرسوسة',
    budget: '280,000 $', deadline: '2026-04-30',
    desc: 'مطلوب مورد معتمد لتوريد وتركيب 4 مصاعد بانورامية في المركز التجاري.',
    requirements: ['وكيل معتمد لعلامة تجارية دولية', 'ضمان 10 سنوات', 'خدمة صيانة دورية'],
    bidsCount: 3, status: 'مغلق', postedDate: '2026-03-15', closingDate: '2026-04-30',
  },
  {
    id: 4, developerId: 2, developerName: 'شركة الفرات للإنشاء والتطوير',
    title: 'أعمال حفر وتأسيس — مجمع الفرات المرحلة 2',
    type: 'حفريات وتأسيس', specialty: 'مقاول حفريات',
    city: 'حلب', district: 'الحمدانية',
    budget: '650,000 $', deadline: '2026-07-01',
    desc: 'مناقصة لأعمال الحفر والتأسيس للمرحلة الثانية من مجمع الفرات السكني (120 شقة).',
    requirements: ['معدات حديثة', 'خبرة في التربة الحلبية', 'شهادة سلامة NEBOSH'],
    bidsCount: 2, status: 'مفتوح', postedDate: '2026-05-10', closingDate: '2026-07-01',
  },
  {
    id: 5, developerId: 3, developerName: 'مؤسسة البحر للاستثمار العقاري',
    title: 'تصميم وتنفيذ المسابح وملاحق المياه',
    type: 'مقاولات خاصة', specialty: 'متخصص مسابح',
    city: 'اللاذقية', district: 'الشاطئ الأزرق',
    budget: '195,000 $', deadline: '2026-08-01',
    desc: 'مطلوب متخصص في تصميم وتنفيذ المسابح اللانهائية وحمامات المياه في المنتجع السياحي.',
    requirements: ['خبرة في المسابح السياحية', 'شهادات دولية', 'تصميم 3D مسبق'],
    bidsCount: 6, status: 'مفتوح', postedDate: '2026-05-05', closingDate: '2026-08-01',
  },
];

export const MARKET_DATA = {
  pricePerSqm: [
    { city: 'دمشق',     residential: 470, commercial: 820, trend: +8.2 },
    { city: 'اللاذقية', residential: 380, commercial: 560, trend: +12.4 },
    { city: 'حلب',      residential: 280, commercial: 410, trend: +18.7 },
    { city: 'طرطوس',   residential: 350, commercial: 490, trend: +9.1 },
    { city: 'حمص',     residential: 240, commercial: 360, trend: +6.3 },
  ],
  demandByType: [
    { type: 'سكني',   pct: 58 },
    { type: 'تجاري',  pct: 22 },
    { type: 'صناعي',  pct: 12 },
    { type: 'سياحي',  pct: 8  },
  ],
};

export const INITIAL_CRM_LEADS = [
  { id: 1, name: 'أحمد محمود', phone: '+963 933 123 456', project: 'برج الشام السكني', unit: 'شقة 4B', status: 'جديد', date: '2026-05-15', val: 85000 },
  { id: 2, name: 'سمير خوري', phone: '+963 944 987 654', project: 'تلال دمشق', unit: 'فيلا 12', status: 'تواصل', date: '2026-05-14', val: 320000 },
  { id: 3, name: 'لينا حداد', phone: '+963 955 456 789', project: 'برج العاصمة الإداري', unit: 'مكتب 2A', status: 'تفاوض', date: '2026-05-10', val: 200000 },
  { id: 4, name: 'ياسر العلي', phone: '+963 999 111 222', project: 'برج الشام السكني', unit: 'شقة 5A', status: 'مغلق', date: '2026-05-01', val: 88000 },
];

// ── Investment Projects ────────────────────────────────────────────────────────
export const INITIAL_INVESTMENT_PROJECTS = [
  {
    id: 'inv-1',
    title: 'مجمع سكني — دمشق الجديدة',
    city: 'دمشق', type: 'سكني', status: 'قيد التنفيذ',
    irr: 18.4, roi: 142, payback: 5.2, minInvest: 25000,
    raised: 680000, target: 1000000,
    daysLeft: 47, investorCount: 112,
    image: 'https://images.unsplash.com/photo-1486325212027-8081e485255e?w=600&q=80',
    tags: ['200 وحدة', 'قيد الإنشاء', 'تسليم 2027'],
    vip: false,
    desc: 'مجمع سكني ضخم يضم 200 وحدة سكنية في قلب دمشق الجديدة.',
  },
  {
    id: 'inv-2',
    title: 'برج تجاري — ساحة المرجة',
    city: 'دمشق', type: 'تجاري', status: 'مرحلة التصميم',
    irr: 22.1, roi: 195, payback: 4.1, minInvest: 50000,
    raised: 700000, target: 2000000,
    daysLeft: 83, investorCount: 64,
    image: 'https://images.unsplash.com/photo-1494526585095-c41746248156?w=600&q=80',
    tags: ['15 طابق', 'موقع مركزي', 'تسليم 2028'],
    vip: true,
    desc: 'برج تجاري فاخر يهيمن على ساحة المرجة في قلب العاصمة.',
  },
  {
    id: 'inv-3',
    title: 'مشروع سياحي — الساحل السوري',
    city: 'طرطوس', type: 'سياحي', status: 'فرصة مبكرة',
    irr: 26.7, roi: 230, payback: 3.8, minInvest: 15000,
    raised: 960000, target: 8000000,
    daysLeft: 11, investorCount: 289,
    image: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=600&q=80',
    tags: ['فندق 4 نجوم', 'ساحل', 'تسليم 2026'],
    vip: false,
    desc: 'مشروع فندقي سياحي متكامل على الساحل السوري بإطلالات بحرية خلابة.',
  },
  {
    id: 'inv-4',
    title: 'منطقة صناعية — الشيخ نجار',
    city: 'حلب', type: 'صناعي', status: 'مفتوح للاستثمار',
    irr: 15.2, roi: 118, payback: 6.5, minInvest: 30000,
    raised: 660000, target: 1200000,
    daysLeft: 34, investorCount: 88,
    image: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=600&q=80',
    tags: ['مستودعات', 'مناطق إنتاج', 'تسليم 2026'],
    vip: true,
    desc: 'منطقة صناعية متكاملة تضم مستودعات ومصانع في أكبر المناطق الصناعية السورية.',
  },
  {
    id: 'inv-5',
    title: 'مجمع حمص الصناعي — المرحلة أ',
    city: 'حمص', type: 'صناعي ثقيل', status: 'متاح',
    irr: 18.4, roi: 158, payback: 5.5, minInvest: 40000,
    raised: 1200000, target: 4200000,
    daysLeft: 61, investorCount: 145,
    image: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=600&q=80',
    tags: ['12,400 م²', 'Platinum', 'IVS 2025'],
    vip: true,
    desc: 'منطقة صناعية ثقيلة في حمص مخصصة للصناعات التحويلية والإنتاجية.',
  },
];

// ── Wallet Initial State ───────────────────────────────────────────────────────
export const INITIAL_WALLET = {
  totalBalance: 0,
  escrowBalance: 0,
  transactions: [],
};

// ── Initial Investments ───────────────────────────────────────────────────────
export const INITIAL_INVESTMENTS = [];

// ── Gantt Tasks (Construction Schedule) ──────────────────────────────────────
export const INITIAL_GANTT_TASKS = [
  // Project 1 — برج الشام السكني
  { id: 'g1-1', projectId: 1, name: 'أعمال الحفر والتأسيس',            start: '2026-01-05', end: '2026-02-20', progress: 100, status: 'completed',  responsible: 'فريق الحفريات' },
  { id: 'g1-2', projectId: 1, name: 'الهيكل الخرساني — طابق 1-5',     start: '2026-02-01', end: '2026-04-15', progress: 100, status: 'completed',  responsible: 'شركة البناء المتحدة' },
  { id: 'g1-3', projectId: 1, name: 'الهيكل الخرساني — طابق 6-12',    start: '2026-04-01', end: '2026-06-30', progress: 70,  status: 'ongoing',    responsible: 'شركة البناء المتحدة' },
  { id: 'g1-4', projectId: 1, name: 'تمديدات كهربائية وميكانيكية',    start: '2026-05-15', end: '2026-08-01', progress: 30,  status: 'ongoing',    responsible: 'شركة الجوهرة للكهرباء' },
  { id: 'g1-5', projectId: 1, name: 'تمديدات صحية ونظام المياه',      start: '2026-05-20', end: '2026-07-31', progress: 20,  status: 'delayed',    responsible: 'شركة التسليح' },
  { id: 'g1-6', projectId: 1, name: 'أعمال الواجهات والكساء',          start: '2026-07-01', end: '2026-10-01', progress: 0,   status: 'scheduled',  responsible: 'مقاول التشطيب' },
  { id: 'g1-7', projectId: 1, name: 'التشطيبات الداخلية والديكور',     start: '2026-09-01', end: '2026-11-15', progress: 0,   status: 'scheduled',  responsible: 'خبراء الديكور' },
  { id: 'g1-8', projectId: 1, name: 'التسليم النهائي للمستثمرين',      start: '2026-11-01', end: '2026-12-20', progress: 0,   status: 'scheduled',  responsible: 'إدارة المشروع' },

  // Project 5 — تلال دمشق
  { id: 'g5-1', projectId: 5, name: 'التسليم ومعاينة الجودة',          start: '2026-01-10', end: '2026-02-28', progress: 100, status: 'completed',  responsible: 'فريق الجودة' },
  { id: 'g5-2', projectId: 5, name: 'فحص هندسي نهائي',                 start: '2026-02-15', end: '2026-03-20', progress: 100, status: 'completed',  responsible: 'مكتب الهندسة' },
  { id: 'g5-3', projectId: 5, name: 'تسجيل عقود البيع النهائية',       start: '2026-03-01', end: '2026-05-30', progress: 90,  status: 'ongoing',    responsible: 'فريق المبيعات' },
  { id: 'g5-4', projectId: 5, name: 'مستحقات الخدمات الأولية',         start: '2026-05-01', end: '2026-07-01', progress: 15,  status: 'ongoing',    responsible: 'إدارة البناية' },
];


// ── Mock Finishing Companies Data ──
// Shared company data — used by FinishingCompaniesPage and FinishingCompanyProfilePage

export const COMPANIES = [
  {
    id: 1,
    name: 'شركة دوزان للإكساء والديكور',
    city: 'دمشق',
    zones: ['دمشق', 'ريف دمشق'],
    specs: ['expat', 'interior', 'facade', 'decor'],
    rating: 4.9,
    reviews: 87,
    jobs: 143,
    badge: 'موثق ومعتمد',
    since: 2019,
    turnkey: true,
    expat: true,
    desc: 'متخصصون في الإكساء الشامل تسليم مفتاح للمغتربين. تقارير مصورة أسبوعية ودفعات مرحلية موثقة.',
    tags: ['تسليم مفتاح', 'مغتربون', 'إكساء فاخر'],
    phone: '+963 11 000 0001',
    responseTime: 'خلال ساعة',
    priceRange: { label: '15–45 $/م²', tier: 'luxury' },
    about: 'شركة دوزان للإكساء والديكور تأسست عام 2019 بتخصص في خدمة المغتربين السوريين الراغبين في تجديد منازلهم عن بُعد. نقدم خدمة الإكساء الشامل تسليم مفتاح مع تقارير مصورة أسبوعية ودفعات مرحلية موثقة عبر المنصة.',
    certifications: ['ISO 9001:2015', 'عضو نقابة المقاولين السوريين', 'موثق ومعتمد من RESURGO'],
    portfolio: [
      { id: 1, title: 'شقة المزة 86', type: 'إكساء كامل', city: 'دمشق', c1: '#3b82f6', c2: '#6366f1', year: 2024, area: 180 },
      { id: 2, title: 'فيلا المالكي', type: 'تسليم مفتاح فاخر', city: 'دمشق', c1: '#a78bfa', c2: '#7c3aed', year: 2024, area: 380 },
      { id: 3, title: 'شقة مغترب – أمريكا', type: 'للمغتربين', city: 'دمشق', c1: '#34d399', c2: '#0d9488', year: 2023, area: 145 },
      { id: 4, title: 'مبنى الروضة التجاري', type: 'واجهات خارجية', city: 'دمشق', c1: '#fbbf24', c2: '#f97316', year: 2023, area: 600 },
      { id: 5, title: 'شقة أبو رمانة', type: 'ديكور داخلي', city: 'دمشق', c1: '#f472b6', c2: '#fb7185', year: 2024, area: 210 },
      { id: 6, title: 'مجمع سكني الحديث', type: 'وحدات متعددة', city: 'ريف دمشق', c1: '#22d3ee', c2: '#3b82f6', year: 2024, area: 1200 },
    ],
    reviewsList: [
      { id: 1, name: 'خالد م.', location: 'مغترب – ألمانيا', rating: 5, date: 'نوفمبر 2024', comment: 'تعاملت مع دوزان لتجديد شقتي في المزة وأنا خارج البلد. التقارير المصورة الأسبوعية أعطتني راحة بال كاملة. الجودة فاقت توقعاتي والتسليم في الموعد المحدد.' },
      { id: 2, name: 'سها ع.', location: 'دمشق', rating: 5, date: 'أكتوبر 2024', comment: 'أفضل شركة تعاملت معها. دقة في التفاصيل واهتمام حقيقي بالجودة. السعر مناسب جداً لمستوى الخدمة المقدمة.' },
      { id: 3, name: 'أحمد ك.', location: 'مغترب – السعودية', rating: 5, date: 'سبتمبر 2024', comment: 'المشروع انتهى قبل الموعد المحدد وبتكلفة أقل من العرض الأولي. نادراً ما يحدث هذا. أنصح بهم بشدة.' },
      { id: 4, name: 'مروان ص.', location: 'دمشق', rating: 4, date: 'أغسطس 2024', comment: 'جودة عالية وفريق محترف. التواصل كان ممتازاً طوال المشروع. نقطة واحدة للتحسين: سرعة الرد على الواتساب أحياناً.' },
    ],
  },
  {
    id: 2,
    name: 'أبو النور للتعهدات والإكساء',
    city: 'حلب',
    zones: ['حلب', 'حماة', 'حمص'],
    specs: ['restore', 'interior', 'mep'],
    rating: 4.7,
    reviews: 54,
    jobs: 97,
    badge: 'موثق',
    since: 2021,
    turnkey: true,
    expat: false,
    desc: 'خبرة واسعة في ترميم المباني المتضررة وإعادة تأهيلها. يغطي شمال سوريا وحلب بالكامل.',
    tags: ['ترميم', 'إنشائي', 'تعهد شامل'],
    phone: '+963 21 000 0002',
    responseTime: 'خلال 3 ساعات',
    priceRange: { label: '8–22 $/م²', tier: 'mid' },
    about: 'أبو النور للتعهدات والإكساء تأسست عام 2021 في حلب بعد الحرب لتخصص في إعادة تأهيل المباني المتضررة. نمتلك خبرة فنية متخصصة في التدعيم الإنشائي وإعادة تشغيل الشبكات الكهربائية والصحية.',
    certifications: ['عضو اتحاد مقاولي حلب', 'موثق من RESURGO'],
    portfolio: [
      { id: 1, title: 'مبنى سكني شرق حلب', type: 'ترميم إنشائي', city: 'حلب', c1: '#f97316', c2: '#ef4444', year: 2024, area: 800 },
      { id: 2, title: 'منازل حي السكن', type: 'إعادة تأهيل', city: 'حلب', c1: '#fbbf24', c2: '#f97316', year: 2023, area: 450 },
      { id: 3, title: 'مجمع الميسرة', type: 'كهرباء وسباكة', city: 'حماة', c1: '#64748b', c2: '#334155', year: 2024, area: 1100 },
      { id: 4, title: 'بيت عائلي عريق', type: 'ترميم شامل', city: 'حلب', c1: '#a78bfa', c2: '#7c3aed', year: 2023, area: 320 },
      { id: 5, title: 'منشأة تجارية حمص', type: 'إنشاء وإكساء', city: 'حمص', c1: '#34d399', c2: '#0d9488', year: 2024, area: 650 },
    ],
    reviewsList: [
      { id: 1, name: 'رامي ع.', location: 'حلب', rating: 5, date: 'ديسمبر 2024', comment: 'أعادوا بناء منزلنا المتضرر من الصفر تقريباً وبجودة ممتازة. فريق متخصص ومحترف.' },
      { id: 2, name: 'نادية س.', location: 'حماة', rating: 5, date: 'نوفمبر 2024', comment: 'الأسرع في الاستجابة والأكثر التزاماً بالجداول الزمنية. تعاملت معهم لمشروعين متتاليين.' },
      { id: 3, name: 'وليد م.', location: 'حلب', rating: 4, date: 'أكتوبر 2024', comment: 'عمل جيد وأسعار معقولة. أتمنى تحسين التوثيق المصور للمراحل.' },
      { id: 4, name: 'لمى ح.', location: 'حمص', rating: 5, date: 'سبتمبر 2024', comment: 'مشروع الترميم انتهى بوقت قياسي ونتيجة أفضل مما كنت أتوقع. شكراً لفريق أبو النور.' },
    ],
  },
  {
    id: 3,
    name: 'Solar Energy Syria',
    city: 'دمشق',
    zones: ['دمشق', 'ريف دمشق', 'حمص'],
    specs: ['solar'],
    rating: 4.8,
    reviews: 41,
    jobs: 62,
    badge: 'موثق ومعتمد',
    since: 2022,
    turnkey: false,
    expat: true,
    desc: 'الرائد في تركيب أنظمة الطاقة الشمسية المنزلية والتجارية. ضمان 5 سنوات على الألواح.',
    tags: ['طاقة شمسية', 'بطاريات', 'إنفرترات'],
    phone: '+963 11 000 0003',
    responseTime: 'خلال ساعتين',
    priceRange: { label: '40–130 $/كيلوواط', tier: 'mid' },
    about: 'Solar Energy Syria متخصصة منذ 2022 في تصميم وتركيب أنظمة الطاقة الشمسية المنزلية والتجارية. نستخدم ألواحاً من كبرى العلامات العالمية مع بطاريات Lithium وإنفرترات Huawei وSMA. ضمان 5 سنوات على التركيب وصيانة سنوية مجانية.',
    certifications: ['وكيل معتمد Huawei Solar', 'شريك SMA Syria', 'موثق ومعتمد من RESURGO'],
    portfolio: [
      { id: 1, title: 'منزل عائلي – 10kW', type: 'طاقة شمسية منزلية', city: 'دمشق', c1: '#fbbf24', c2: '#f59e0b', year: 2024, area: 10 },
      { id: 2, title: 'مصنع نسيج – 80kW', type: 'طاقة شمسية صناعية', city: 'حمص', c1: '#f97316', c2: '#ea580c', year: 2024, area: 80 },
      { id: 3, title: 'مجمع تجاري – 50kW', type: 'طاقة شمسية تجارية', city: 'دمشق', c1: '#fcd34d', c2: '#f97316', year: 2023, area: 50 },
      { id: 4, title: 'فيلا خاصة – 20kW', type: 'مع بطاريات ليثيوم', city: 'ريف دمشق', c1: '#a3e635', c2: '#16a34a', year: 2024, area: 20 },
      { id: 5, title: 'مدرسة حكومية – 30kW', type: 'قطاع حكومي', city: 'دمشق', c1: '#22d3ee', c2: '#0891b2', year: 2024, area: 30 },
    ],
    reviewsList: [
      { id: 1, name: 'فادي ب.', location: 'دمشق', rating: 5, date: 'يناير 2025', comment: 'نظام 15kW يعمل ببراعة. انخفضت فاتورة الكهرباء بنسبة 90%. الفريق محترف ودقيق في العمل.' },
      { id: 2, name: 'غادة ر.', location: 'مغتربة – أستراليا', rating: 5, date: 'ديسمبر 2024', comment: 'ركّبوا نظاماً لمنزل أهلي في دمشق وأنا خارج البلد. التنسيق كان رائعاً والنظام يعمل مثالياً.' },
      { id: 3, name: 'سامي خ.', location: 'حمص', rating: 4, date: 'نوفمبر 2024', comment: 'جودة ممتازة وسعر منافس. التركيب أخذ يوماً واحداً فقط.' },
    ],
  },
  {
    id: 4,
    name: 'شركة الفارس للإنشاء والترميم',
    city: 'ريف دمشق',
    zones: ['ريف دمشق', 'دمشق'],
    specs: ['restore', 'interior', 'facade'],
    rating: 4.6,
    reviews: 38,
    jobs: 78,
    badge: 'موثق',
    since: 2020,
    turnkey: true,
    expat: false,
    desc: 'تدعيم إنشائي وترميم للمباني المتضررة. خبرة في مشاريع المناطق المعاد تأهيلها.',
    tags: ['ترميم', 'إنشاء', 'واجهات'],
    phone: '+963 11 000 0004',
    responseTime: 'خلال 4 ساعات',
    priceRange: { label: '6–20 $/م²', tier: 'economy' },
    about: 'شركة الفارس للإنشاء والترميم تأسست عام 2020 لتواكب احتياجات إعادة الإعمار في ريف دمشق. متخصصون في التدعيم الإنشائي وإكساء الواجهات وإعادة التأهيل الشامل بأسعار تنافسية.',
    certifications: ['عضو نقابة المهندسين السوريين', 'موثق من RESURGO'],
    portfolio: [
      { id: 1, title: 'حي الزبلطاني', type: 'إعادة تأهيل حي', city: 'ريف دمشق', c1: '#6b7280', c2: '#374151', year: 2024, area: 2400 },
      { id: 2, title: 'عمارة سكنية', type: 'ترميم إنشائي', city: 'ريف دمشق', c1: '#78716c', c2: '#44403c', year: 2023, area: 750 },
      { id: 3, title: 'مجمع الورود', type: 'واجهات خارجية', city: 'دمشق', c1: '#3b82f6', c2: '#1d4ed8', year: 2024, area: 900 },
      { id: 4, title: 'منازل تعاونية', type: 'إكساء داخلي', city: 'ريف دمشق', c1: '#34d399', c2: '#059669', year: 2024, area: 1800 },
    ],
    reviewsList: [
      { id: 1, name: 'حسام ج.', location: 'ريف دمشق', rating: 5, date: 'ديسمبر 2024', comment: 'أفضل شركة لأعمال الترميم في المنطقة. جودة عالية وسعر معقول جداً.' },
      { id: 2, name: 'إيمان ت.', location: 'دمشق', rating: 4, date: 'نوفمبر 2024', comment: 'عمل جيد وفريق نظيف. التأخير كان 3 أيام فقط عن الموعد المحدد.' },
      { id: 3, name: 'كمال س.', location: 'ريف دمشق', rating: 5, date: 'أكتوبر 2024', comment: 'درهم وقايةٍ خير من قنطار علاج. رمّموا المبنى بشكل احترافي وبأسرع وقت.' },
    ],
  },
  {
    id: 5,
    name: 'مؤسسة الشام للديكور الدمشقي',
    city: 'دمشق',
    zones: ['دمشق'],
    specs: ['decor', 'interior'],
    rating: 4.5,
    reviews: 29,
    jobs: 55,
    badge: 'موثق',
    since: 2018,
    turnkey: false,
    expat: false,
    desc: 'متخصصون في الديكور الدمشقي الأصيل: عجمي، زجاج معشق، نقوش خشبية. للمشاريع الفاخرة فقط.',
    tags: ['ديكور دمشقي', 'عجمي', 'فاخر'],
    phone: '+963 11 000 0005',
    responseTime: 'خلال يوم',
    priceRange: { label: '20–50 $/م²', tier: 'luxury' },
    about: 'مؤسسة الشام للديكور الدمشقي تحمل إرث الحرفيين الدمشقيين منذ 2018. نتخصص في أعمال العجمي والزجاج المعشق والنقوش الخشبية الأصيلة. نعمل حصرياً مع المشاريع الفاخرة التي تحترم التراث المعماري السوري.',
    certifications: ['عضو نقابة الحرفيين السوريين', 'موثق من RESURGO', 'جائزة التميز المعماري 2023'],
    portfolio: [
      { id: 1, title: 'قاعة ضيافة عجمي', type: 'ديكور عجمي فاخر', city: 'دمشق', c1: '#d97706', c2: '#92400e', year: 2024, area: 90 },
      { id: 2, title: 'سقف مزخرف', type: 'نقوش خشبية', city: 'دمشق', c1: '#a78bfa', c2: '#5b21b6', year: 2024, area: 60 },
      { id: 3, title: 'شرفة دمشقية', type: 'زجاج معشق', city: 'دمشق', c1: '#22d3ee', c2: '#0e7490', year: 2023, area: 35 },
      { id: 4, title: 'مطعم تراثي', type: 'ديكور كامل', city: 'دمشق', c1: '#f472b6', c2: '#be185d', year: 2024, area: 280 },
      { id: 5, title: 'مجلس خاص', type: 'عجمي وخشب', city: 'دمشق', c1: '#fbbf24', c2: '#b45309', year: 2023, area: 55 },
    ],
    reviewsList: [
      { id: 1, name: 'بسام ح.', location: 'دمشق', rating: 5, date: 'يناير 2025', comment: 'حولوا غرفة الضيافة إلى تحفة فنية حقيقية. العمل بالعجمي لا يُقارن بأي شركة أخرى رأيتها.' },
      { id: 2, name: 'رنا ع.', location: 'دمشق', rating: 4, date: 'ديسمبر 2024', comment: 'جودة استثنائية وحرفة رفيعة. السعر مرتفع لكنه يستحق كل قرش.' },
      { id: 3, name: 'طارق م.', location: 'دمشق', rating: 5, date: 'نوفمبر 2024', comment: 'فريق صبور ومتفانٍ. اقترحوا تعديلات جمالية لم أكن لأفكر فيها وكانت مذهلة.' },
    ],
  },
  {
    id: 6,
    name: 'تك سيكيور للأنظمة الذكية',
    city: 'دمشق',
    zones: ['دمشق', 'ريف دمشق'],
    specs: ['secure', 'mep'],
    rating: 4.6,
    reviews: 22,
    jobs: 44,
    badge: 'قيد التحقق',
    since: 2023,
    turnkey: false,
    expat: false,
    desc: 'تركيب أنظمة الأمن والمنزل الذكي وكاميرات المراقبة. نوفر ضمان صيانة سنوي شامل.',
    tags: ['أنظمة ذكية', 'كاميرات', 'إنذار حريق'],
    phone: '+963 11 000 0006',
    responseTime: 'خلال ساعتين',
    priceRange: { label: 'تسعير مخصص', tier: 'custom' },
    about: 'تك سيكيور للأنظمة الذكية تأسست عام 2023 لتقديم حلول الأمن والمنزل الذكي بمعايير عالمية في سوريا. نتعامل مع أنظمة Hikvision وDahua وSomfy وغيرها. ضمان صيانة سنوي شامل لجميع الأنظمة.',
    certifications: ['وكيل Hikvision المعتمد', 'قيد التحقق من RESURGO'],
    portfolio: [
      { id: 1, title: 'فيلا ذكية كاملة', type: 'منزل ذكي متكامل', city: 'دمشق', c1: '#1d4ed8', c2: '#1e1b4b', year: 2024, area: 450 },
      { id: 2, title: 'محل تجاري', type: 'كاميرات وإنذار', city: 'دمشق', c1: '#0f172a', c2: '#334155', year: 2024, area: 120 },
      { id: 3, title: 'مستودع صناعي', type: 'نظام أمن شامل', city: 'ريف دمشق', c1: '#1e3a5f', c2: '#64748b', year: 2023, area: 800 },
      { id: 4, title: 'مجمع مكاتب', type: 'شبكة كاميرات مركزية', city: 'دمشق', c1: '#312e81', c2: '#6d28d9', year: 2024, area: 600 },
    ],
    reviewsList: [
      { id: 1, name: 'محمود ف.', location: 'دمشق', rating: 5, date: 'يناير 2025', comment: 'نظام المنزل الذكي يعمل بشكل مثالي. التطبيق على الهاتف سهل جداً.' },
      { id: 2, name: 'نسرين ط.', location: 'دمشق', rating: 4, date: 'نوفمبر 2024', comment: 'تركيب سريع ونظيف. خدمة ما بعد البيع جيدة جداً.' },
      { id: 3, name: 'يزن أ.', location: 'ريف دمشق', rating: 5, date: 'أكتوبر 2024', comment: 'أفضل شركة أنظمة ذكية في دمشق من حيث السعر والجودة.' },
    ],
  },
  {
    id: 7,
    name: 'الرائد للكهرباء والسباكة',
    city: 'حمص',
    zones: ['حمص', 'حماة', 'ريف دمشق'],
    specs: ['mep', 'interior'],
    rating: 4.4,
    reviews: 31,
    jobs: 66,
    badge: 'موثق',
    since: 2020,
    turnkey: false,
    expat: false,
    desc: 'خبرة 15 سنة في تمديدات الكهرباء والصحيات. نعمل مع المقاولين الرئيسيين كمقاول فرعي.',
    tags: ['كهرباء', 'سباكة', 'تمديدات'],
    phone: '+963 31 000 0007',
    responseTime: 'خلال 3 ساعات',
    priceRange: { label: '5–12 $/م²', tier: 'economy' },
    about: 'الرائد للكهرباء والسباكة تأسست عام 2020 في حمص بخبرة تتجاوز 15 عاماً في مجال التمديدات الكهربائية والصحية. نعمل كمقاول فرعي للمقاولين الكبار أو مباشرة مع الأفراد للمشاريع السكنية والتجارية.',
    certifications: ['عضو نقابة الكهربائيين السوريين', 'موثق من RESURGO'],
    portfolio: [
      { id: 1, title: 'برج سكني 12 طابق', type: 'تمديدات كهربائية', city: 'حمص', c1: '#f59e0b', c2: '#d97706', year: 2024, area: 3600 },
      { id: 2, title: 'مجمع طبي', type: 'كهرباء وصحيات', city: 'حمص', c1: '#3b82f6', c2: '#2563eb', year: 2023, area: 800 },
      { id: 3, title: 'فيلا عائلية', type: 'تمديدات شاملة', city: 'حماة', c1: '#34d399', c2: '#059669', year: 2024, area: 420 },
      { id: 4, title: 'مصنع أغذية', type: 'كهرباء صناعية', city: 'حمص', c1: '#6b7280', c2: '#1f2937', year: 2024, area: 1200 },
    ],
    reviewsList: [
      { id: 1, name: 'أيمن د.', location: 'حمص', rating: 4, date: 'ديسمبر 2024', comment: 'عمل نظيف ومتقن. أسلاك الكهرباء مُنظّمة بشكل احترافي. السعر ممتاز جداً.' },
      { id: 2, name: 'هبة ز.', location: 'حماة', rating: 5, date: 'نوفمبر 2024', comment: 'حلّوا مشكلة كهربائية كانت تعاني منها الشقة منذ سنوات في وقت قصير جداً.' },
      { id: 3, name: 'شادي م.', location: 'حمص', rating: 4, date: 'أكتوبر 2024', comment: 'التزموا بالموعد وأنجزوا العمل بجودة مقبولة جداً. أنصح بهم للمشاريع الكبيرة.' },
    ],
  },
  {
    id: 8,
    name: 'شركة سما للواجهات والألمنيوم',
    city: 'حلب',
    zones: ['حلب', 'حماة'],
    specs: ['facade', 'interior'],
    rating: 4.7,
    reviews: 19,
    jobs: 38,
    badge: 'موثق ومعتمد',
    since: 2021,
    turnkey: false,
    expat: false,
    desc: 'متخصصون في إكساء الواجهات بالألمنيوم والكمبوزيت والحجر. نوفر ضمان 10 سنوات على الواجهات.',
    tags: ['واجهات', 'ألمنيوم', 'كمبوزيت'],
    phone: '+963 21 000 0008',
    responseTime: 'خلال يوم',
    priceRange: { label: '12–35 $/م²', tier: 'mid' },
    about: 'شركة سما للواجهات والألمنيوم تأسست عام 2021 في حلب بتخصص في أعمال الواجهات المعدنية والحجرية. نستخدم مواد من أوروبا وتركيا ونضمن الواجهات 10 سنوات ضد التقشير والصدأ.',
    certifications: ['وكيل معتمد Reynaers Aluminium', 'موثق ومعتمد من RESURGO'],
    portfolio: [
      { id: 1, title: 'برج تجاري شرق', type: 'واجهة كمبوزيت', city: 'حلب', c1: '#64748b', c2: '#334155', year: 2024, area: 2000 },
      { id: 2, title: 'مجمع الخير', type: 'واجهة حجرية', city: 'حلب', c1: '#78716c', c2: '#57534e', year: 2023, area: 1200 },
      { id: 3, title: 'مركز طبي', type: 'واجهة ألمنيوم', city: 'حماة', c1: '#3b82f6', c2: '#2563eb', year: 2024, area: 600 },
      { id: 4, title: 'فندق الشهباء', type: 'واجهة متكاملة', city: 'حلب', c1: '#a78bfa', c2: '#7c3aed', year: 2024, area: 3500 },
    ],
    reviewsList: [
      { id: 1, name: 'حازم ق.', location: 'حلب', rating: 5, date: 'يناير 2025', comment: 'واجهة المبنى التجاري لدينا خرجت احترافية جداً. جودة الألمنيوم عالية والتركيب نظيف.' },
      { id: 2, name: 'منى ع.', location: 'حماة', rating: 4, date: 'ديسمبر 2024', comment: 'عمل متقن وجميل. الضمان لمدة 10 سنوات أعطانا الثقة.' },
      { id: 3, name: 'زياد ب.', location: 'حلب', rating: 5, date: 'نوفمبر 2024', comment: 'أرقى شركة واجهات في حلب. ينجزون العمل بأعلى المعايير.' },
    ],
  },
  {
    id: 9,
    name: 'الخضراء لتنسيق الحدائق',
    city: 'دمشق',
    zones: ['دمشق', 'ريف دمشق'],
    specs: ['land'],
    rating: 4.3,
    reviews: 15,
    jobs: 29,
    badge: 'موثق',
    since: 2022,
    turnkey: false,
    expat: false,
    desc: 'تنسيق حدائق وإكساء فضاءات خارجية. تصميم ممرات، إضاءة خارجية، ونوافير.',
    tags: ['حدائق', 'خارجي', 'إضاءة'],
    phone: '+963 11 000 0009',
    responseTime: 'خلال ساعتين',
    priceRange: { label: '4–15 $/م²', tier: 'economy' },
    about: 'الخضراء لتنسيق الحدائق تأسست عام 2022 لتقديم خدمات تصميم الحدائق وإكساء الفضاءات الخارجية في دمشق. نتخصص في الحدائق السكنية والتجارية مع نباتات مناسبة للمناخ السوري وأنظمة ري ذكية.',
    certifications: ['عضو جمعية البستنة السورية', 'موثق من RESURGO'],
    portfolio: [
      { id: 1, title: 'حديقة فيلا المهاجرين', type: 'حديقة فاخرة', city: 'دمشق', c1: '#4ade80', c2: '#16a34a', year: 2024, area: 600 },
      { id: 2, title: 'ممرات فندقية', type: 'إضاءة خارجية', city: 'دمشق', c1: '#a3e635', c2: '#4d7c0f', year: 2024, area: 400 },
      { id: 3, title: 'نافورة مجمع تجاري', type: 'عناصر مائية', city: 'ريف دمشق', c1: '#22d3ee', c2: '#0891b2', year: 2023, area: 150 },
      { id: 4, title: 'حديقة روضة أطفال', type: 'تنسيق خارجي', city: 'دمشق', c1: '#34d399', c2: '#059669', year: 2024, area: 800 },
    ],
    reviewsList: [
      { id: 1, name: 'لارا ج.', location: 'دمشق', rating: 5, date: 'ديسمبر 2024', comment: 'حولوا الحديقة من مساحة مهملة إلى جنة خضراء. يد بارعة وذوق رفيع.' },
      { id: 2, name: 'عمر س.', location: 'ريف دمشق', rating: 4, date: 'نوفمبر 2024', comment: 'عمل جيد وسعر معقول. أنظمة الري الذكية ممتازة.' },
      { id: 3, name: 'ديانا ح.', location: 'دمشق', rating: 4, date: 'أكتوبر 2024', comment: 'تصميم جميل وتنفيذ نظيف. أوصي بهم للحدائق السكنية.' },
    ],
  },
];

// ── Mock Finishing RFQs ──
export const INITIAL_FINISHING_RFQS = [];

// ── Mock Finishing Bids ──
export const INITIAL_FINISHING_BIDS = [];

// ── Mock Finishing Projects ──
export const INITIAL_FINISHING_PROJECTS = [];

export const INITIAL_SPONSORSHIPS = [
  {
    id: 'sp-1',
    sponsor: 'شمس سوريا للطاقة البديلة',
    title: 'منظومات طاقة شمسية ذكية بالتقسيط المريح',
    desc: 'احصل على كفاءة طاقة قصوى لمنزلك أو مكتبك مع كفالة 5 سنوات ودعم فني متكامل في كافة المحافظات السورية. نوفر ألواحاً وبطاريات ذات عمر افتراضي طويل.',
    type: 'solar',
    cta: 'احصل على عرض سعر واتساب',
    link: 'https://wa.me/963900000001?text=مرحباً%20شمس%20سوريا،%20أنا%20مهتم%20بعروض%20الطاقة%20الشمسية%20الموجهة%20عبر%20ريسورغو',
    active: true,
    clicks: 124
  },
  {
    id: 'sp-2',
    sponsor: 'دهانات وألوان الشرق الفاخرة',
    title: 'خصم 15% على دهانات الجدران الفاخرة والمقاومة للرطوبة',
    desc: 'تشكيلة واسعة من الألوان العصرية الصديقة للبيئة والخالية من الروائح. خدمة معاينة مجانية لمنزلك مع مقياس رطوبة جدران مجاني للعملاء الجدد.',
    type: 'interior',
    cta: 'احجز معاينة مجانية',
    link: 'https://wa.me/963900000002?text=مرحباً%20دهانات%20الشرق،%20أرغب%20في%20حجز%20معاينة%20مجانية%20لدهان%20عقاري',
    active: true,
    clicks: 87
  },
  {
    id: 'sp-3',
    sponsor: 'مجموعة الملاذ للتقييم العقاري والاستشارات',
    title: 'تقييم عقاري هندسي معتمد لكافة البنوك والسفارات',
    desc: 'تقارير تقييم رسمية معتمدة ومطابقة لأحدث المعايير الدولية والوزارات السورية. تصدر خلال 48 ساعة فقط وبأسعار مناسبة مع استشارات ترخيص مجانية.',
    type: 'valuation',
    cta: 'تواصل مع خبير تقييم',
    link: 'https://wa.me/963900000003?text=مرحباً%20مجموعة%20الملاذ،%20أرغب%20بشرح%20طلب%20تقييم%20عقاري%20معتمد',
    active: true,
    clicks: 52
  },
  {
    id: 'sp-4',
    sponsor: 'شركة الوطن العقارية',
    title: 'أكبر شبكة وسطاء عقاريين معتمدين في سوريا',
    desc: 'نربطك بأفضل الوسطاء المعتمدين في محافظتك. بيع أو شراء عقارك بضمان قانوني كامل وبدون عمولة مخفية. أكثر من 2000 صفقة ناجحة.',
    type: 'properties',
    cta: 'تحدّث مع وسيط الآن',
    link: 'https://wa.me/963900000004?text=مرحباً%20الوطن%20العقارية،%20أبحث%20عن%20وسيط%20معتمد',
    active: true,
    clicks: 0
  },
  {
    id: 'sp-5',
    sponsor: 'بنك الاستثمار السوري',
    title: 'تمويل عقاري ميسّر بفائدة 0% للسنة الأولى',
    desc: 'احصل على تمويل عقاري يصل إلى 70% من قيمة العقار بإجراءات مبسّطة وموافقة سريعة. خاص لعملاء منصة RESURGO المسجّلين.',
    type: 'invest',
    cta: 'اطّلع على شروط التمويل',
    link: 'https://wa.me/963900000005?text=مرحباً%20بنك%20الاستثمار،%20أريد%20الاستفسار%20عن%20التمويل%20العقاري',
    active: true,
    clicks: 0
  },
  {
    id: 'sp-6',
    sponsor: 'شركة الفرات للمعدات الثقيلة',
    title: 'تأجير معدات بناء بالساعة أو اليوم — تسليم خلال 4 ساعات',
    desc: 'أسطول حديث من الرافعات والحفارات والخلاطات بأسعار تنافسية. يشمل السعر السائق والوقود والصيانة. نعمل في جميع محافظات سوريا.',
    type: 'equipment',
    cta: 'استفسر عن التوفر',
    link: 'https://wa.me/963900000006?text=مرحباً%20الفرات%20للمعدات،%20أريد%20الاستفسار%20عن%20تأجير%20معدات',
    active: true,
    clicks: 0
  },
  {
    id: 'sp-7',
    sponsor: 'أكاديمية البناء السوري',
    title: 'شهادات هندسية معتمدة دولياً — تعلّم عن بعد',
    desc: 'برامج تدريبية معتمدة في الإنشاء والتصميم والإدارة الهندسية. أكثر من 40 دورة باللغة العربية مع شهادة معتمدة من نقابة المهندسين.',
    type: 'jobs',
    cta: 'اطّلع على البرامج',
    link: 'https://wa.me/963900000007?text=مرحباً%20أكاديمية%20البناء،%20أريد%20الاطلاع%20على%20برامج%20الشهادات',
    active: true,
    clicks: 0
  },
  {
    id: 'sp-8',
    sponsor: 'مجلة العقار السوري',
    title: 'اشترك في نشرة السوق الأسبوعية — مجاناً',
    desc: 'تحليلات أسعار أسبوعية، فرص استثمارية حصرية، وتقارير المناطق الأعلى طلباً. يقرأها أكثر من 15,000 مستثمر ومطوّر.',
    type: 'news',
    cta: 'اشترك في النشرة',
    link: 'https://wa.me/963900000008?text=مرحباً%20مجلة%20العقار،%20أريد%20الاشتراك%20في%20النشرة%20الأسبوعية',
    active: true,
    clicks: 0
  },
  {
    id: 'sp-9',
    sponsor: 'مكتب الأمان للخدمات القانونية',
    title: 'توثيق عقود التمويل الجماعي والمشاركة بضمان قانوني',
    desc: 'محامون متخصصون في عقود الاستثمار الجماعي وصناديق SPV. نحمي حقوقك القانونية من لحظة الاكتتاب حتى توزيع العوائد.',
    type: 'crowdfund',
    cta: 'استشارة قانونية مجانية',
    link: 'https://wa.me/963900000009?text=مرحباً%20مكتب%20الأمان،%20أريد%20استشارة%20حول%20عقود%20الاستثمار%20الجماعي',
    active: true,
    clicks: 0
  },
  {
    id: 'sp-10',
    sponsor: 'شركة الإعمار للمواد الإنشائية',
    title: 'مواد بناء بالجملة — توصيل مباشر لموقع المشروع',
    desc: 'أسمنت، حديد، طوب، وعزل — بأسعار المصنع وبشهادات جودة معتمدة. عروض خاصة لشركات التطوير العقاري والمقاولين.',
    type: 'developers',
    cta: 'احصل على عرض سعر',
    link: 'https://wa.me/963900000010?text=مرحباً%20الإعمار%20للمواد،%20أريد%20عرض%20سعر%20لمواد%20بناء',
    active: true,
    clicks: 0
  }
];

export const INITIAL_USERS_SEED = [];

export const INITIAL_MACHINERY_SEED = [];

export const INITIAL_STUDIES_SEED = [];

export const INITIAL_CLEARING_SEED = [];

export const INITIAL_VALUATIONS_SEED = [];



