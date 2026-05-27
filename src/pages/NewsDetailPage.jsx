import { useMemo } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import {
  Clock, Tag, BookOpen, ArrowRight, MessageCircle,
  Share2, ChevronLeft,
} from 'lucide-react';
import SEO from '../components/SEO';
import { useNews } from '../hooks/useNews';
import { CATEGORIES, getCategoryColor } from '../data/newsData';

const CAT_SERVICE = {
  market:     { label: 'تصفح العقارات المتاحة',     sub: 'آلاف العقارات في سوريا بانتظارك',         to: '/properties',         cls: 'border-blue-200   hover:border-blue-300   bg-blue-50/50',   dot: 'bg-blue-500'   },
  investment: { label: 'استكشف فرص الاستثمار',      sub: 'فرص عقارية موثوقة بعوائد مدروسة وضمانات واضحة', to: '/invest',             cls: 'border-green-200  hover:border-green-300  bg-green-50/50',  dot: 'bg-green-500'  },
  legal:      { label: 'أنجز تخليصك القانوني',       sub: 'وكالات، حصر إرث، استرداد ملكية بسهولة',  to: '/clearing/dashboard', cls: 'border-purple-200 hover:border-purple-300 bg-purple-50/50', dot: 'bg-purple-500' },
  jobs:       { label: 'تصفح فرص العمل الهندسية',   sub: 'مهندسون ومقاولون يبحثون عن فرص الآن',     to: '/jobs',               cls: 'border-amber-200  hover:border-amber-300  bg-amber-50/50',  dot: 'bg-amber-500'  },
  developers: { label: 'استكشف مشاريع المطورين',    sub: 'مشاريع إعادة الإعمار في جميع المحافظات',  to: '/developers',         cls: 'border-rose-200   hover:border-rose-300   bg-rose-50/50',   dot: 'bg-rose-500'   },
};

