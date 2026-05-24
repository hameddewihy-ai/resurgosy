const RAW_PROPERTIES = [
  {
    id: 1,
    title: 'شقة فاخرة — المزة فيلات غربية',
    city: 'دمشق', district: 'المزة', type: 'سكني', subtype: 'شقة',
    status: 'للبيع', price: 85000, priceDisplay: '85,000 $',
    area: 180, rooms: 3, baths: 2, floor: 4, totalFloors: 8,
    rating: 5, verified: true, avm: 88500,
    lat: 33.5024, lng: 36.2566,
    images: [
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=900&q=80',
    ],
    tags: ['مصعد', 'موقف سيارات', 'حراسة 24/7', 'طاقة شمسية'],
    desc: 'شقة فاخرة في قلب المزة فيلات الغربية، تتميز بتشطيبات عالية الجودة وإطلالة رائعة على جبل قاسيون. تضم غرف نوم واسعة ومطبخاً أمريكياً حديثاً مع صالة ضيوف فسيحة.',
    ownerName: 'أحمد الكردي', ownerPhone: '+963 11 444 5566', date: '2025-05-10',
    virtualTourUrl: 'https://kuula.co/share/collection/7l1B2?logo=0&info=0&fs=1&vr=1&sd=1&initload=0&thumbs=1',
  },
  {
    id: 2,
    title: 'مبنى تجاري — باب توما',
    city: 'دمشق', district: 'باب توما', type: 'تجاري', subtype: 'مبنى تجاري',
    status: 'للبيع', price: 220000, priceDisplay: '220,000 $',
    area: 550, rooms: 0, baths: 4, floor: 0, totalFloors: 5,
    rating: 4, verified: true, avm: 215000,
    lat: 33.5138, lng: 36.3157,
    images: [
      'https://images.unsplash.com/photo-1486325212027-8081e485255e?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1494526585095-c41746248156?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=900&q=80',
    ],
    tags: ['موقع مركزي', 'رخصة تجارية', 'مستودع', 'مصعد بضاعة'],
    desc: 'مبنى تجاري استراتيجي في منطقة باب توما السياحية، يضم 5 طوابق مخصصة للتجارة والمكاتب. يتمتع بواجهة زجاجية واسعة وموقف سيارات خاص.',
    ownerName: 'سامر العمر', ownerPhone: '+963 11 555 7788', date: '2025-05-09',
  },
  {
    id: 3,
    title: 'فيلا — حي العزيزية',
    city: 'حلب', district: 'العزيزية', type: 'سكني', subtype: 'فيلا',
    status: 'للبيع', price: 150000, priceDisplay: '150,000 $',
    area: 320, rooms: 5, baths: 3, floor: 0, totalFloors: 2,
    rating: 5, verified: false, avm: 162000,
    lat: 36.1984, lng: 37.1583,
    images: [
      'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1568605114967-8130f3a36994?auto=format&fit=crop&w=900&q=80',
    ],
    tags: ['حديقة', 'مسبح', 'كراج مزدوج', 'غرفة حارس'],
    desc: 'فيلا فاخرة مستقلة في أرقى أحياء حلب مع حديقة خاصة ومسبح، تضم 5 غرف نوم بحمامات مستقلة وصالون ملكي.',
    ownerName: 'خالد مصطفى', ownerPhone: '+963 21 333 4455', date: '2025-05-08',
  },
  {
    id: 4,
    title: 'شقة مفروشة — أبو رمانة',
    city: 'دمشق', district: 'أبو رمانة', type: 'سكني', subtype: 'شقة',
    status: 'للإيجار', price: 800, priceDisplay: '800 $/شهر',
    area: 120, rooms: 2, baths: 1, floor: 3, totalFloors: 6,
    rating: 4, verified: true, avm: 750,
    lat: 33.5089, lng: 36.2847,
    images: [
      'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=900&q=80',
    ],
    tags: ['مفروشة بالكامل', 'إنترنت فايبر', 'تكييف مركزي', 'أمن'],
    desc: 'شقة مفروشة بالكامل في قلب أبو رمانة، مثالية للإقامة قصيرة وطويلة الأمد. تشمل أجهزة كهربائية كاملة وتشطيبات فندقية.',
    ownerName: 'رنا الحسيني', ownerPhone: '+963 11 222 3344', date: '2025-05-11',
  },
  {
    id: 5,
    title: 'مستودع صناعي — الشيخ نجار',
    city: 'حلب', district: 'الشيخ نجار', type: 'صناعي', subtype: 'مستودع',
    status: 'للإيجار', price: 2500, priceDisplay: '2,500 $/شهر',
    area: 1200, rooms: 0, baths: 2, floor: 0, totalFloors: 1,
    rating: 3, verified: true, avm: 2300,
    lat: 36.2802, lng: 37.3415,
    images: [
      'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=900&q=80',
    ],
    tags: ['بوابة مجرّفة', 'كهرباء صناعية 380V', 'ساحة تحميل', 'مكتب إداري'],
    desc: 'مستودع صناعي ضمن المنطقة الصناعية الشيخ نجار، مجهّز بكافة الخدمات الصناعية مناسب للتصنيع والتخزين.',
    ownerName: 'محمد القاسم', ownerPhone: '+963 21 666 7799', date: '2025-05-06',
  },
  {
    id: 6,
    title: 'أرض سكنية — العدوي',
    city: 'حمص', district: 'العدوي', type: 'أرض', subtype: 'أرض سكنية',
    status: 'للبيع', price: 45000, priceDisplay: '45,000 $',
    area: 600, rooms: 0, baths: 0, floor: 0, totalFloors: 0,
    rating: 4, verified: false, avm: 48000,
    lat: 34.7272, lng: 36.7215,
    images: [
      'https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=900&q=80',
    ],
    tags: ['واجهة شارع رئيسي', 'مخدّمة بالكامل', 'تصميم منجز'],
    desc: 'قطعة أرض سكنية في منطقة العدوي بحمص، مخدّمة بالمياه والكهرباء والمجاري، بواجهة 20م على شارع رئيسي.',
    ownerName: 'سليم الزهراوي', ownerPhone: '+963 31 111 2233', date: '2025-05-07',
  },
  {
    id: 7,
    title: 'شقة إطلالة بحر — حي الضباط',
    city: 'اللاذقية', district: 'حي الضباط', type: 'سكني', subtype: 'شقة',
    status: 'للبيع', price: 62000, priceDisplay: '62,000 $',
    area: 145, rooms: 3, baths: 2, floor: 2, totalFloors: 5,
    rating: 4, verified: true, avm: 65000,
    lat: 35.5317, lng: 35.7867,
    images: [
      'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=900&q=80',
    ],
    tags: ['إطلالة بحرية', 'طاقة شمسية', 'مصعد', 'قريب من الكورنيش'],
    desc: 'شقة ساحرة بإطلالة بحرية مباشرة من الصالون والمطبخ في أرقى أحياء اللاذقية، مع تشطيبات راقية وأنظمة طاقة متجددة.',
    ownerName: 'ليلى إبراهيم', ownerPhone: '+963 41 777 8890', date: '2025-05-10',
  },
  {
    id: 8,
    title: 'بنتهاوس — مشروع دمر',
    city: 'دمشق', district: 'دمر', type: 'سكني', subtype: 'بنتهاوس',
    status: 'للبيع', price: 340000, priceDisplay: '340,000 $',
    area: 420, rooms: 5, baths: 4, floor: 12, totalFloors: 12,
    rating: 5, verified: true, avm: 355000,
    lat: 33.5270, lng: 36.2100,
    images: [
      'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=900&q=80',
    ],
    tags: ['تراس 200م²', 'مسبح خاص', 'حراسة 24/7', 'جيم', 'سبا'],
    desc: 'بنتهاوس استثنائي يشغل الطابق الأخير كاملاً في برج دمر الراقي، مع تراس بانورامي خاص ومسبح خاص ومدخل VIP مستقل.',
    ownerName: 'طارق السيد', ownerPhone: '+963 11 999 0011', date: '2025-05-11',
  },
  {
    id: 9,
    title: 'محل تجاري — شارع الحمرا',
    city: 'دمشق', district: 'الحمرا', type: 'تجاري', subtype: 'محل تجاري',
    status: 'للإيجار', price: 1500, priceDisplay: '1,500 $/شهر',
    area: 80, rooms: 0, baths: 1, floor: 0, totalFloors: 1,
    rating: 4, verified: false, avm: 1600,
    lat: 33.5120, lng: 36.2900,
    images: [
      'https://images.unsplash.com/photo-1460317442991-0ec209397118?auto=format&fit=crop&w=900&q=80',
    ],
    tags: ['واجهة زجاجية 6م', 'شارع تجاري حيوي', 'تكييف مركزي'],
    desc: 'محل تجاري في أفضل مواقع شارع الحمرا التجاري بدمشق، واجهة زجاجية بعرض 6 أمتار ومناسب لجميع الأنشطة التجارية.',
    ownerName: 'مي الزهراوي', ownerPhone: '+963 11 333 4455', date: '2025-05-05',
  },
  {
    id: 10,
    title: 'فيلا — شاطئ الأزرق',
    city: 'طرطوس', district: 'شاطئ الأزرق', type: 'سكني', subtype: 'فيلا',
    status: 'للبيع', price: 185000, priceDisplay: '185,000 $',
    area: 280, rooms: 4, baths: 3, floor: 0, totalFloors: 2,
    rating: 5, verified: true, avm: 192000,
    lat: 34.8891, lng: 35.8866,
    images: [
      'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1568605114967-8130f3a36994?auto=format&fit=crop&w=900&q=80',
    ],
    tags: ['واجهة بحرية مباشرة', 'حديقة استوائية', 'مولد كهربائي', 'خزان مياه'],
    desc: 'فيلا ساحلية نادرة على الشاطئ الأزرق في طرطوس مباشرة على البحر، بحديقة استوائية وإطلالات خلابة من جميع الغرف.',
    ownerName: 'أيمن الصالح', ownerPhone: '+963 43 555 6677', date: '2025-05-09',
  },
  {
    id: 11,
    title: 'مكاتب إدارية — برج العقاريين',
    city: 'دمشق', district: 'المرجة', type: 'تجاري', subtype: 'مكتب',
    status: 'للإيجار', price: 3200, priceDisplay: '3,200 $/شهر',
    area: 240, rooms: 4, baths: 2, floor: 7, totalFloors: 15,
    rating: 5, verified: true, avm: 3100,
    lat: 33.5100, lng: 36.3000,
    images: [
      'https://images.unsplash.com/photo-1494526585095-c41746248156?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=900&q=80',
    ],
    tags: ['إطلالة بانورامية', 'خدمات كاملة', 'موقف B2', 'قاعة اجتماعات'],
    desc: 'مكاتب إدارية فاخرة في الدور السابع من برج العقاريين وسط دمشق، بإطلالة بانورامية 360° وخدمات تجارية متكاملة.',
    ownerName: 'نادية الكردي', ownerPhone: '+963 11 888 9900', date: '2025-05-08',
  },
  {
    id: 12,
    title: 'شقة عائلية — الهامة',
    city: 'دمشق', district: 'الهامة', type: 'سكني', subtype: 'شقة',
    status: 'للبيع', price: 110000, priceDisplay: '110,000 $',
    area: 200, rooms: 4, baths: 2, floor: 1, totalFloors: 4,
    rating: 4, verified: false, avm: 105000,
    lat: 33.5450, lng: 36.2300,
    images: [
      'https://images.unsplash.com/photo-1568605114967-8130f3a36994?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=900&q=80',
    ],
    tags: ['منطقة هادئة', 'قريب من المدارس', 'حديقة مشتركة', 'غرفة خادمة'],
    desc: 'شقة عائلية واسعة في حي الهامة الهادئ بدمشق، تضم 4 غرف نوم وصالون مزدوج وتشطيبات متميزة بموقع مميز قرب المدارس.',
    ownerName: 'سارة القاسم', ownerPhone: '+963 11 111 2200', date: '2025-05-07',
  },
];

