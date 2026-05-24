// ── Financial constants ───────────────────────────────────────────────────────
export const PLATFORM_FEE  = 0.035;
export const VAT_RATE      = 0.11;
export const WAIVER_RATE   = 0.025;

export const UNIT_AR = { hour: 'ساعة', shift: 'وردية (8س)', day: 'يوم', month: 'شهر' };

export const CATEGORIES = [
  { id: 'all',        label: 'الكل' },
  { id: 'light',      label: 'خفيفة وبوبكات' },
  { id: 'demolition', label: 'تكسير وهدم' },
  { id: 'crane',      label: 'رافعات ومناولة' },
  { id: 'excavator',  label: 'حفارات' },
  { id: 'generator',  label: 'طاقة وتجهيزات' },
];

export const CITIES_EQ = [
  'الكل', 'دمشق', 'ريف دمشق', 'حلب', 'حمص', 'حماة', 'اللاذقية', 'طرطوس',
  'درعا', 'السويداء', 'القنيطرة', 'دير الزور', 'الرقة', 'الحسكة', 'إدلب',
];

export const EQUIPMENT_PRICING_UNITS = [
  { id: 'hour',  label: 'بالساعة' },
  { id: 'shift', label: 'بالوردية (8 ساعات)' },
  { id: 'day',   label: 'باليوم' },
  { id: 'month', label: 'بالشهر' },
];

// Category colors used by IoTTrackerMap dots
export const CATEGORY_COLORS = {
  light:      '#5979bb',
  excavator:  '#f37124',
  crane:      '#16a34a',
  demolition: '#dc2626',
  generator:  '#9333ea',
};

// localStorage key — shared between ContractorDashboard and EquipmentPage
export const EQ_MARKET_KEY = 'resurgo-market-equipment';

export function getMarketEquipment() {
  try { return JSON.parse(localStorage.getItem(EQ_MARKET_KEY) || '[]'); }
  catch { return []; }
}