function RelatedCard({ article }) {
  return (
    <Link to={`/news/${article.id}`} className="group block bg-white overflow-hidden shadow-[0_2px_8px_rgba(31,42,56,0.06)] hover:shadow-[0_8px_24px_rgba(31,42,56,0.10)] rounded-lg transition-all hover:-translate-y-0.5">
      <div className="relative h-36 overflow-hidden">
        <img src={article.image} alt={article.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
        <div className="absolute inset-0 bg-gradient-to-t from-navy/70 to-transparent" />
      </div>
      <div className="p-4">
        <p className="text-charcoal/50 text-[10px] mb-1 flex items-center gap-1">
          <Clock size={9} /> {article.date}
        </p>
        <h4 className="text-navy font-bold text-xs leading-snug line-clamp-2 group-hover:text-brand transition-colors">
          {article.title}
        </h4>
      </div>
    </Link>
  );
}

export default function NewsDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { articles } = useNews();

  const article = useMemo(
    () => articles.find(a => String(a.id) === id && a.status === 'published'),
    [articles, id]
  );

  const related = useMemo(() => {
    if (!article) return [];
    return articles
      .filter(a => a.id !== article.id && a.cat === article.cat && a.status === 'published')
      .slice(0, 3);
  }, [articles, article]);

  if (!article) {
    return (
      <div className="min-h-screen bg-[#f2f1ee] flex items-center justify-center" dir="rtl">
        <div className="text-center">
          <BookOpen size={48} className="mx-auto mb-4 text-charcoal/30" />
          <p className="text-navy font-bold text-lg mb-2">المقال غير موجود</p>
          <p className="text-charcoal/50 text-sm mb-6">ربما تم حذفه أو لم يُنشر بعد</p>
          <Link to="/news" className="btn-primary text-sm px-6 py-2.5 inline-flex items-center gap-2">
            <ArrowRight size={14} /> العودة للأخبار
          </Link>
        </div>
      </div>
    );
  }

  const catLabel = CATEGORIES.find(c => c.id === article.cat)?.label;
  const paragraphs = (article.body || '').split(/\n{2,}/).filter(Boolean);

  const shareOnWhatsApp = () => {
    window.open(
      `https://wa.me/?text=${encodeURIComponent(`${article.title}\n\nاقرأ المقال كاملاً على منصة RESURGO`)}`,
      '_blank'
    );
  };

  return (
    <div className="min-h-screen bg-[#f2f1ee]" dir="rtl">
      <SEO
        title="خبر عقاري"
        description="تفاصيل الخبر العقاري"
        path="/news"
        type="article"
      />

      {/* Hero image */}
      <div className="relative h-[55vh] min-h-[320px] overflow-hidden">
        <img src={article.image} alt={article.title} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-navy via-navy/40 to-transparent" />

        {/* Back button */}
        <div className="absolute top-[74px] right-4 z-10">
          <button onClick={() => navigate(-1)}
            className="flex items-center gap-1.5 text-white/80 hover:text-white bg-white/10 backdrop-blur-sm border border-white/15 rounded-xl px-4 py-2 text-xs font-medium transition-colors">
            <ArrowRight size={13} /> الأخبار
          </button>
        </div>

        {/* Meta overlay */}
        <div className="absolute bottom-0 inset-x-0 px-4 pb-8 max-w-4xl mx-auto">
          <span className={`inline-flex text-[10px] px-2.5 py-1 rounded-full font-bold border mb-3 ${getCategoryColor(article.cat)}`}>
            {catLabel}
          </span>
          <h1 className="text-white font-black text-xl sm:text-2xl lg:text-3xl leading-[1.4] mb-3">
            {article.title}
          </h1>
          <div className="flex items-center gap-4 text-white/60 text-xs flex-wrap">
            <span className="flex items-center gap-1.5">
              <div className="w-5 h-5 rounded-full bg-brand flex items-center justify-center text-[9px] text-white font-bold">
                {article.author?.[0] ?? 'R'}
              </div>
              {article.author}
            </span>
            <span className="flex items-center gap-1"><Clock size={11} /> {article.date}</span>
            <span className="flex items-center gap-1"><BookOpen size={11} /> {article.readTime} دقائق للقراءة</span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div>
      <div className="max-w-4xl mx-auto px-4 py-10">
        <div className="flex flex-col lg:flex-row gap-10">

          {/* Article body */}
          <article className="flex-1 min-w-0">
            {/* Summary */}
            <p className="text-navy/80 text-base leading-relaxed font-medium border-r-4 border-brand pr-5 mb-8">
              {article.summary}
            </p>

            {/* Body paragraphs */}
            <div className="space-y-5">
              {paragraphs.map((para, i) => {
                if (para.startsWith('# ')) {
                  return <h2 key={i} className="text-navy font-black text-xl mt-8 mb-2">{para.slice(2)}</h2>;
                }
                if (para.startsWith('## ')) {
                  return <h3 key={i} className="text-navy font-bold text-lg mt-6 mb-1">{para.slice(3)}</h3>;
                }
                return (
                  <p key={i} className="text-charcoal/75 leading-loose text-sm">{para}</p>
                );
              })}
            </div>

            {/* Tags */}
            {article.tags?.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-10 pt-6 border-t border-navy/10">
                <Tag size={13} className="text-charcoal/40 mt-0.5" />
                {article.tags.map(t => (
                  <span key={t}
                    className="text-xs bg-brand/8 text-brand border border-brand/15 px-3 py-1 rounded-full font-medium">
                    {t}
                  </span>
                ))}
              </div>
            )}

            {/* Share */}
            <div className="flex items-center gap-3 mt-8 pt-6 border-t border-navy/10">
              <span className="text-charcoal/50 text-xs font-semibold">مشاركة:</span>
              <button onClick={shareOnWhatsApp}
                className="flex items-center gap-2 text-xs bg-[#25D366]/10 border border-[#25D366]/25 text-[#22c55e] px-4 py-2 rounded-xl font-medium hover:bg-[#25D366]/15 transition-colors">
                <MessageCircle size={13} /> واتساب
              </button>
              <button
                onClick={() => { navigator.clipboard?.writeText(window.location.href); }}
                className="flex items-center gap-2 text-xs border border-navy/15 text-charcoal/60 px-4 py-2 rounded-xl hover:text-navy transition-colors">
                <Share2 size={13} /> نسخ الرابط
              </button>
            </div>

            {/* ── Cross-service CTA ── */}
            {CAT_SERVICE[article.cat] && (() => {
              const svc = CAT_SERVICE[article.cat];
              return (
                <Link to={svc.to}
                  className={`flex items-center gap-4 mt-6 p-4 border rounded-2xl transition-all group ${svc.cls}`}>
                  <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${svc.dot}`} />
                  <div className="flex-1">
                    <p className="text-navy font-bold text-sm">{svc.label}</p>
                    <p className="text-charcoal/55 text-xs mt-0.5">{svc.sub}</p>
                  </div>
                  <ChevronLeft size={16} className="text-charcoal/30 group-hover:text-navy transition-colors shrink-0" />
                </Link>
              );
            })()}
          </article>

          {/* Sidebar */}
          <aside className="lg:w-64 shrink-0 space-y-6">
            {/* Back link */}
            <Link to="/news"
              className="flex items-center gap-2 text-brand text-sm font-semibold hover:text-navy transition-colors">
              <ChevronLeft size={16} /> جميع المقالات
            </Link>

            {/* Article info card */}
            <div className="bg-white p-4 space-y-3 shadow-[0_2px_8px_rgba(31,42,56,0.06)] rounded-lg">
              <p className="text-charcoal/50 text-xs font-semibold uppercase tracking-wider">تفاصيل المقال</p>
              <div className="space-y-2 text-xs">
                {[
                  ['الكاتب',    article.author],
                  ['التاريخ',   article.date],
                  ['القراءة',   `${article.readTime} دقائق`],
                  ['التصنيف',  catLabel],
                ].map(([label, val]) => (
                  <div key={label} className="flex items-center justify-between">
                    <span className="text-charcoal/50">{label}</span>
                    <span className="text-navy font-medium">{val}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Related */}
            {related.length > 0 && (
              <div>
                <p className="text-charcoal/50 text-xs font-semibold uppercase tracking-wider mb-3">مقالات ذات صلة</p>
                <div className="space-y-3">
                  {related.map(a => <RelatedCard key={a.id} article={a} />)}
                </div>
              </div>
            )}
          </aside>
        </div>
      </div>
      </div>
    </div>
  );
}
