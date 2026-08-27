/**
 * Every city and governorate of the Kingdom, grouped by its administrative
 * region (منطقة إدارية) — the 13 regions in their official order.
 *
 * The Arabic name is the identity here, not a label: it is what the backend
 * stores on a unit and what `?city=` filters by, so it must never be
 * "translated". The English string is display copy for the EN locale only.
 * That is also why this table lives in `data/` rather than in `messages/`,
 * where a translator editing the Arabic side would silently break search.
 */

export interface SaudiCity {
  /** Arabic name — the backend's value for this city. */
  value: string;
  /** English display label. */
  en: string;
}

export interface SaudiRegion {
  ar: string;
  en: string;
  cities: SaudiCity[];
}

export const SAUDI_REGIONS: SaudiRegion[] = [
  {
    ar: 'منطقة الرياض',
    en: 'Riyadh Region',
    cities: [
      { value: 'الرياض', en: 'Riyadh' },
      { value: 'الدرعية', en: 'Diriyah' },
      { value: 'الخرج', en: 'Al Kharj' },
      { value: 'الدوادمي', en: 'Ad Dawadimi' },
      { value: 'المجمعة', en: "Al Majma'ah" },
      { value: 'القويعية', en: 'Al Quwaiiyah' },
      { value: 'وادي الدواسر', en: 'Wadi ad-Dawasir' },
      { value: 'الأفلاج', en: 'Al Aflaj' },
      { value: 'الزلفي', en: 'Az Zulfi' },
      { value: 'شقراء', en: 'Shaqra' },
      { value: 'حوطة بني تميم', en: 'Hawtat Bani Tamim' },
      { value: 'عفيف', en: 'Afif' },
      { value: 'السليل', en: 'As Sulayyil' },
      { value: 'ضرما', en: 'Dhurma' },
      { value: 'المزاحمية', en: 'Al Muzahimiyah' },
      { value: 'رماح', en: 'Rumah' },
      { value: 'ثادق', en: 'Thadiq' },
      { value: 'حريملاء', en: 'Huraymila' },
      { value: 'الحريق', en: 'Al Hariq' },
      { value: 'الغاط', en: 'Al Ghat' },
      { value: 'مرات', en: 'Marat' },
      { value: 'الرين', en: 'Ar Rayn' },
    ],
  },
  {
    ar: 'منطقة مكة المكرمة',
    en: 'Makkah Region',
    cities: [
      { value: 'مكة المكرمة', en: 'Makkah' },
      { value: 'جدة', en: 'Jeddah' },
      { value: 'الطائف', en: 'Taif' },
      { value: 'رابغ', en: 'Rabigh' },
      { value: 'الليث', en: 'Al Lith' },
      { value: 'القنفذة', en: 'Al Qunfudhah' },
      { value: 'الجموم', en: 'Al Jumum' },
      { value: 'خليص', en: 'Khulais' },
      { value: 'الكامل', en: 'Al Kamil' },
      { value: 'تربة', en: 'Turubah' },
      { value: 'رنية', en: 'Ranyah' },
      { value: 'الخرمة', en: 'Al Khurmah' },
      { value: 'أضم', en: 'Adham' },
      { value: 'المويه', en: 'Al Muwayh' },
      { value: 'بحرة', en: 'Bahrah' },
      { value: 'ميسان', en: 'Maysan' },
      { value: 'العرضيات', en: 'Al Ardiyat' },
    ],
  },
  {
    ar: 'المنطقة الشرقية',
    en: 'Eastern Province',
    cities: [
      { value: 'الدمام', en: 'Dammam' },
      { value: 'الخبر', en: 'Khobar' },
      { value: 'الظهران', en: 'Dhahran' },
      { value: 'الأحساء', en: 'Al Ahsa' },
      { value: 'الجبيل', en: 'Jubail' },
      { value: 'القطيف', en: 'Qatif' },
      { value: 'سيهات', en: 'Saihat' },
      { value: 'تاروت', en: 'Tarout' },
      { value: 'حفر الباطن', en: 'Hafar Al-Batin' },
      { value: 'الخفجي', en: 'Khafji' },
      { value: 'رأس تنورة', en: 'Ras Tanura' },
      { value: 'بقيق', en: 'Abqaiq' },
      { value: 'النعيرية', en: 'An Nairyah' },
      { value: 'قرية العليا', en: 'Qaryat Al Ulya' },
      { value: 'العديد', en: 'Al Udayd' },
    ],
  },
  {
    ar: 'منطقة المدينة المنورة',
    en: 'Madinah Region',
    cities: [
      { value: 'المدينة المنورة', en: 'Madinah' },
      { value: 'ينبع', en: 'Yanbu' },
      { value: 'العلا', en: 'AlUla' },
      { value: 'بدر', en: 'Badr' },
      { value: 'خيبر', en: 'Khaybar' },
      { value: 'الحناكية', en: 'Al Hanakiyah' },
      { value: 'مهد الذهب', en: 'Mahd Adh Dhahab' },
      { value: 'العيص', en: 'Al Ais' },
      { value: 'وادي الفرع', en: 'Wadi Al Fara' },
    ],
  },
  {
    ar: 'منطقة القصيم',
    en: 'Qassim Region',
    cities: [
      { value: 'بريدة', en: 'Buraydah' },
      { value: 'عنيزة', en: 'Unaizah' },
      { value: 'الرس', en: 'Ar Rass' },
      { value: 'المذنب', en: 'Al Mithnab' },
      { value: 'البكيرية', en: 'Al Bukayriyah' },
      { value: 'البدائع', en: 'Al Badai' },
      { value: 'الأسياح', en: 'Al Asyah' },
      { value: 'النبهانية', en: 'An Nabhaniyah' },
      { value: 'عيون الجواء', en: 'Uyun AlJiwa' },
      { value: 'رياض الخبراء', en: 'Riyadh Al Khabra' },
      { value: 'الشماسية', en: 'Ash Shimasiyah' },
      { value: 'عقلة الصقور', en: 'Uqlat As Suqur' },
      { value: 'ضرية', en: 'Dhurayya' },
    ],
  },
  {
    ar: 'منطقة عسير',
    en: 'Asir Region',
    cities: [
      { value: 'أبها', en: 'Abha' },
      { value: 'خميس مشيط', en: 'Khamis Mushait' },
      { value: 'بيشة', en: 'Bisha' },
      { value: 'النماص', en: 'An Namas' },
      { value: 'محايل عسير', en: 'Muhayil Asir' },
      { value: 'ظهران الجنوب', en: 'Dhahran Al Janub' },
      { value: 'سراة عبيدة', en: 'Sarat Ubaidah' },
      { value: 'رجال ألمع', en: 'Rijal Almaa' },
      { value: 'أحد رفيدة', en: 'Ahad Rufaidah' },
      { value: 'تثليث', en: 'Tathlith' },
      { value: 'بلقرن', en: 'Balqarn' },
      { value: 'المجاردة', en: 'Al Majardah' },
      { value: 'البرك', en: 'Al Birk' },
      { value: 'بارق', en: 'Bariq' },
      { value: 'تنومة', en: 'Tanumah' },
      { value: 'طريب', en: 'Tarib' },
    ],
  },
  {
    ar: 'منطقة تبوك',
    en: 'Tabuk Region',
    cities: [
      { value: 'تبوك', en: 'Tabuk' },
      { value: 'نيوم', en: 'NEOM' },
      { value: 'الوجه', en: 'Al Wajh' },
      { value: 'ضباء', en: 'Duba' },
      { value: 'تيماء', en: 'Tayma' },
      { value: 'أملج', en: 'Umluj' },
      { value: 'حقل', en: 'Haql' },
      { value: 'البدع', en: "Al Bad'" },
    ],
  },
  {
    ar: 'منطقة حائل',
    en: 'Hail Region',
    cities: [
      { value: 'حائل', en: 'Hail' },
      { value: 'بقعاء', en: 'Baqaa' },
      { value: 'الغزالة', en: 'Al Ghazalah' },
      { value: 'الشنان', en: 'Ash Shinan' },
      { value: 'الشملي', en: 'Ash Shamli' },
      { value: 'السليمي', en: 'As Sulaymi' },
      { value: 'موقق', en: 'Mawqaq' },
    ],
  },
  {
    ar: 'منطقة الحدود الشمالية',
    en: 'Northern Borders Region',
    cities: [
      { value: 'عرعر', en: 'Arar' },
      { value: 'رفحاء', en: 'Rafha' },
      { value: 'طريف', en: 'Turaif' },
      { value: 'العويقيلة', en: 'Al Uwayqilah' },
    ],
  },
  {
    ar: 'منطقة جازان',
    en: 'Jazan Region',
    cities: [
      { value: 'جازان', en: 'Jazan' },
      { value: 'صبيا', en: 'Sabya' },
      { value: 'أبو عريش', en: 'Abu Arish' },
      { value: 'صامطة', en: 'Samtah' },
      { value: 'بيش', en: 'Baish' },
      { value: 'الدرب', en: 'Ad Darb' },
      { value: 'فرسان', en: 'Farasan' },
      { value: 'أحد المسارحة', en: 'Ahad Al Masarihah' },
      { value: 'الريث', en: 'Ar Rayth' },
      { value: 'ضمد', en: 'Damad' },
      { value: 'العارضة', en: 'Al Aridah' },
      { value: 'العيدابي', en: 'Al Idabi' },
      { value: 'الحرث', en: 'Al Harth' },
      { value: 'الدائر', en: 'Ad Dair' },
      { value: 'فيفا', en: 'Fifa' },
    ],
  },
  {
    ar: 'منطقة نجران',
    en: 'Najran Region',
    cities: [
      { value: 'نجران', en: 'Najran' },
      { value: 'شرورة', en: 'Sharurah' },
      { value: 'حبونا', en: 'Habuna' },
      { value: 'بدر الجنوب', en: 'Badr Al Janub' },
      { value: 'يدمة', en: 'Yadamah' },
      { value: 'ثار', en: 'Thar' },
      { value: 'خباش', en: 'Khubash' },
    ],
  },
  {
    ar: 'منطقة الباحة',
    en: 'Al Bahah Region',
    cities: [
      { value: 'الباحة', en: 'Al Bahah' },
      { value: 'بلجرشي', en: 'Baljurashi' },
      { value: 'المندق', en: 'Al Mandaq' },
      { value: 'المخواة', en: 'Al Makhwah' },
      { value: 'العقيق', en: 'Al Aqiq' },
      { value: 'قلوة', en: 'Qilwah' },
      { value: 'القرى', en: 'Al Qura' },
      { value: 'بني حسن', en: 'Bani Hasan' },
    ],
  },
  {
    ar: 'منطقة الجوف',
    en: 'Al Jawf Region',
    cities: [
      { value: 'سكاكا', en: 'Sakaka' },
      { value: 'دومة الجندل', en: 'Dumat Al Jandal' },
      { value: 'القريات', en: 'Qurayyat' },
      { value: 'طبرجل', en: 'Tabarjal' },
    ],
  },
];

/**
 * Arabic drops its definite article and hamza forms freely in everyday typing:
 * a guest hunting for "الأحساء" types "احساء", and for "الطائف" types "طايف".
 * Folding both away on each side of the comparison keeps those searches alive.
 */
export function foldArabic(s: string): string {
  return s
    .replace(/[ً-ْـ]/g, '') // harakat and tatweel
    .replace(/[إأآٱ]/g, 'ا')
    .replace(/ى/g, 'ي')
    .replace(/ؤ|ئ|ء/g, 'ي')
    .replace(/ة/g, 'ه')
    .replace(/^ال/, '')
    .trim()
    .toLowerCase();
}
