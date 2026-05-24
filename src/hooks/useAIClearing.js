import { useState, useCallback } from 'react';

// ── Syrian legal templates (2026) ──────────────────────────────────────────
export const LEGAL_TEMPLATES = {
  power_of_attorney: {
    nameAr: 'وكالة قانونية عامة',
    lawRef: 'القانون المدني السوري — المادة 151 / قانون التوثيق رقم 4 لعام 2023',
    template: (d) => `
بسم الله الرحمن الرحيم

وكـالـة قـانـونـيـة عـامـة
رقم المرجع: ${d.refNo}
تاريخ التحرير: ${d.date}

المـوكِّـل:
الاسم الكامل  : ${d.grantor_name}
الرقم الوطني  : ${d.grantor_id}
محل الإقامة   : ${d.grantor_address}
الجنسية       : سورية

الوكـيـل:
الاسم الكامل  : ${d.agent_name}
الرقم الوطني  : ${d.agent_id}
محل الإقامة   : ${d.agent_address}

مـوضـوع الوكـالة:
${d.scope}

شروط الوكالة وحدودها:
تُخوِّل هذه الوكالة الوكيلَ المذكور أعلاه، وفق القانون المدني السوري والمرسوم التشريعي رقم /76/ لعام 2021 المتعلق بالتوثيق العقاري، بالقيام بالأعمال التالية نيابةً عن الموكِّل:

١. التقدم إلى دوائر السجل العقاري ومديريات المساحة في الجمهورية العربية السورية لإجراء كافة معاملات تسجيل العقار الموصوف أدناه.
٢. التوقيع على العقود والوثائق الرسمية المتعلقة بالعقار.
٣. تسلُّم الوثائق الرسمية وتسليمها.
٤. ${d.special_powers}

وصف العقار:
${d.property_description}

مدة الوكالة: ${d.duration}
اللغة المعتمدة: العربية

حُرِّرت هذه الوكالة أمام الجهة الموثِّقة المختصة وفق أحكام قانون التوثيق السوري لعام 2023.

توقيع الموكِّل: _____________________
توقيع الوكيل : _____________________
ختم الجهة الموثِّقة: _____________________
`.trim(),
  },

  inheritance_inventory: {
    nameAr: 'إقرار حصر الإرث',
    lawRef: 'قانون الأحوال الشخصية السوري رقم 59 لعام 1953 وتعديلاته / المرسوم 44 لعام 2024',
    template: (d) => `
بسم الله الرحمن الرحيم

إقـرار حـصـر الإرث
رقم المرجع: ${d.refNo}
تاريخ الوفاة: ${d.death_date}
محكمة الإصدار: ${d.court}

المتوفى/المتوفاة:
الاسم الكامل  : ${d.deceased_name}
الرقم الوطني  : ${d.deceased_id}
تاريخ الوفاة  : ${d.death_date}
محل القيد      : ${d.death_place}
الديانة        : ${d.religion}

الورثة الشرعيون (وفق الشريعة الإسلامية / قانون الأحوال الشخصية):
${d.heirs}

التركة:
العقارات       : ${d.real_estate}
المنقولات      : ${d.movables}
الديون والحقوق : ${d.debts}

ملاحظة قانونية:
صدر هذا الإقرار وفق المادة /135/ من قانون الأحوال الشخصية ومرسوم التوثيق العقاري رقم 44 لعام 2024.

قاضي الأحوال الشخصية: _____________________
رقم القرار القضائي   : ${d.court_decision_no}
`.trim(),
  },

  sale_contract: {
    nameAr: 'عقد بيع عقار قطعي',
    lawRef: 'القانون المدني السوري — المادة 388 / قانون التخطيط العمراني رقم 5 / 1982 / إصلاحات الضريبة 2025',
    template: (d) => `
بسم الله الرحمن الرحيم

عـقـد بـيـع عـقـار قـطـعـي لا رجـوع فـيـه
رقم المرجع: ${d.refNo}
تاريخ التحرير: ${d.date}

الفريق الأول (البائع):
الاسم الكامل  : ${d.seller_name}
الرقم الوطني  : ${d.seller_id}
محل الإقامة   : ${d.seller_address}

الفريق الثاني (المشتري):
الاسم الكامل  : ${d.buyer_name}
الرقم الوطني  : ${d.buyer_id}
محل الإقامة   : ${d.buyer_address}

مقدمة العقد:
حيث أن الفريق الأول يملك ويتصرف بكامل السهام البالغة 2400 سهم (أو الحصة السهمية البالغة ___ سهماً) من العقار رقم ${d.property_no} من المنطقة العقارية ${d.property_area} بمدينة ${d.property_city} البالغة مساحته وفقاً لقيود السجل العقاري ${d.property_area_m2} متراً مربعاً، وهو عبارة عن ${d.property_desc}.

المادة الأولى: تعتبر مقدمة هذا العقد جزءاً لا يتجزأ منه وتُفسَّر بنوده بموجبها.

المادة الثانية: باع وتنازل الفريق الأول بكافة الضمانات الفعلية والمادية والقانونية كامل العقار (أو الحصة السهمية) الموصوف بالمقدمة إلى الفريق الثاني القابل بذلك بيعاً قطعياً باتاً لا رجوع فيه ولا نكول.

المادة الثالثة: تم هذا البيع لقاء ثمن إجمالي مقطوع متفق عليه وصرح به أطراف العقد وقدره ${d.price} ليرة سورية. دفع المشتري دفعة نقدية عند التوقيع قدرها ${d.deposit} ليرة سورية، ويعد توقيع البائع بمثابة إيصال بالقبض وإبراء لذمة المشتري.

المادة الرابعة: يقر البائع بخلو العقار من أي إشارات رهن أو حجز أو إشارات مانعة من التصرف، ويلتزم بتطهير أي إشارة تظهر قبل الفراغ من ماله الخاص.

المادة الخامسة: تقع كافة الضرائب والرسوم حتى تاريخ الفراغ النهائي على عاتق الفريق الأول، ويلتزم الطرفان بسداد الضرائب أمام الدائرة المالية بموجب القيمة العقدية الرضائية المصرح عنها وفق إصلاحات 2025.

المادة السادسة: حرر هذا العقد من نسختين أصليتين، بيد كل فريق نسخة.

حُرِّر في ${d.city} بتاريخ ${d.date}
الفريق الأول (البائع): _____________________
الفريق الثاني (المشتري): _____________________
الشاهد الأول: _____________________
الشاهد الثاني: _____________________
`.trim(),
  },

  attorney_special: {
    nameAr: 'وكالة خاصة ببيع عقار',
    lawRef: 'قانون الكاتب بالعدل رقم 15 / 2014 — الاختصاص المكاني / القانون المدني السوري — المادة 151',
    template: (d) => `
بسم الله الرحمن الرحيم

الجمهورية العربية السورية — وزارة العدل
الكاتب بالعدل في ${d.notary_city}

صـك وكـالـة خـاصـة بـبـيـع عـقـار
رقم المرجع: ${d.refNo}
تاريخ التحرير: ${d.date}

الموكِّل:
الاسم الكامل  : ${d.grantor_name}
الرقم الوطني  : ${d.grantor_id}
محل الإقامة   : ${d.grantor_address}

الوكيل:
الاسم الكامل  : ${d.agent_name}
الرقم الوطني  : ${d.agent_id}
محل الإقامة   : ${d.agent_address}

موضوع الوكالة:
أقررت وأنا بالحالة المعتبرة شرعاً وقانوناً بأنني وكّلت وأقمت مقام نفسي ويُنيب عني السيد الوكيل المذكور أعلاه لكي يقوم نيابةً عني في:

بيع وفراغ كامل السهام البالغة 2400 سهم من العقار رقم ${d.property_no} منطقة عقارية ${d.property_area} وهو عبارة عن ${d.property_desc} لمن يشاء بالبدل والثمن الذي يراه مناسباً، وقبض الثمن وإبراء المشتري، والتوقيع نيابةً عني على عقود البيع والنهائية ومحاضر نقل الملكية والفراغ لدى مديرية المصالح العقارية.

ومراجعة كافة الدوائر المالية واستخراج بيانات القيد المالي والإقرار بالقيمة العقدية الرضائية ودفع الضرائب والرسوم والحصول على وثائق "لا مانع" وبراءة الذمة المالية والبلدية.

تنتهي هذه الوكالة الخاصة بإتمام العمل الموكَّل به تلقائياً.

ملاحظة قانونية:
لا يجوز لكاتب العدل تنظيم هذه الوكالة إلا في نطاق اختصاصه المكاني (موقع العقار).
يُرسَل نسخة منها فوراً للسجل العقاري المختص لتسجيل إشارة على صحيفة العقار.

الموكِّل: _____________________
التوقيع: _____________________
البصمة: _____________________
ختم الكاتب بالعدل: _____________________
`.trim(),
  },

  attorney_irrevocable: {
    nameAr: 'وكالة غير قابلة للعزل',
    lawRef: 'القانون المدني السوري — المواد 151-165 / قانون الكاتب بالعدل رقم 15 / 2014 / اجتهاد محكمة التمييز (التقادم العشري)',
    template: (d) => `
بسم الله الرحمن الرحيم

الجمهورية العربية السورية — وزارة العدل
الكاتب بالعدل في ${d.notary_city}

وكـالـة غـيـر قـابـلـة لـلـعـزل
(بيع منجز — تعهد قاطع بنقل الملكية)
رقم المرجع: ${d.refNo}
تاريخ التحرير: ${d.date}

الموكِّل (البائع):
الاسم الكامل  : ${d.grantor_name}
الرقم الوطني  : ${d.grantor_id}
محل الإقامة   : ${d.grantor_address}

الوكيل (المشتري):
الاسم الكامل  : ${d.agent_name}
الرقم الوطني  : ${d.agent_id}
محل الإقامة   : ${d.agent_address}

الثمن المُسدَّد بالكامل: ${d.price} ليرة سورية
(يُعدّ توقيع الموكِّل دليلاً على قبض الثمن كاملاً)

موضوع الوكالة:
نظراً لأن الوكيل (المشتري) قد أسدى ثمن العقار بالكامل، يُخوِّل الموكِّل (البائع) الوكيلَ المذكور أعلاه وكالةً غير قابلة للعزل بموجب القانون المدني السوري لكي يُتمَّ باسم الموكِّل ونيابةً عنه جميع إجراءات فراغ العقار الموصوف أدناه لصالح الوكيل ذاته أو من يشاء.

وصف العقار:
${d.property_description}
رقم السجل العقاري: ${d.land_registry_no}

الأحكام الخاصة:
١. هذه الوكالة غير قابلة للعزل بموجب المادة 156 من القانون المدني السوري.
٢. لا تنتهي بوفاة الطرفين ولا بزوال أهليتهما القانونية.
٣. في حال وفاة الوكيل تنتقل حقوقه إلى ورثته الشرعيين.
٤. تسقط بمرور التقادم العشري (10 سنوات) وفق اجتهاد محكمة التمييز السورية.
٥. يُرسَل نسخة فوراً للمكتب العقاري لتسجيل إشارة على صحيفة العقار.

الموكِّل (البائع): _____________________
التوقيع: _____________________
البصمة: _____________________
ختم الكاتب بالعدل: _____________________
`.trim(),
  },

  title_recovery: {
    nameAr: 'طلب استرداد ملكية',
    lawRef: 'القانون رقم 10 لعام 2018 / المرسوم 66 لعام 2012 وتعديلاته 2024',
    template: (d) => `
بسم الله الرحمن الرحيم

طـلـب اسـتـرداد المـلـكـيـة العـقـاريـة
رقم المرجع: ${d.refNo}
تاريخ الطلب: ${d.date}

مقدِّم الطلب:
الاسم الكامل  : ${d.applicant_name}
الرقم الوطني  : ${d.applicant_id}
صفته           : ${d.applicant_role}

موضوع الطلب:
استرداد ملكية العقار الموصوف أدناه المُدرَج ضمن مناطق إعادة التطوير وفق القانون رقم /10/ لعام 2018 وتعديلاته.

وصف العقار:
${d.property_description}
رقم السجل العقاري: ${d.land_registry_no}
رقم المقطع       : ${d.cadastral_no}

الأساس القانوني:
${d.legal_basis}

المستندات المرفقة: ${d.attached_docs}

${d.notes ? 'ملاحظات إضافية:\n' + d.notes : ''}

يُرجى إحالة هذا الطلب إلى لجنة التحقق العقاري المختصة.

توقيع مقدِّم الطلب: _____________________
`.trim(),
  },
};

