/**
 * RESURGO Data Schema — v1.0
 * Single source of truth for all entity shapes.
 * When a real backend is added, generate DB migrations from these definitions.
 *
 * Standards targeted:
 *   - IVS 2025  (International Valuation Standards)
 *   - RICS Red Book
 *   - ISO 4217  (currency codes)
 *   - ISO 3166-1 alpha-2 (country codes)
 *   - GeoJSON / WGS-84 (coordinates)
 *   - CBRE property classification (A/B/C)
 */

// ── Field-type legend ──────────────────────────────────────────────────────────
// string   → plain text
// uuid     → "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx"
// iso8601  → "YYYY-MM-DDTHH:mm:ssZ"
// number   → numeric (int or float)
// boolean  → true / false
// enum     → one of listed values
// object   → nested object
// array    → list of items

// ── 1. PROPERTY ───────────────────────────────────────────────────────────────
export const PROPERTY_SCHEMA = {
  // Core identity
  uuid:             'uuid',          // permanent identifier — never reused
  id:               'number',        // legacy numeric id (backward compat)
  title:            'string',
  slug:             'string',        // url-safe version of title

  // Classification (international standard)
  type:             { type: 'enum', values: ['سكني', 'تجاري', 'صناعي', 'أرض', 'فندقي', 'زراعي', 'مستودع'] },
  subtype:          'string',        // شقة، فيلا، مكتب، محل...
  property_class:   { type: 'enum', values: ['A', 'B', 'C'] }, // CBRE standard
  condition_grade:  { type: 'enum', values: [1, 2, 3, 4, 5] }, // 5=excellent, 1=poor

  // Location
  city:             'string',        // governorate name
  district:         'string',        // neighborhood
  address:          'string',        // street address (when available)
  geo: {
    lat:            'number',        // WGS-84 latitude
    lng:            'number',        // WGS-84 longitude
    accuracy:       { type: 'enum', values: ['exact', 'district', 'city'] },
  },

  // Status & pricing (ISO 4217)
  status:           { type: 'enum', values: ['للبيع', 'للإيجار', 'مباع', 'مؤجر'] },
  currency:         { type: 'string', default: 'USD' },  // ISO 4217
  price:            'number',        // in currency above
  price_per_sqm:    'number',        // derived: price / usable_area_sqm
  avm:              'number',        // automated valuation model estimate

  // Dimensions (RICS standard)
  area:             'number',        // gross internal area (m²)
  usable_area_sqm:  'number',        // net usable area (m²) — RICS NIA
  rooms:            'number',
  baths:            'number',
  floor:            'number',
  totalFloors:      'number',

  // Verification chain (trust layer)
  verified:         'boolean',
  verified_by: {
    engineer_uuid:  'uuid',          // references ENGINEER_SCHEMA.uuid
    license_no:     'string',        // engineer's official license
    verified_at:    'iso8601',
    method:         { type: 'enum', values: ['site_visit', 'document_review', 'remote', 'third_party'] },
    report_uuid:    'uuid',          // references VALUATION_REPORT_SCHEMA.uuid
  },

  // Audit trail
  created_at:       'iso8601',
  updated_at:       'iso8601',
  created_by:       'uuid',          // user uuid
  updated_by:       'uuid',

  // Media
  images:           'array',         // array of URLs
  virtualTourUrl:   'string',

  // Analytics
  views:            'number',
  inquiries:        'number',
  savedCount:       'number',

  // Owner contact
  ownerName:        'string',
  ownerPhone:       'string',
};

// ── 2. ENGINEER / APPRAISER ───────────────────────────────────────────────────
export const ENGINEER_SCHEMA = {
  uuid:             'uuid',
  id:               'string',        // legacy e001, e002...
  name:             'string',
  spec:             'string',
  license_no:       'string',        // niqaba (نقابة) license number
  license_body:     'string',        // e.g. "نقابة المهندسين السوريين"
  city:             'string',
  exp:              'number',        // years of experience
  rating:           'number',        // 1-5
  projects:         'number',        // verified project count
  verified:         'boolean',
  skills:           'array',         // array of strings
  available:        'boolean',
  created_at:       'iso8601',
  updated_at:       'iso8601',
};

