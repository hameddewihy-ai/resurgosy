/**
 * Cloudflare Pages Worker — per-page meta + JSON-LD injection for Resurgo PropTech
 *
 * For every HTML navigation request:
 *  1. Fetches SPA index.html from the static asset store
 *  2. Replaces <title> and <meta name="description"> with page-specific values
 *  3. Appends canonical, OG, Twitter card, and JSON-LD <script> to <head>
 *
 * Static assets (.js, .css, images, sitemap.xml, …) pass through unmodified.
 */

const SITE_URL   = 'https://resurgosy.com';
const LOGO_URL   = `${SITE_URL}/logo512.png`;
const OG_IMAGE   = `${SITE_URL}/og-image.jpg`;   // 1200×630 optimised

// ── Per-page meta ─────────────────────────────────────────────────────────
const PAGE_META = {
  '/': {
    title: 'RESURGO | منصة العقارات والاستثمار في سوريا',
    description: 'منصة عقارية متكاملة للبيع والشراء والاستثمار في سوريا — تقييمات احترافية، تمويل جماعي، ومعدات إنشائية.',
  },
  '/properties': {
    title: 'العقارات | RESURGO',
    description: 'تصفح آلاف العقارات السكنية والتجارية في سوريا. شقق، فلل، أراضٍ ومحلات بأفضل الأسعار.',
  },
  '/invest': {
    title: 'الاستثمار العقاري | RESURGO',
    description: 'استثمر في السوق العقاري السوري بذكاء — تحليلات متقدمة، عوائد محسوبة، ومحافظ استثمارية متنوعة.',
  },
  '/crowdfund': {
    title: 'التمويل الجماعي العقاري | RESURGO',
    description: 'شارك في تمويل المشاريع العقارية الكبرى بمبالغ صغيرة. فرص استثمارية حصرية متاحة للجميع.',
  },
  '/news': {
    title: 'أخبار السوق العقاري | RESURGO',
    description: 'آخر أخبار وتحليلات السوق العقاري السوري — تقارير يومية، توقعات الأسعار، وفرص الاستثمار.',
  },
  '/clearing': {
    title: 'خدمات التخليص العقاري | RESURGO',
    description: 'خدمات التخليص والتسوية العقارية في سوريا. إجراءات قانونية سلسة، موثوقة، وبإشراف خبراء معتمدين.',
  },
  '/valuation-request': {
    title: 'طلب تقييم عقاري | RESURGO',
    description: 'احصل على تقييم احترافي لعقارك من مقيّمين معتمدين. تقارير دقيقة وموثوقة خلال أيام.',
  },
  '/jobs': {
    title: 'الوظائف العقارية | RESURGO',
    description: 'فرص عمل في قطاع العقارات والمقاولات السوري. انضم إلى RESURGO أو ابحث عن وظيفتك المثالية.',
  },
  '/developers': {
    title: 'المطورون العقاريون | RESURGO',
    description: 'تعرف على كبار المطورين والشركات العقارية في سوريا. مشاريع موثوقة وشراكات استراتيجية.',
  },
  '/equipment': {
    title: 'المعدات الإنشائية | RESURGO',
    description: 'تأجير وبيع المعدات الإنشائية والهندسية في سوريا. أسطول متكامل وخدمة لوجستية احترافية.',
  },
  '/finishing': {
    title: 'خدمات التشطيب | RESURGO',
    description: 'خدمات تشطيب وتجهيز العقارات السكنية والتجارية في سوريا. فرق متخصصة ونتائج احترافية.',
  },
  '/studies': {
    title: 'الدراسات العقارية | RESURGO',
    description: 'دراسات الجدوى والتحليلات العقارية الشاملة في سوريا. قرارات استثمارية مبنية على بيانات دقيقة.',
  },
  '/heatmap': {
    title: 'خريطة الطلب العقاري | RESURGO',
    description: 'خريطة تفاعلية لمناطق الطلب العقاري الأعلى في سوريا. اكتشف أفضل مناطق الاستثمار والنمو.',
  },
  '/market-reports': {
    title: 'تقارير السوق العقاري | RESURGO',
    description: 'مؤشرات أسعار العقارات السورية الفصلية، عوائد الإيجار، وبيانات السوق القابلة للتصدير — مرجع البيانات الرسمي لسوق العقارات في سوريا.',
  },
  '/about': {
    title: 'من نحن | RESURGO',
    description: 'تعرف على RESURGO — المنصة العقارية الرائدة في سوريا. مهمتنا، قيمنا، وفريقنا.',
  },
  '/privacy': {
    title: 'سياسة الخصوصية | RESURGO',
    description: 'سياسة الخصوصية وحماية البيانات الشخصية في منصة RESURGO.',
  },
  '/terms': {
    title: 'الشروط والأحكام | RESURGO',
    description: 'الشروط والأحكام العامة لاستخدام منصة RESURGO.',
  },
};