// ── Mock AI extractor (replace with real LLM call) ─────────────────────────
async function mockExtractFromDocument(file) {
  await new Promise((r) => setTimeout(r, 1800)); // simulate processing

  const isInheritance = file.name.toLowerCase().includes('irth') ||
    file.name.includes('إرث') || file.name.includes('حصر') || Math.random() > 0.5;

  if (isInheritance) {
    return {
      doc_type: 'inheritance_inventory',
      confidence: 0.91,
      extracted: {
        deceased_name: 'أحمد محمود الصالح',
        deceased_id: '0612345678901',
        death_date: '2024-11-03',
        death_place: 'دمشق',
        religion: 'مسلم',
        court: 'محكمة الأحوال الشخصية — دمشق',
        court_decision_no: 'ق.أ. 2025/441',
        heirs: `
  - الزوجة: فاطمة حسن النور      (الرقم الوطني: 0612345678902)  الحصة: الثمن
  - الابن:  محمد أحمد الصالح     (الرقم الوطني: 0612345678903)  الحصة: عصبة
  - الابن:  خالد أحمد الصالح     (الرقم الوطني: 0612345678904)  الحصة: عصبة
  - البنت:  سارة أحمد الصالح     (الرقم الوطني: 0612345678905)  الحصة: نصف العصبة`,
        real_estate: 'شقة سكنية — دمشق / المزة / رقم السجل العقاري: 4421/دمشق',
        movables: 'مركبة خاصة + محتويات المسكن',
        debts: 'لا يوجد',
      },
      raw_text_excerpt: 'حصر إرث مستخرج من وثيقة الوفاة المُصدَّقة وشهادة الزواج والسجلات المدنية...',
    };
  }

  return {
    doc_type: 'power_of_attorney',
    confidence: 0.87,
    extracted: {
      grantor_name: 'رنا سليم الحسيني',
      grantor_id: '0609876543210',
      grantor_address: 'دمشق — شارع الثورة — بناء 14',
      agent_name: 'سامر وليد الخطيب',
      agent_id: '0609876543211',
      agent_address: 'دمشق — العدوي — بناء 3 شقة 5',
      scope: 'تسجيل العقار وإتمام إجراءات البيع والشراء وتوثيق العقود أمام الجهات الرسمية',
      property_description: 'شقة سكنية في الطابق الثالث، مساحة 120م²، محافظة دمشق، حي المزة، وصف المقطع: 12/دمشق',
      special_powers: 'التصرف بالبيع والشراء والتسجيل أمام دائرة السجل العقاري',
      duration: 'سنة واحدة من تاريخ التوثيق',
    },
    raw_text_excerpt: 'وكالة مستخرجة من المستند المُقدَّم مع التحقق من الهوية والتوثيق...',
  };
}