// Per-property extra metadata (avoids scattering fields across 12 literal objects)
const PROPERTY_EXTRAS = {
  1:  { furnished: false, isNew: false, priceDropPct: 0,  views: 234, inquiries: 12, savedCount: 28,
        neighborhood: { schools: 4, hospitals: 2, transport: 5, shopping: 5, security: 4 } },
  2:  { furnished: false, isNew: false, priceDropPct: 5,  views: 156, inquiries: 8,  savedCount: 15,
        neighborhood: { schools: 3, hospitals: 3, transport: 5, shopping: 5, security: 4 } },
  3:  { furnished: false, isNew: true,  priceDropPct: 0,  views: 312, inquiries: 18, savedCount: 42,
        neighborhood: { schools: 5, hospitals: 4, transport: 4, shopping: 4, security: 5 } },
  4:  { furnished: true,  isNew: false, priceDropPct: 0,  views: 189, inquiries: 21, savedCount: 35,
        neighborhood: { schools: 5, hospitals: 4, transport: 5, shopping: 5, security: 5 } },
  5:  { furnished: false, isNew: false, priceDropPct: 8,  views: 67,  inquiries: 3,  savedCount: 7,
        neighborhood: { schools: 2, hospitals: 2, transport: 3, shopping: 3, security: 3 } },
  6:  { furnished: false, isNew: true,  priceDropPct: 0,  views: 94,  inquiries: 5,  savedCount: 11,
        neighborhood: { schools: 3, hospitals: 2, transport: 2, shopping: 2, security: 4 } },
  7:  { furnished: false, isNew: false, priceDropPct: 0,  views: 201, inquiries: 14, savedCount: 31,
        neighborhood: { schools: 4, hospitals: 3, transport: 4, shopping: 4, security: 4 } },
  8:  { furnished: false, isNew: true,  priceDropPct: 0,  views: 445, inquiries: 27, savedCount: 68,
        neighborhood: { schools: 4, hospitals: 3, transport: 4, shopping: 5, security: 5 } },
  9:  { furnished: false, isNew: false, priceDropPct: 10, views: 88,  inquiries: 6,  savedCount: 9,
        neighborhood: { schools: 3, hospitals: 3, transport: 5, shopping: 5, security: 3 } },
  10: { furnished: false, isNew: false, priceDropPct: 0,  views: 376, inquiries: 22, savedCount: 53,
        neighborhood: { schools: 3, hospitals: 2, transport: 3, shopping: 3, security: 4 } },
  11: { furnished: true,  isNew: false, priceDropPct: 0,  views: 143, inquiries: 9,  savedCount: 19,
        neighborhood: { schools: 4, hospitals: 5, transport: 5, shopping: 5, security: 4 } },
  12: { furnished: false, isNew: true,  priceDropPct: 0,  views: 178, inquiries: 11, savedCount: 24,
        neighborhood: { schools: 5, hospitals: 3, transport: 3, shopping: 4, security: 5 } },
};

// Deterministic pseudo-random based on a seed (LCG)
function seededRand(seed) {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) & 0xffffffff;
    return (s >>> 0) / 0xffffffff;
  };
}

// Generate 12 months of price history — deterministic per property id
export const ALL_PROPERTIES = RAW_PROPERTIES.map(p => {
  const rand = seededRand(p.id * 7919);
  const history = [];
  let basePrice = p.price * 0.85;
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  for (let i = 0; i < 12; i++) {
    const fluctuation = rand() * 0.04 - 0.01;
    basePrice = basePrice * (1 + fluctuation);
    history.push({ month: months[i], price: i === 11 ? p.price : Math.round(basePrice) });
  }
  return { ...p, ...(PROPERTY_EXTRAS[p.id] ?? {}), priceHistory: history };
});

export const SUBTYPES = [...new Set(RAW_PROPERTIES.map(p => p.subtype))];

export const CITIES = [
  'دمشق', 'ريف دمشق', 'حلب', 'حمص', 'حماة', 'اللاذقية',
  'طرطوس', 'إدلب', 'دير الزور', 'الرقة', 'الحسكة',
  'القنيطرة', 'السويداء', 'درعا',
];
export const TYPES  = ['سكني', 'تجاري', 'صناعي', 'أرض'];