const DEFAULT_META = {
  title: 'RESURGO | منصة العقارات والاستثمار في سوريا',
  description: 'منصة عقارية متكاملة للبيع والشراء والاستثمار في سوريا — مدعومة بتحليلات متقدمة.',
};

// ── JSON-LD structured data ───────────────────────────────────────────────

// Reusable Organization block (referenced by @id on all pages)
const ORG = {
  '@type': 'Organization',
  '@id': `${SITE_URL}/#org`,
  name: 'RESURGO',
  url: SITE_URL,
  logo: { '@type': 'ImageObject', url: LOGO_URL },
  description: 'منصة عقارية متكاملة للبيع والشراء والاستثمار في سوريا',
  areaServed: { '@type': 'Country', name: 'Syria' },
  inLanguage: 'ar',
};

function buildJsonLd(pathname, meta, canonicalUrl) {
  const webPage = {
    '@type': 'WebPage',
    '@id': `${canonicalUrl}#webpage`,
    url: canonicalUrl,
    name: meta.title,
    description: meta.description,
    inLanguage: 'ar',
    isPartOf: { '@id': `${SITE_URL}/#website` },
    publisher: { '@id': `${SITE_URL}/#org` },
  };

  // Page-specific @graph entries
  const extras = [];

  switch (pathname) {
    case '/':
      extras.push(
        {
          '@type': 'WebSite',
          '@id': `${SITE_URL}/#website`,
          url: SITE_URL,
          name: 'RESURGO',
          publisher: { '@id': `${SITE_URL}/#org` },
          inLanguage: 'ar',
          potentialAction: {
            '@type': 'SearchAction',
            target: {
              '@type': 'EntryPoint',
              urlTemplate: `${SITE_URL}/properties?q={search_term_string}`,
            },
            'query-input': 'required name=search_term_string',
          },
        },
        ORG,
      );
      break;

    case '/properties':
      extras.push({
        '@type': 'RealEstateAgent',
        '@id': `${canonicalUrl}#service`,
        name: 'RESURGO — قوائم العقارات',
        url: canonicalUrl,
        description: meta.description,
        provider: { '@id': `${SITE_URL}/#org` },
        areaServed: { '@type': 'Country', name: 'Syria' },
      });
      break;

    case '/invest':
      extras.push({
        '@type': 'FinancialService',
        '@id': `${canonicalUrl}#service`,
        name: 'الاستثمار العقاري — RESURGO',
        url: canonicalUrl,
        description: meta.description,
        provider: { '@id': `${SITE_URL}/#org` },
        areaServed: { '@type': 'Country', name: 'Syria' },
      });
      break;

    case '/crowdfund':
      extras.push({
        '@type': 'FinancialService',
        '@id': `${canonicalUrl}#service`,
        name: 'التمويل الجماعي العقاري — RESURGO',
        url: canonicalUrl,
        description: meta.description,
        provider: { '@id': `${SITE_URL}/#org` },
        areaServed: { '@type': 'Country', name: 'Syria' },
      });
      break;

    case '/news':
      extras.push({
        '@type': 'NewsMediaOrganization',
        '@id': `${canonicalUrl}#publisher`,
        name: 'RESURGO — أخبار السوق العقاري',
        url: canonicalUrl,
        logo: { '@type': 'ImageObject', url: LOGO_URL },
        publishingPrinciples: `${SITE_URL}/terms`,
      });
      break;

    case '/clearing':
      extras.push({
        '@type': 'LegalService',
        '@id': `${canonicalUrl}#service`,
        name: 'خدمات التخليص العقاري — RESURGO',
        url: canonicalUrl,
        description: meta.description,
        provider: { '@id': `${SITE_URL}/#org` },
        areaServed: { '@type': 'Country', name: 'Syria' },
        serviceType: 'Real Estate Clearing & Settlement',
      });
      break;

    case '/valuation-request':
      extras.push({
        '@type': 'ProfessionalService',
        '@id': `${canonicalUrl}#service`,
        name: 'التقييم العقاري المعتمد — RESURGO',
        url: canonicalUrl,
        description: meta.description,
        provider: { '@id': `${SITE_URL}/#org` },
        areaServed: { '@type': 'Country', name: 'Syria' },
        serviceType: 'Real Estate Appraisal',
        offers: {
          '@type': 'Offer',
          description: 'تقييم عقاري احترافي من مقيّمين معتمدين',
          areaServed: { '@type': 'Country', name: 'Syria' },
        },
      });
      break;

    case '/jobs':
      extras.push({
        '@type': 'EmploymentAgency',
        '@id': `${canonicalUrl}#service`,
        name: 'الوظائف العقارية — RESURGO',
        url: canonicalUrl,
        description: meta.description,
        provider: { '@id': `${SITE_URL}/#org` },
        areaServed: { '@type': 'Country', name: 'Syria' },
      });
      break;

    case '/equipment':
      extras.push({
        '@type': 'Service',
        '@id': `${canonicalUrl}#service`,
        name: 'تأجير المعدات الإنشائية — RESURGO',
        url: canonicalUrl,
        description: meta.description,
        provider: { '@id': `${SITE_URL}/#org` },
        areaServed: { '@type': 'Country', name: 'Syria' },
        serviceType: 'Construction Equipment Rental',
      });
      break;

    case '/finishing':
      extras.push({
        '@type': 'HomeAndConstructionBusiness',
        '@id': `${canonicalUrl}#service`,
        name: 'خدمات التشطيب — RESURGO',
        url: canonicalUrl,
        description: meta.description,
        provider: { '@id': `${SITE_URL}/#org` },
        areaServed: { '@type': 'Country', name: 'Syria' },
      });
      break;

    case '/studies':
      extras.push({
        '@type': 'ProfessionalService',
        '@id': `${canonicalUrl}#service`,
        name: 'الدراسات العقارية — RESURGO',
        url: canonicalUrl,
        description: meta.description,
        provider: { '@id': `${SITE_URL}/#org` },
        serviceType: 'Real Estate Feasibility Studies',
      });
      break;

    case '/heatmap':
      extras.push({
        '@type': 'Dataset',
        '@id': `${canonicalUrl}#dataset`,
        name: 'خريطة الطلب العقاري السوري',
        description: meta.description,
        url: canonicalUrl,
        publisher: { '@id': `${SITE_URL}/#org` },
        spatialCoverage: { '@type': 'Country', name: 'Syria' },
        inLanguage: 'ar',
      });
      break;

    case '/market-reports':
      extras.push({
        '@type': 'Dataset',
        '@id': `${canonicalUrl}#dataset`,
        name: 'مؤشر RESURGO العقاري السوري',
        description: meta.description,
        url: canonicalUrl,
        publisher: { '@id': `${SITE_URL}/#org` },
        spatialCoverage: { '@type': 'Country', name: 'Syria' },
        temporalCoverage: '2023/2025',
        inLanguage: 'ar',
        license: `${SITE_URL}/terms`,
        isAccessibleForFree: true,
        distribution: [
          { '@type': 'DataDownload', encodingFormat: 'text/csv', contentUrl: `${canonicalUrl}` },
          { '@type': 'DataDownload', encodingFormat: 'application/json', contentUrl: `${canonicalUrl}` },
        ],
      });
      break;

    case '/about':
      extras.push(ORG);
      break;

    default:
      // WebPage only — no extra schema
      break;
  }

  const graph = [...extras, webPage];

  // Homepage always gets the WebSite node if not already pushed via extras
  if (pathname !== '/') {
    graph.unshift({
      '@type': 'WebSite',
      '@id': `${SITE_URL}/#website`,
      url: SITE_URL,
      name: 'RESURGO',
      publisher: { '@id': `${SITE_URL}/#org` },
      inLanguage: 'ar',
    });
  }

  return JSON.stringify({ '@context': 'https://schema.org', '@graph': graph });
}