// ── AES-GCM encryption via SubtleCrypto ───────────────────────────────────
async function encryptData(plaintext) {
  const key = await window.crypto.subtle.generateKey(
    { name: 'AES-GCM', length: 256 },
    true,
    ['encrypt', 'decrypt']
  );
  const iv = window.crypto.getRandomValues(new Uint8Array(12));
  const encoded = new TextEncoder().encode(plaintext);
  const ciphertext = await window.crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, encoded);
  const exportedKey = await window.crypto.subtle.exportKey('raw', key);

  return {
    ciphertext: btoa(String.fromCharCode(...new Uint8Array(ciphertext))),
    iv: btoa(String.fromCharCode(...iv)),
    keyHex: Array.from(new Uint8Array(exportedKey)).map((b) => b.toString(16).padStart(2, '0')).join(''),
    algorithm: 'AES-256-GCM',
  };
}

// ── Generate microfilm metadata (ANSI/AIIM MS23 inspired) ─────────────────
function buildMicrofilmMetadata({ refNo, docType, clerkId, archiveDate, encResult }) {
  return {
    standard: 'RESURGO-MICROFILM-META-v1.0',
    ansi_ref: 'ANSI/AIIM MS23-2024',
    frame: {
      roll_id: `SY-${new Date().getFullYear()}-${refNo}`,
      frame_no: Math.floor(Math.random() * 90000 + 10000),
      reduction_ratio: '24:1',
      resolution_lpmm: 120,
      polarity: 'positive',
    },
    document: {
      ref_no: refNo,
      doc_type: docType,
      language: 'ar',
      country: 'SY',
      archive_date: archiveDate,
      legal_validity: 'مُعتمَد — الجمهورية العربية السورية',
      classification: 'سري — مستوى 2',
    },
    encryption: {
      algorithm: encResult.algorithm,
      iv_base64: encResult.iv,
      key_fingerprint: encResult.keyHex.slice(0, 16) + '...',
    },
    custody: {
      clerk_id: clerkId,
      platform: 'RESURGO PropTech v2.0',
      blockchain_anchor: 'pending',
      government_portal: 'إنجز — Anjez Gov Portal',
      archive_location: 'المركز الوطني للأرشفة الرقمية — دمشق',
    },
  };
}

