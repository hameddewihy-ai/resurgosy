import { supabase } from '../lib/supabase'; // تم تعديل المسار ليطابق ملف الإعدادات الحقيقي

// دالة مركزية لاستدعاء Edge Function
const invokeEmailFunction = async (to, subject, html) => {
  try {
    const { data, error } = await supabase.functions.invoke('send-email', {
      body: { to, subject, html }
    });
    if (error) throw error;
    return data;
  } catch (error) {
    throw error;
  }
};

// النمط الأساسي لرسائل المنصة (CSS)
const emailStyle = `
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  direction: rtl;
  text-align: right;
  line-height: 1.6;
  color: #333;
  max-width: 600px;
  margin: 0 auto;
  padding: 20px;
  border: 1px solid #eaeaea;
  border-radius: 8px;
`;

const headerStyle = `
  background-color: #1a365d;
  color: white;
  padding: 15px;
  border-radius: 8px 8px 0 0;
  text-align: center;
`;

/**
 * 1. إرسال إيميل ترحيبي
 */
export const sendWelcomeEmail = async (userEmail, userName) => {
  const html = `
    <div style="${emailStyle}">
      <div style="${headerStyle}"><h2>مرحباً بك في Resurgo</h2></div>
      <div style="padding: 20px;">
        <h3>أهلاً بك ${userName}!</h3>
        <p>سعداء جداً بانضمامك إلى منصة المقاولات والتقييم العقاري الأفضل في السوق السوري.</p>
        <p>يمكنك الآن البدء بتصفح المشاريع وتقديم الطلبات بكل سهولة.</p>
        <br/>
        <p>فريق الدعم الفني - Resurgo</p>
      </div>
    </div>
  `;
  return invokeEmailFunction(userEmail, 'مرحباً بك في منصة Resurgo!', html);
};

/**
 * 2. تأكيد استلام طلب تسعير (للعميل)
 */
export const sendRFQConfirmation = async (userEmail, userName, projectName) => {
  const html = `
    <div style="${emailStyle}">
      <div style="${headerStyle}"><h2>تم استلام طلبك بنجاح</h2></div>
      <div style="padding: 20px;">
        <h3>مرحباً ${userName}،</h3>
        <p>لقد استلمنا طلب التسعير (RFQ) الخاص بمشروع: <strong>${projectName}</strong>.</p>
        <p>سيقوم فريقنا الهندسي بدراسة الطلب وعرضه على نخبة المقاولين المعتمدين لدينا.</p>
        <p>سنوافيك بالتحديثات قريباً.</p>
        <br/>
        <p>مع تحيات،<br/>فريق Resurgo</p>
      </div>
    </div>
  `;
  return invokeEmailFunction(userEmail, `تأكيد استلام طلب تسعير: ${projectName}`, html);
};

/**
 * 3. إشعار للمقاول بوجود مشروع جديد
 */
export const sendContractorNotification = async (contractorEmail, projectName, area) => {
  const html = `
    <div style="${emailStyle}">
      <div style="${headerStyle}"><h2>فرصة مشروع جديد!</h2></div>
      <div style="padding: 20px;">
        <h3>عزيزي المقاول،</h3>
        <p>يتوفر طلب تسعير جديد يناسب تخصصك على منصة Resurgo.</p>
        <ul>
          <li><strong>اسم المشروع:</strong> ${projectName}</li>
          <li><strong>المنطقة:</strong> ${area}</li>
        </ul>
        <p>يرجى تسجيل الدخول لحسابك للاطلاع على التفاصيل وتقديم عرض السعر الخاص بك.</p>
        <br/>
        <p>بالتوفيق،<br/>إدارة منصة Resurgo</p>
      </div>
    </div>
  `;
  return invokeEmailFunction(contractorEmail, `مشروع جديد متاح: ${projectName}`, html);
};

/**
 * 4. إشعار للعميل بترسية المشروع
 */
export const sendBidAwardedEmail = async (userEmail, userName, contractorName) => {
  const html = `
    <div style="${emailStyle}">
      <div style="${headerStyle}"><h2>تم اعتماد عرض السعر!</h2></div>
      <div style="padding: 20px;">
        <h3>مرحباً ${userName}،</h3>
        <p>يسعدنا إخبارك بأنه تم اعتماد عرض السعر الخاص بمشروعك والمقدم من المقاول: <strong>${contractorName}</strong>.</p>
        <p>يرجى الدخول للمنصة لإتمام إجراءات توقيع العقد المبدئي والبدء بالعمل.</p>
        <br/>
        <p>مع تحيات،<br/>فريق Resurgo</p>
      </div>
    </div>
  `;
  return invokeEmailFunction(userEmail, 'اعتماد العرض المالي لمشروعك', html);
};

