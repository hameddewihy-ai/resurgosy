const BASE = `
  <div style="font-family:Arial,sans-serif;direction:rtl;text-align:right;background:#f7f1eb;padding:32px 16px;min-height:100vh">
    <div style="max-width:560px;margin:0 auto;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(31,42,56,0.08)">
      <div style="background:#1f2a38;padding:28px 32px;text-align:center">
        <p style="color:#f7f1eb;font-size:22px;font-weight:900;margin:0;letter-spacing:2px">RESURGO</p>
        <p style="color:rgba(247,241,235,0.5);font-size:11px;margin:4px 0 0;letter-spacing:1px">المنصة العقارية السورية</p>
      </div>
      <div style="padding:32px">
        {{BODY}}
      </div>
      <div style="background:#f7f1eb;padding:20px 32px;text-align:center;border-top:1px solid rgba(31,42,56,0.06)">
        <p style="color:rgba(31,42,56,0.4);font-size:11px;margin:0">© 2025 RESURGO · resurgosy.com</p>
      </div>
    </div>
  </div>
`;

const wrap = (body) => BASE.replace('{{BODY}}', body);

export const propertyApprovedHtml = (propTitle) => wrap(`
  <div style="text-align:center;margin-bottom:24px">
    <div style="width:60px;height:60px;background:#d1fae5;border-radius:50%;display:inline-flex;align-items:center;justify-content:center;font-size:28px;margin-bottom:12px">✅</div>
    <h2 style="color:#1f2a38;font-size:20px;font-weight:900;margin:0">تمت الموافقة على عقارك!</h2>
  </div>
  <p style="color:#3d3d3d;font-size:14px;line-height:1.8;margin:0 0 16px">
    يسعدنا إبلاغك بأن عقارك <strong style="color:#1f2a38">"${propTitle}"</strong> قد تمت مراجعته والموافقة عليه من فريق RESURGO، وأصبح منشوراً الآن في دليل العقارات.
  </p>
  <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:10px;padding:16px;margin-bottom:24px">
    <p style="color:#166534;font-size:13px;margin:0;font-weight:bold">🏠 عقارك متاح الآن للمشترين والمستأجرين المحتملين.</p>
  </div>
  <a href="https://resurgosy.com/dashboard" style="display:inline-block;background:#f37124;color:#ffffff;text-decoration:none;padding:14px 28px;border-radius:10px;font-size:14px;font-weight:900">
    عرض لوحة التحكم
  </a>
`);

export const propertyRejectedHtml = (propTitle) => wrap(`
  <div style="text-align:center;margin-bottom:24px">
    <div style="width:60px;height:60px;background:#fee2e2;border-radius:50%;display:inline-flex;align-items:center;justify-content:center;font-size:28px;margin-bottom:12px">⚠️</div>
    <h2 style="color:#1f2a38;font-size:20px;font-weight:900;margin:0">بخصوص طلب نشر عقارك</h2>
  </div>
  <p style="color:#3d3d3d;font-size:14px;line-height:1.8;margin:0 0 16px">
    نأسف لإبلاغك بأنه تعذّر نشر عقارك <strong style="color:#1f2a38">"${propTitle}"</strong> في الوقت الحالي بسبب عدم استيفاء بعض متطلبات التحقق.
  </p>
  <div style="background:#fef2f2;border:1px solid #fecaca;border-radius:10px;padding:16px;margin-bottom:24px">
    <p style="color:#991b1b;font-size:13px;margin:0">يرجى مراجعة بيانات العقار والتأكد من صحة المعلومات، ثم إعادة التقديم أو التواصل مع الدعم.</p>
  </div>
  <a href="https://resurgosy.com/dashboard" style="display:inline-block;background:#1f2a38;color:#ffffff;text-decoration:none;padding:14px 28px;border-radius:10px;font-size:14px;font-weight:900">
    مراجعة البيانات
  </a>
`);

export const valuationAcceptedHtml = (clientName, tier) => {
  const tierAr = { field: 'ميداني', desktop: 'مكتبي', legal: 'قانوني', avm: 'مبدئي' }[tier] || tier;
  return wrap(`
    <div style="text-align:center;margin-bottom:24px">
      <div style="width:60px;height:60px;background:#dbeafe;border-radius:50%;display:inline-flex;align-items:center;justify-content:center;font-size:28px;margin-bottom:12px">📋</div>
      <h2 style="color:#1f2a38;font-size:20px;font-weight:900;margin:0">بدأ خبيرنا دراسة طلبك</h2>
    </div>
    <p style="color:#3d3d3d;font-size:14px;line-height:1.8;margin:0 0 16px">
      عزيزي <strong style="color:#1f2a38">${clientName || 'العميل'}</strong>، نُعلمك بأن طلب التقييم العقاري (<strong>${tierAr}</strong>) قد تمت مراجعته وبدأ خبير التقييم لدينا دراسته الآن.
    </p>
    <div style="background:#eff6ff;border:1px solid #bfdbfe;border-radius:10px;padding:16px;margin-bottom:24px">
      <p style="color:#1e40af;font-size:13px;margin:0;font-weight:bold">⏳ سيصلك تقرير التقييم خلال المدة المتفق عليها.</p>
    </div>
    <a href="https://resurgosy.com/dashboard" style="display:inline-block;background:#5979bb;color:#ffffff;text-decoration:none;padding:14px 28px;border-radius:10px;font-size:14px;font-weight:900">
      متابعة حالة الطلب
    </a>
  `);
};

export const valuationRejectedHtml = (clientName) => wrap(`
  <div style="text-align:center;margin-bottom:24px">
    <div style="width:60px;height:60px;background:#fef3c7;border-radius:50%;display:inline-flex;align-items:center;justify-content:center;font-size:28px;margin-bottom:12px">📩</div>
    <h2 style="color:#1f2a38;font-size:20px;font-weight:900;margin:0">بخصوص طلب التقييم</h2>
  </div>
  <p style="color:#3d3d3d;font-size:14px;line-height:1.8;margin:0 0 16px">
    عزيزي <strong style="color:#1f2a38">${clientName || 'العميل'}</strong>، نأسف لإبلاغك بأنه تعذّر قبول طلب التقييم في الوقت الحالي.
  </p>
  <div style="background:#fffbeb;border:1px solid #fde68a;border-radius:10px;padding:16px;margin-bottom:24px">
    <p style="color:#92400e;font-size:13px;margin:0">يرجى التواصل معنا لمزيد من التفاصيل أو لتقديم طلب جديد.</p>
  </div>
  <a href="https://resurgosy.com/valuation-request" style="display:inline-block;background:#1f2a38;color:#ffffff;text-decoration:none;padding:14px 28px;border-radius:10px;font-size:14px;font-weight:900">
    تقديم طلب جديد
  </a>
`);
