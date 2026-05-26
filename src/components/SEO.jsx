import { Helmet } from 'react-helmet-async';

const SITE_NAME = 'RESURGO';
const BASE_URL  = 'https://resurgosy.com';
const DEFAULT_IMAGE = 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200&q=80';
const DEFAULT_DESC  = 'منصة العقارات والاستثمار والمقاولات في سوريا — مدعومة بأحدث التقنيات وتقنية البلوكتشين.';

export default function SEO({
  title,
  description = DEFAULT_DESC,
  image = DEFAULT_IMAGE,
  path = '',
  type = 'website',
  noindex = false,
  jsonLd = null,
  price = null,
  currency = 'USD',
}) {
  const fullTitle    = title ? `${title} | ${SITE_NAME}` : SITE_NAME;
  const canonicalUrl = `${BASE_URL}${path}`;
  const ogImage      = image.startsWith('http') ? image : `${BASE_URL}${image}`;

  return (
    <Helmet>
      <html lang="ar" dir="rtl" />
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      {noindex && <meta name="robots" content="noindex, nofollow" />}
      <link rel="canonical" href={canonicalUrl} />

      {/* Open Graph */}
      <meta property="og:site_name"   content={SITE_NAME} />
      <meta property="og:type"        content={type} />
      <meta property="og:title"       content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:url"         content={canonicalUrl} />
      <meta property="og:image"       content={ogImage} />
      <meta property="og:image:width"  content="900" />
      <meta property="og:image:height" content="600" />
      <meta property="og:locale"      content="ar_SY" />

      {/* Price meta — property listings */}
      {price !== null && (
        <>
          <meta property="product:price:amount"   content={String(price)} />
          <meta property="product:price:currency" content={currency} />
          <meta name="price" content={`${price} ${currency}`} />
        </>
      )}

      {/* Twitter */}
      <meta name="twitter:card"        content="summary_large_image" />
      <meta name="twitter:title"       content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image"       content={ogImage} />

      {/* JSON-LD */}
      {jsonLd && (
        <script type="application/ld+json">
          {JSON.stringify(jsonLd)}
        </script>
      )}
    </Helmet>
  );
}