// ── Seed equipment (platform-curated listings) ───────────────────────────────
export const EQUIPMENT_SEED = [
  {
    id: 'eq001',
    ownerId: null,
    // Identity
    name: 'جرافة انزلاقية (بوبكات) Bobcat S450',
    brand: 'Bobcat', model: 'S450',
    serialNumber: 'BOB-S450-25-0241',
    yearOfManufacture: '2021',
    // Location
    city: 'دمشق', provider: 'مقاولات الأمانة',
    lat: 33.49, lng: 36.32,
    // Specs
    fuelType: 'ديزل',
    operatingWeight: '3.2 طن',
    // Pricing
    category: 'light',
    rate: 15, wetRate: 20, pricingUnit: 'hour',
    fuelIncluded: false, transport: 'separate', transportCost: 50,
    dryAvailable: true, wetAvailable: true,
    // Trust signals
    rating: 4.8, reviewCount: 23, totalRentals: 41,
    available: true, nextAvailableDate: null,
    // Compliance
    insuranceExpiry: '2026-12-31',
    licenseExpiry: '2027-03-15',
    nextMaintenanceDue: '2026-07-01',
    // Accessories
    attachments: [
      { id: 'a1', name: 'فرشاية تنظيف شوارع', price: 5 },
      { id: 'a2', name: 'شفرة تسوية',         price: 0 },
    ],
    // IoT
    telematics: {
      engineHoursTotal: 12450, engineHoursToday: 6.5,
      fuelLevel: 72, state: 'running', engineLoad: 68,
      lastPing: '14 مايو 09:42', gps: 'دمشق، المزة الصناعية',
    },
    inspectionHash: 'SY-INSP-25-A8F3', condition: 5, waiverAvailable: true,
    bookedDates: [1, 2, 3, 10, 11, 15, 16],
    maintenanceLog: {
      maxDailyHours: 8,
      history: [
        { id: 1, task: 'تغيير فلاتر وزيت المحرك',           date: '2026-04-10', hours: 12400 },
        { id: 2, task: 'صيانة دورية للمضخة الهيدروليكية',   date: '2026-03-01', hours: 12100 },
      ],
    },
    images: [
      'https://images.unsplash.com/photo-1590674899484-d5640e854abe?w=600&q=80',
      'https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=600&q=80',
      'https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600&q=80',
    ],
    image: 'https://images.unsplash.com/photo-1590674899484-d5640e854abe?w=500&q=80',
  },
  {
    id: 'eq002',
    ownerId: null,
    name: 'حفارة مجنزرة CAT 320 GC',
    brand: 'Caterpillar', model: '320 GC',
    serialNumber: 'CAT-320GC-22-7831',
    yearOfManufacture: '2022',
    city: 'حلب', provider: 'مؤسسة البناء الشامل',
    lat: 36.18, lng: 37.20,
    fuelType: 'ديزل',
    operatingWeight: '22.5 طن',
    category: 'excavator',
    rate: 420, wetRate: 580, pricingUnit: 'day',
    fuelIncluded: true, transport: 'included', transportCost: 0,
    dryAvailable: true, wetAvailable: true,
    rating: 4.6, reviewCount: 17, totalRentals: 28,
    available: true, nextAvailableDate: '2026-05-20',
    insuranceExpiry: '2026-09-30',
    licenseExpiry: '2026-11-01',
    nextMaintenanceDue: '2026-06-15',
    attachments: [
      { id: 'a3', name: 'دقاق هيدروليكي', price: 100 },
    ],
    telematics: {
      engineHoursTotal: 8320, engineHoursToday: 9.2,
      fuelLevel: 45, state: 'idle', engineLoad: 0,
      lastPing: '14 مايو 08:15', gps: 'حلب، العزيزية',
    },
    inspectionHash: 'SY-INSP-25-C2D7', condition: 4, waiverAvailable: true,
    bookedDates: [20, 21, 22, 23, 24],
    maintenanceLog: {
      maxDailyHours: 10,
      history: [{ id: 1, task: 'تغيير الجنازير', date: '2026-02-15', hours: 8000 }],
    },
    images: [
      'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=80',
      'https://images.unsplash.com/photo-1590674899484-d5640e854abe?w=600&q=80',
    ],
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=500&q=80',
  },
  {
    id: 'eq003',
    ownerId: null,
    name: 'رافعة شوكية Toyota 3-Ton',
    brand: 'Toyota', model: 'Forklift 02-8FG30',
    serialNumber: 'TOY-8FG30-20-3312',
    yearOfManufacture: '2020',
    city: 'اللاذقية', provider: 'مستودعات الساحل',
    lat: 35.54, lng: 35.82,
    fuelType: 'LPG / بنزين',
    operatingWeight: '4.0 طن',
    category: 'crane',
    rate: 120, wetRate: 150, pricingUnit: 'shift',
    fuelIncluded: false, transport: 'separate', transportCost: 30,
    dryAvailable: true, wetAvailable: true,
    rating: 4.9, reviewCount: 31, totalRentals: 57,
    available: true, nextAvailableDate: null,
    insuranceExpiry: '2027-01-20',
    licenseExpiry: '2027-04-10',
    nextMaintenanceDue: '2026-08-01',
    attachments: [],
    telematics: {
      engineHoursTotal: 5640, engineHoursToday: 4.0,
      fuelLevel: 88, state: 'running', engineLoad: 55,
      lastPing: '14 مايو 09:30', gps: 'اللاذقية، المرفأ',
    },
    inspectionHash: 'SY-INSP-25-E9K1', condition: 5, waiverAvailable: true,
    bookedDates: [],
    maintenanceLog: { maxDailyHours: 8, history: [] },
    images: [
      'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=600&q=80',
      'https://images.unsplash.com/photo-1567095761054-7a02e69e5c43?w=600&q=80',
    ],
    image: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=500&q=80',
  },
  {
    id: 'eq004',
    ownerId: null,
    name: 'مولد طاقة CAT C18 — 500 KVA',
    brand: 'Caterpillar', model: 'C18 ACERT',
    serialNumber: 'CAT-C18-19-5504',
    yearOfManufacture: '2019',
    city: 'حمص', provider: 'شركة الطاقة الصناعية',
    lat: 34.71, lng: 36.74,
    fuelType: 'ديزل',
    operatingWeight: '5.8 طن',
    category: 'generator',
    rate: 1500, wetRate: 0, pricingUnit: 'month',
    fuelIncluded: false, transport: 'separate', transportCost: 150,
    dryAvailable: true, wetAvailable: false,
    rating: 4.5, reviewCount: 9, totalRentals: 14,
    available: true, nextAvailableDate: null,
    insuranceExpiry: '2026-10-31',
    licenseExpiry: '2026-12-01',
    nextMaintenanceDue: '2026-06-01',
    attachments: [],
    telematics: {
      engineHoursTotal: 3210, engineHoursToday: 12.0,
      fuelLevel: 61, state: 'running', engineLoad: 72,
      lastPing: '14 مايو 09:55', gps: 'حمص، حسياء',
    },
    inspectionHash: 'SY-INSP-25-G4M2', condition: 5, waiverAvailable: false,
    bookedDates: [],
    maintenanceLog: { maxDailyHours: 24, history: [] },
    images: [
      'https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600&q=80',
    ],
    image: 'https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=500&q=80',
  },
  {
    id: 'eq005',
    ownerId: null,
    name: 'كرفان مهندسين مجهز (6x3 متر)',
    brand: '—', model: '6×3 متر',
    serialNumber: 'KARAVAN-26-0058',
    yearOfManufacture: '2024',
    city: 'دمشق', provider: 'ورشة التجهيزات الميدانية',
    lat: 33.52, lng: 36.27,
    fuelType: 'كهرباء / مولد خارجي',
    operatingWeight: '2.1 طن',
    category: 'generator',
    rate: 200, wetRate: 0, pricingUnit: 'month',
    fuelIncluded: false, transport: 'separate', transportCost: 80,
    dryAvailable: true, wetAvailable: false,
    rating: 4.2, reviewCount: 6, totalRentals: 11,
    available: true, nextAvailableDate: null,
    insuranceExpiry: '2027-03-01',
    licenseExpiry: '2027-06-01',
    nextMaintenanceDue: '2026-12-01',
    attachments: [],
    telematics: {
      engineHoursTotal: 0, engineHoursToday: 0,
      fuelLevel: 0, state: 'stopped', engineLoad: 0,
      lastPing: '-', gps: 'دمشق',
    },
    inspectionHash: 'SY-INSP-25-B3N8', condition: 4, waiverAvailable: false,
    bookedDates: [],
    maintenanceLog: { maxDailyHours: 0, history: [] },
    images: [
      'https://images.unsplash.com/photo-1567095761054-7a02e69e5c43?w=600&q=80',
    ],
    image: 'https://images.unsplash.com/photo-1567095761054-7a02e69e5c43?w=500&q=80',
  },
  {
    id: 'eq006',
    ownerId: null,
    name: 'حفارة هدم بوم طويل (High Reach)',
    brand: 'Komatsu', model: 'PC350-8',
    serialNumber: 'KOM-PC350-21-9920',
    yearOfManufacture: '2021',
    city: 'حلب', provider: 'مجموعة الطرق والبنى',
    lat: 36.22, lng: 37.14,
    fuelType: 'ديزل',
    operatingWeight: '36 طن',
    category: 'demolition',
    rate: 600, wetRate: 800, pricingUnit: 'day',
    fuelIncluded: true, transport: 'separate', transportCost: 200,
    dryAvailable: false, wetAvailable: true,
    rating: 4.7, reviewCount: 14, totalRentals: 22,
    available: true, nextAvailableDate: null,
    insuranceExpiry: '2026-11-15',
    licenseExpiry: '2027-01-01',
    nextMaintenanceDue: '2026-09-01',
    attachments: [
      { id: 'a4', name: 'مقص حديد هيدروليكي',    price: 150 },
      { id: 'a5', name: 'كسارة باطون متطورة',     price: 120 },
    ],
    telematics: {
      engineHoursTotal: 2890, engineHoursToday: 7.8,
      fuelLevel: 54, state: 'running', engineLoad: 61,
      lastPing: '14 مايو 09:10', gps: 'حلب، الأنصاري',
    },
    inspectionHash: 'SY-INSP-25-F7L5', condition: 4, waiverAvailable: true,
    bookedDates: [],
    maintenanceLog: { maxDailyHours: 10, history: [] },
    images: [
      'https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=600&q=80',
      'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=80',
    ],
    image: 'https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=500&q=80',
  },
];