// ── HTMLRewriter element handlers ─────────────────────────────────────────

class TagRewriter {
  constructor(meta) { this.meta = meta; }

  element(el) {
    if (el.tagName === 'title') {
      el.setInnerContent(this.meta.title);
      return;
    }
    if (el.tagName === 'meta') {
      const name = el.getAttribute('name') || '';
      if (name === 'description') {
        el.setAttribute('content', this.meta.description);
      }
    }
  }
}

class HeadAppender {
  constructor(meta, canonicalUrl, jsonLd) {
    this.meta = meta;
    this.canonicalUrl = canonicalUrl;
    this.jsonLd = jsonLd;
  }

  element(el) {
    el.append(
      [
        `<link rel="canonical" href="${this.canonicalUrl}" />`,
        `<meta property="og:type" content="website" />`,
        `<meta property="og:site_name" content="RESURGO" />`,
        `<meta property="og:title" content="${esc(this.meta.title)}" />`,
        `<meta property="og:description" content="${esc(this.meta.description)}" />`,
        `<meta property="og:url" content="${this.canonicalUrl}" />`,
        `<meta property="og:image" content="${OG_IMAGE}" />`,
        `<meta property="og:image:width" content="1200" />`,
        `<meta property="og:image:height" content="630" />`,
        `<meta name="twitter:card" content="summary_large_image" />`,
        `<meta name="twitter:title" content="${esc(this.meta.title)}" />`,
        `<meta name="twitter:description" content="${esc(this.meta.description)}" />`,
        `<meta name="twitter:image" content="${OG_IMAGE}" />`,
        `<script type="application/ld+json">${this.jsonLd}</script>`,
      ].join('\n    '),
      { html: true },
    );
  }
}