// ── 3. VALUATION REPORT ────────────────────────────────────────────────────────
export const VALUATION_REPORT_SCHEMA = {
  uuid:             'uuid',
  property_uuid:    'uuid',
  engineer_uuid:    'uuid',
  standard:         { type: 'enum', values: ['IVS-2025', 'RICS-2024', 'LOCAL'] },
  method:           { type: 'enum', values: ['market_comparison', 'income_approach', 'cost_approach', 'avm'] },
  value:            'number',
  currency:         { type: 'string', default: 'USD' },
  confidence:       { type: 'enum', values: ['high', 'medium', 'low'] },
  issued_at:        'iso8601',
  valid_until:      'iso8601',       // valuations expire (typically 6 months)
  created_at:       'iso8601',
};

// ── 4. MARKET INDEX ENTRY ─────────────────────────────────────────────────────
export const MARKET_INDEX_SCHEMA = {
  uuid:             'uuid',
  period:           'string',        // "2025-Q2"
  city:             'string',
  type:             'string',        // property type
  avg_price_sqm:    'number',        // USD/m²
  median_price:     'number',        // USD
  transactions:     'number',        // estimated transaction count
  qoq_change_pct:   'number',        // quarter-over-quarter %
  yoy_change_pct:   'number',        // year-over-year %
  avg_days_on_market: 'number',
  source:           'string',        // data source label
  published_at:     'iso8601',
};

// ── 5. INVESTMENT PROJECT ──────────────────────────────────────────────────────
export const INVESTMENT_PROJECT_SCHEMA = {
  uuid:             'uuid',
  id:               'string',
  developer_uuid:   'uuid',
  name:             'string',
  city:             'string',
  type:             'string',
  status:           { type: 'enum', values: ['قيد الإنشاء', 'مكتمل', 'مخطط'] },
  currency:         { type: 'string', default: 'USD' },
  priceFrom:        'number',
  price_per_sqm:    'number',
  totalUnits:       'number',
  availableUnits:   'number',
  geo: { lat: 'number', lng: 'number' },
  created_at:       'iso8601',
  updated_at:       'iso8601',
};

// ── 6. JOB LISTING ────────────────────────────────────────────────────────────
export const JOB_SCHEMA = {
  uuid:             'uuid',
  id:               'string',
  title:            'string',
  company:          'string',
  city:             'string',
  type:             { type: 'enum', values: ['دوام كامل', 'نصف دوام', 'عن بعد', 'فريلانس'] },
  spec:             'string',
  salary_min:       'number',
  salary_max:       'number',
  currency:         { type: 'string', default: 'USD' },
  skills:           'array',
  urgent:           'boolean',
  applicants:       'number',
  posted:           'iso8601',
  expires:          'iso8601',
  created_at:       'iso8601',
};

// ── 7. DEVELOPER ──────────────────────────────────────────────────────────────
export const DEVELOPER_SCHEMA = {
  uuid:             'uuid',
  id:               'number',
  name:             'string',
  country:          { type: 'string', default: 'SY' }, // ISO 3166-1 alpha-2
  city:             'string',
  founded:          'number',        // year
  verified:         'boolean',
  certifications:   'array',
  rating:           'number',
  totalUnits:       'number',
  employees:        'number',
  created_at:       'iso8601',
  updated_at:       'iso8601',
};

// ── 8. SPONSORSHIP / AD ───────────────────────────────────────────────────────
export const SPONSORSHIP_SCHEMA = {
  uuid:             'uuid',
  id:               'string',
  sponsor:          'string',
  title:            'string',
  desc:             'string',
  type:             'string',        // page context
  link:             'string',
  cta:              'string',
  active:           'boolean',
  clicks:           'number',
  impressions:      'number',        // future: track views
  starts_at:        'iso8601',       // campaign start
  ends_at:          'iso8601',       // campaign end
  created_at:       'iso8601',
};

// ── Property class guide (CBRE standard) ──────────────────────────────────────
export const PROPERTY_CLASS_GUIDE = {
  A: 'أعلى جودة في السوق — تشطيبات فاخرة، موقع مميز، خدمات كاملة، إدارة احترافية',
  B: 'جودة متوسطة-عالية — صيانة جيدة، موقع مناسب، مرافق مقبولة',
  C: 'جودة أقل من المتوسط — يحتاج تحديثاً، موقع ثانوي أو صيانة ضعيفة',
};

// ── Condition grade guide ──────────────────────────────────────────────────────
export const CONDITION_GRADE_GUIDE = {
  5: 'ممتاز — جديد أو مجدد كلياً',
  4: 'جيد جداً — صيانة دورية منتظمة',
  3: 'جيد — يحتاج صيانة بسيطة',
  2: 'مقبول — يحتاج ترميم جزئي',
  1: 'ضعيف — يحتاج ترميم شامل',
};
