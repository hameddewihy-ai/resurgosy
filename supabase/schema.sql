-- ============================================================
--  RESURGO PropTech — Supabase Schema
--  Run this in: Supabase Dashboard → SQL Editor → New Query
-- ============================================================

-- ── 1. industry_news ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.industry_news (
  id           BIGSERIAL PRIMARY KEY,
  title        TEXT        NOT NULL,
  summary      TEXT,
  body         TEXT,
  category     TEXT        NOT NULL DEFAULT 'market',
  province     TEXT,
  image        TEXT,
  author       TEXT        DEFAULT 'فريق RESURGO',
  tags         TEXT[]      DEFAULT '{}',
  featured     BOOLEAN     DEFAULT false,
  status       TEXT        DEFAULT 'draft'
               CHECK (status IN ('draft', 'published')),
  read_time    INT         DEFAULT 3,
  published_at DATE        DEFAULT CURRENT_DATE,
  created_at   TIMESTAMPTZ DEFAULT NOW(),
  updated_at   TIMESTAMPTZ DEFAULT NOW()
);

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END; $$;

CREATE OR REPLACE TRIGGER industry_news_updated_at
  BEFORE UPDATE ON public.industry_news
  FOR EACH ROW EXECUTE PROCEDURE public.set_updated_at();

-- RLS
ALTER TABLE public.industry_news ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read published articles"
  ON public.industry_news FOR SELECT
  USING (status = 'published');

CREATE POLICY "Admins can manage all articles"
  ON public.industry_news FOR ALL
  USING (
    (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
  );

-- ── 2. properties ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.properties (
  id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id        UUID        REFERENCES auth.users(id) ON DELETE SET NULL,
  title           TEXT        NOT NULL,
  description     TEXT,
  price_estimate  DECIMAL(18,2),
  property_type   TEXT        NOT NULL,
  province        TEXT,
  city            TEXT,
  address         TEXT,
  lat             DECIMAL(10,8),
  lng             DECIMAL(11,8),
  address_details JSONB       DEFAULT '{}',
  status          TEXT        DEFAULT 'listed'
                  CHECK (status IN ('listed','under_inspection','verified','sold','rented')),
  blockchain_hash TEXT,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.properties ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Owners can insert their own properties"
  ON public.properties FOR INSERT
  WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Owners can read their own properties"
  ON public.properties FOR SELECT
  USING (auth.uid() = owner_id);

CREATE POLICY "Anyone can read listed/verified properties"
  ON public.properties FOR SELECT
  USING (status IN ('listed', 'verified'));

CREATE POLICY "Admins manage all properties"
  ON public.properties FOR ALL
  USING (
    (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
  );

-- ── 3. Seed initial news articles ────────────────────────────
-- (Run only once; remove if you prefer to add articles via CMS)

INSERT INTO public.industry_news (title, summary, body, category, image, author, tags, featured, status, published_at)
VALUES
(
  'أسعار العقارات في دمشق ترتفع 12% خلال الربع الأول من 2025',
  'كشف تقرير حديث عن ارتفاع ملحوظ في أسعار العقارات السكنية في دمشق بنسبة 12% مقارنة بالفترة ذاتها من العام الماضي، مدفوعاً بزيادة الطلب على التملك وانخفاض المعروض.',
  E'شهد سوق العقارات السوري خلال الربع الأول من عام 2025 حركةً لافتة، إذ أظهرت بيانات المنصة ارتفاعاً في متوسط أسعار الشقق السكنية في العاصمة دمشق بنسبة بلغت 12%.\n\nويُعزى هذا الارتفاع إلى جملة من العوامل المتشابكة، أبرزها: تصاعد الطلب على التملك من قِبَل المغتربين العائدين، وشحّ الوحدات الجاهزة في الأحياء المركزية.\n\nوبحسب تحليلات نموذج التقييم الآلي (AVM) المعتمد لدى المنصة، فإن متوسط سعر المتر المربع في دمشق بلغ نحو 1,450 دولاراً أمريكياً.',
  'market',
  'https://images.unsplash.com/photo-1486325212027-8081e485255e?w=800&q=80',
  'فريق RESURGO',
  ARRAY['أسعار العقارات', 'دمشق', '2025'],
  true, 'published', '2025-05-11'
),
(
  'صدور مرسوم جديد ينظّم تسجيل العقارات الرقمي في سوريا',
  'أصدرت الحكومة السورية مرسوماً تنظيمياً جديداً يُلزم بتسجيل جميع عقود نقل الملكية العقارية إلكترونياً.',
  E'أصدرت الحكومة السورية مرسوماً تشريعياً يُعدّ الأول من نوعه في مجال رقمنة التسجيل العقاري.\n\nيُشترط وفق المرسوم أن تحمل كل وثيقة ملكية توقيعاً رقمياً موثّقاً من الجهة المختصة، مع ربط السجل العقاري بقاعدة بيانات وطنية مركزية.',
  'legal',
  'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=800&q=80',
  'محرر قانوني',
  ARRAY['تشريع', 'تسجيل عقارات', 'رقمنة'],
  false, 'published', '2025-05-10'
),
(
  'مستثمرون خليجيون يضخّون 200 مليون دولار في مشاريع إسكان سوري',
  'وقّعت مجموعة من المستثمرين الخليجيين اتفاقيات لتمويل مشاريع إسكانية في دمشق وحلب واللاذقية.',
  E'وقّعت مجموعة من رجال الأعمال الخليجيين اتفاقيات تمويل مع عدد من شركات التطوير العقاري السورية بإجمالي 200 مليون دولار.\n\nتتنوع المشاريع بين مجمعات سكنية متكاملة وأبراج سكنية متوسطة الحجم تستهدف الفئة المتوسطة والعائدين من المهجر.',
  'investment',
  'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&q=80',
  'قسم الاستثمار',
  ARRAY['استثمار أجنبي', 'إسكان', 'خليج'],
  false, 'published', '2025-05-09'
)
ON CONFLICT DO NOTHING;
