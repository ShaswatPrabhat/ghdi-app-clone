import { worldMap } from "./world-map/english";
import { methodology } from "./methodology/english";
import { countryList } from "./country-list/english";
import { countryProfile } from "./country-profile/english";
import { indicators } from "./indicators/english";
import { date } from "./date/english";
import { healthIndicatorQuestionnaire } from "./health-indicator-questionnaire/english";
import { regionalOverview } from "./regional-overview/english";

export const en = {
  worldMap,
  methodology,
  countryList,
  countryProfile,
  indicators,
  date,
  healthIndicatorQuestionnaire,
  headers: {
    worldMap: "World Map",
    indicators: "Indicators",
    searchBoxPlaceholder: "Search by country name",
    regions: "Regions",
    countries: "Countries",
  },
  mixed: {
    textOverAll: "Overall",
    phase: "Phase",
    phaseN: "Phase {number}",
    all: "All",
    noDataAvailable: "No data available",
    noData: "No Data",
    serverErrorTitle: "Server Error",
    loading: "Loading",
    selectYear: "Select year for which date is to be displayed on the Homepage",
  },
  footer: {
    contactEmail: "Contact: info@digitalhealthmonitor.org",
  },
  scoreCardPDF: {
    average: "Average",
    title: "{country} - National Digital Health Scorecard",
    benchMarkPhaseValue: "Phase {benchmarkPhase} Countries",
    benchmarkAgainstGlobal: "Benchmark Against Global Average",
    benchmarkAgainstRegion: "Benchmark Against Regional Average",
    noteForBenchmark:
      "The main indicator in each category is used to calculate overall country average. Each country can be benchmarked " +
      "against global average or countries within a selected phase.",
    spiderGraphTitle: "Phase Overview",
    lineChartTitle: "Country Progress over the years",
    govtApprovedTrue: "Government Approved: True",
    govtApprovedFalse: "Government Approved: False",
  },
  regionDropDown: {
    textSelectRegion: "Select Region",
  },
  regionalOverview,
};