// ── Main hook ─────────────────────────────────────────────────────────────
export function useAIClearing() {
  const [extractState, setExtractState] = useState({ loading: false, result: null, error: null });
  const [archiveState, setArchiveState] = useState({ loading: false, result: null, error: null });

  const extractDocument = useCallback(async (file) => {
    setExtractState({ loading: true, result: null, error: null });
    try {
      const result = await mockExtractFromDocument(file);
      setExtractState({ loading: false, result, error: null });
      return result;
    } catch {
      setExtractState({ loading: false, result: null, error: 'فشل في قراءة الوثيقة' });
      return null;
    }
  }, []);

  const archiveSovereign = useCallback(async ({ refNo, docType, draftText, clerkId }) => {
    setArchiveState({ loading: true, result: null, error: null });
    try {
      const encResult = await encryptData(draftText);
      const archiveDate = new Date().toISOString();
      const metadata = buildMicrofilmMetadata({ refNo, docType, clerkId, archiveDate, encResult });

      const result = {
        refNo,
        archiveDate,
        encResult,
        metadata,
        downloadable: {
          encrypted: JSON.stringify({ ref: refNo, ...encResult }, null, 2),
          metadata: JSON.stringify(metadata, null, 2),
        },
      };
      setArchiveState({ loading: false, result, error: null });
      return result;
    } catch (err) {
      setArchiveState({ loading: false, result: null, error: 'فشل في الأرشفة السيادية' });
      return null;
    }
  }, []);

  return { extractState, archiveState, extractDocument, archiveSovereign };
}