function esc(str) {
  return str.replace(/"/g, '&quot;');
}

// ── Static asset bypass ───────────────────────────────────────────────────
const ASSET_RE =
  /\.(?:js|css|map|png|jpg|jpeg|gif|webp|avif|svg|ico|woff2?|ttf|eot|xml|json|txt|pdf|mp4|webm)$/i;

// ── Main fetch handler ────────────────────────────────────────────────────
export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const { pathname } = url;

    if (ASSET_RE.test(pathname)) {
      return env.ASSETS.fetch(request);
    }

    // Proxy dynamic property sitemap to Supabase Edge Function
    if (pathname === '/sitemap-properties.xml') {
      return fetch('https://yjdyibeisprrzyozpqkd.supabase.co/functions/v1/generate-sitemap');
    }

    // Serve pitch deck standalone HTML directly (bypasses SPA routing)
    if (pathname === '/pitch' || pathname.startsWith('/pitch/')) {
      const pitchUrl = `${SITE_URL}/pitch/index.html`;
      return env.ASSETS.fetch(new Request(pitchUrl, { headers: request.headers }));
    }

    const response = await env.ASSETS.fetch(
      new Request(`${SITE_URL}/`, { headers: request.headers }),
    );

    if (!response.ok) return response;

    const lookupPath  = pathname.replace(/\/$/, '') || '/';
    const meta        = PAGE_META[lookupPath] || DEFAULT_META;
    const canonicalUrl = `${SITE_URL}${lookupPath === '/' ? '' : lookupPath}`;
    const jsonLd      = buildJsonLd(lookupPath, meta, canonicalUrl);

    const headers = new Headers(response.headers);
    headers.set('Content-Type', 'text/html; charset=utf-8');

    return new HTMLRewriter()
      .on('title', new TagRewriter(meta))
      .on('meta',  new TagRewriter(meta))
      .on('head',  new HeadAppender(meta, canonicalUrl, jsonLd))
      .transform(new Response(response.body, { ...response, headers }));
  },
};