/**
 * 5. إشعار للمُقَيِّم العقاري
 */
export const sendAppraiserNotification = async (appraiserEmail, propertyArea) => {
  const html = `
    <div style="${emailStyle}">
      <div style="${headerStyle}"><h2>طلب تقييم عقاري جديد</h2></div>
      <div style="padding: 20px;">
        <h3>عزيزي الخبير المُقَيِّم،</h3>
        <p>تم تعيين طلب تقييم عقاري جديد لحسابك في منطقة: <strong>${propertyArea}</strong>.</p>
        <p>يرجى الدخول للمنصة لترتيب موعد الكشف الميداني مع العميل وإعداد التقرير.</p>
        <br/>
        <p>إدارة منصة Resurgo</p>
      </div>
    </div>
  `;
  return invokeEmailFunction(appraiserEmail, 'تنبيه: طلب تقييم عقاري جديد', html);
};

/**
 * 6. تحديث حالة المعاملة العقارية
 */
export const sendTransactionStatusUpdate = async (userEmail, userName, statusText) => {
  const html = `
    <div style="${emailStyle}">
      <div style="${headerStyle}"><h2>تحديث لحالة معاملتك</h2></div>
      <div style="padding: 20px;">
        <h3>مرحباً ${userName}،</h3>
        <p>نود إعلامك بأنه تم تحديث حالة معاملتك العقارية إلى:</p>
        <h4 style="color: #2b6cb0; text-align: center; padding: 10px; background: #ebf8ff; border-radius: 5px;">${statusText}</h4>
        <p>يمكنك تتبع سير المعاملة من خلال لوحة التحكم الخاصة بك.</p>
        <br/>
        <p>فريق الشؤون القانونية - Resurgo</p>
      </div>
    </div>
  `;
  return invokeEmailFunction(userEmail, 'تحديث بخصوص معاملتك العقارية', html);
};

/**
 * 7. تنبيهات الإدارة (Admin Alerts)
 */
export const sendAdminAlert = async (adminEmail, alertType, details) => {
  const html = `
    <div style="${emailStyle}; border-color: #e53e3e;">
      <div style="${headerStyle}; background-color: #c53030;"><h2>تنبيه نظامي: ${alertType}</h2></div>
      <div style="padding: 20px;">
        <p><strong>نوع التنبيه:</strong> ${alertType}</p>
        <p><strong>التفاصيل:</strong></p>
        <pre style="background: #f7fafc; padding: 10px; border-radius: 5px; direction: ltr; text-align: left;">
${JSON.stringify(details, null, 2)}
        </pre>
        <p>يرجى اتخاذ الإجراء اللازم.</p>
      </div>
    </div>
  `;
  return invokeEmailFunction(adminEmail, `تنبيه من المنصة: ${alertType}`, html);
};

/**
 * 8. إشعار للمالك بوصول استفسار جديد
 */
export const sendInquiryNotification = async (ownerId, propertyTitle, senderName, senderPhone, message) => {
  try {
    const { data, error } = await supabase.functions.invoke('notify-inquiry', {
      body: { owner_id: ownerId, property_title: propertyTitle, sender_name: senderName, sender_phone: senderPhone, message }
    });
    if (error) throw error;
    return data;
  } catch {}
};

/**
 * 9. إيصال إلكتروني بالدفع
 */
export const sendPaymentReceipt = async (userEmail, userName, amount, serviceName) => {
  const html = `
    <div style="${emailStyle}">
      <div style="${headerStyle}"><h2>إيصال دفع إلكتروني</h2></div>
      <div style="padding: 20px;">
        <h3>مرحباً ${userName}،</h3>
        <p>لقد استلمنا دفعتك بنجاح، شكراً لك.</p>
        <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
          <tr style="border-bottom: 1px solid #ddd;">
            <th style="padding: 8px; text-align: right;">الخدمة</th>
            <th style="padding: 8px; text-align: left;">المبلغ</th>
          </tr>
          <tr>
            <td style="padding: 8px;">${serviceName}</td>
            <td style="padding: 8px; text-align: left;"><strong>${amount} ل.س</strong></td>
          </tr>
        </table>
        <p style="margin-top: 20px; font-size: 12px; color: #718096;">هذا الإيصال مُصدر آلياً من منصة Resurgo ولا يحتاج لختم.</p>
      </div>
    </div>
  `;
  return invokeEmailFunction(userEmail, `إيصال دفع: ${serviceName}`, html);
};