// ── Escrow contracts (mock) ───────────────────────────────────────────────────
export const ESCROW_CONTRACTS = [
  {
    id: 'ESC-2025-0041',
    project: 'عقد استئجار بوبكات - مشروع كابلات ميسلون',
    contractor: 'مقاولات الأمانة', client: 'شركة الإعمار السورية',
    total: 1200,
    milestones: [
      { id: 1, desc: 'محضر الاستلام وتسليم الموقع', amount: 600, status: 'released', engineerOk: true,  aiOk: true,  date: '15 مارس 2025' },
      { id: 2, desc: 'إنهاء العمل ومحضر الإرجاع',  amount: 600, status: 'pending',  engineerOk: false, aiOk: false, date: null },
    ],
  },
  {
    id: 'ESC-2025-0038',
    project: 'تأجير حفارة هدم - اللاذقية',
    contractor: 'مجموعة الطرق والبنى', client: 'مؤسسة إعمار الساحل',
    total: 3200,
    milestones: [
      { id: 1, desc: 'رسوم النقل واليوم الأول',       amount: 1000, status: 'released', engineerOk: true, aiOk: true, date: '10 أبريل 2025' },
      { id: 2, desc: 'استكمال الهدم (تصفية نهائية)', amount: 2200, status: 'verified', engineerOk: true, aiOk: true, date: null },
    ],
  },
];

// ── Takaful fund stats ────────────────────────────────────────────────────────
export const FUND = {
  balance: 125000, claimsMonth: 3, avgClaim: 4200,
  coverageMax: 15000, health: 83,
};
