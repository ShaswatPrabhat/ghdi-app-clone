import { worldMap } from "./world-map/arabic";
import { methodology } from "./methodology/arabic";
import { countryList } from "./country-list/arabic";
import { countryProfile } from "./country-profile/arabic";
import { indicators } from "./indicators/arabic";
import { date } from "./date/arabic";
import { healthIndicatorQuestionnaire } from "./health-indicator-questionnaire/arabic";
import { regionalOverview } from "./regional-overview/arabic";

export const ar = {
  worldMap,
  methodology,
  countryList,
  countryProfile,
  indicators,
  date,
  healthIndicatorQuestionnaire,
  headers: {
    worldMap: "خريطة العالم",
    indicators: "المؤشرات",
    searchBoxPlaceholder: "البحث عن طريق اسم البلد",
    regions: "المناطق",
    countries: "بلدان",
  },
  mixed: {
    textOverAll: "المؤشر العام",
    phase: "المرحلة",
    phaseN: "المرحلة {number}",
    all: "الكل",
    noDataAvailable: "لا تتوافر بيانات",
    noData: "لايوجد بيانات",
    serverErrorTitle: "خطأ في خادم الكمبيوتر",
    loading: "جارٍ تحميل",
    selectYear: "حدد السنة التي سيتم عرض التاريخ فيها على الصفحة الرئيسية",
  },
  footer: {
    contactEmail: "الاتصال: info@digitalhealthmonitor.org",
  },
  scoreCardPDF: {
    average: "متوسط",
    title: "{country} - بطاقة نتائج الصحة الرقمية الوطنية",
    benchMarkPhaseValue: "المرحلة {benchmarkPhase} بلدان",
    benchmarkAgainstGlobal: "المعيار مقابل المتوسط ​​العالمي",
    benchmarkAgainstRegion: "المعيار مقابل المتوسط ​​الإقليمي",
    noteForBenchmark:
      "يستخدم المؤشر الرئيسي في كل فئة لحساب المتوسط العام للبلد. يمكن قياس كل بلد مقابل المتوسط العالمي أو البلدان ضمن مرحلة محددة.",
    spiderGraphTitle: "نظرة عامة على المرحلة",
    lineChartTitle: "تقدم الدولة على مر السنين",
    govtApprovedTrue: "المعتمدة من الحكومة: صحيح",
    govtApprovedFalse: "وافقت الحكومة: خطأ",
  },
  regionDropDown: {
    textSelectRegion: "اختر المنطقة",
  },
  regionalOverview,
};
