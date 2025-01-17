<script>
import Vue from "vue";
import developmentIndicators from "../developmentIndicators/development-indicators.vue";
import countrySummary from "../countrySummary/country-summary.vue";
import axios from "axios";
import { generateScorecard } from "../pdfHelper/pdf-generate-scorecard";
import isEmpty from "lodash/isEmpty";
import Notifications from "vue-notification";
import common from "../../common/common";
import CountryProfileYearSelector from "./country-profile-year-selector.vue";
import CountryProgressLineGraphContainer from "../graphs/country-progress-line-graph/country-progress-line-graph-container.vue";
import { EventBus } from "../common/event-bus";
import { EVENTS } from "../../constants";
import PhaseOverviewSpiderGraph from "../graphs/phase-overview-spider-graph/phase-overview-spider-graph.vue";
import RegionSelector from "../regionSelector/region-selector.vue";
import CategoryImage from "../categoryImages/categoryImage.vue";

Vue.use(Notifications);

export default Vue.extend({
  components: {
    developmentIndicators,
    countrySummary,
    PhaseOverviewSpiderGraph,
    CountryProfileYearSelector,
    CountryProgressLineGraphContainer,
    RegionSelector,
    CategoryImage,
  },
  data() {
    return {
      healthIndicatorData: {
        countryName: "",
        countryPhase: "NA",
        categories: [],
      },
      url: "",
      benchmarkData: {},
      benchmarkPhase: -1,
      phases: [],
      countrySummary: "",
      govtApproved: false,
      hasBenchmarkData: true,
      updatedDate: "",
      showCountryProgressOverTime: false,
      locale: "en",
      selectedYear: null,
      globalData: {},
      yearOnYearData: {},
      selectedRegion: {},
    };
  },
  beforeDestroy() {
    EventBus.$off(EVENTS.YEAR_FILTERED);
    EventBus.$off(EVENTS.REGION_FILTERED);
  },
  mounted() {
    common.showLoading();
    this.getHealthIndicatorsFor(this.$route.params.countryCode);
    this.getBenchmarkData();
    this.getGlobalAverage();
    this.url = `/api/export_country_data/${this.$route.params.countryCode}`;
    this.fetchPhases();
    EventBus.$on(EVENTS.YEAR_FILTERED, (selectedYear) => {
      common.showLoading();
      this.selectedYear = selectedYear;
      this.getHealthIndicatorsFor(this.$route.params.countryCode);
      this.getBenchmarkData();
      this.getGlobalAverage();
    });
    EventBus.$on(EVENTS.REGION_FILTERED, () => {
      common.showLoading();
      this.selectedRegion = window.appProperties.getRegion();
      this.getBenchmarkData();
      this.getGlobalAverage();
    });
  },
  updated() {
    if (this.locale !== this.$i18n.locale) {
      this.getHealthIndicatorsFor(this.$route.params.countryCode);
      if (this.healthIndicatorData && this.healthIndicatorData.updatedDate) {
        this.setUpdatedDate(this.healthIndicatorData.updatedDate);
      }
      this.locale = this.$i18n.locale;
    }
  },
  methods: {
    fetchPhases() {
      axios.get("/api/phases").then((response) => {
        this.phases = response.data;
      });
    },
    onSummaryLoaded(countrySummary, govtApproved) {
      this.countrySummary = countrySummary;
      this.govtApproved = govtApproved;
    },
    getGlobalAverage() {
      const globalHealthIndicatorsUrl = `/api/global_health_indicators`;
      axios
        .get(
          globalHealthIndicatorsUrl,
          common.configWithUserLanguageAndNoCacheHeader(
            this.$i18n.locale,
            this.selectedYear,
            this.selectedRegion.regionId
          )
        )
        .then((response) => {
          this.globalData = response.data;
        });
    },
    getHealthIndicatorsFor(countryCode) {
      axios
        .get(
          `/api/countries/${countryCode}/health_indicators`,
          common.configWithUserLanguageAndNoCacheHeader(
            this.$i18n.locale,
            this.selectedYear
          )
        )
        .then((response) => {
          this.healthIndicatorCallback(response);
          common.hideLoading();
        });
    },
    setUpdatedDate(date) {
      this.updatedDate = common.dateInLocaleFormat(date, this.$i18n);
    },

    healthIndicatorCallback(response) {
      this.healthIndicatorData = response.data;
      this.setUpdatedDate(this.healthIndicatorData.updatedDate);

      this.initialise();
    },
    onCategoryExpand(category) {
      category.showCategory = !category.showCategory;
    },
    expandCountryProgress() {
      this.showCountryProgressOverTime = !this.showCountryProgressOverTime;
    },
    initialise() {
      this.healthIndicatorData.categories.forEach((category) => {
        this.$set(category, "showCategory", false);
      });
    },
    generatePDF() {
      if (this.$i18n.locale === "ar") {
        window.print();
      } else {
        generateScorecard({
          healthIndicatorData: this.healthIndicatorData,
          countrySummary: this.countrySummary,
          benchmarkData: this.benchmarkData,
          benchmarkPhase: this.benchmarkPhase,
          hasBenchmarkData: this.hasBenchmarkData,
          i18n: this.$i18n,
          govtApproved: this.govtApproved,
          selectedRegion: this.selectedRegion,
        });
      }
    },
    notifier(props) {
      this.$notify({
        group: "custom-template",
        title: props.title,
        text: props.message,
        type: props.type,
      });
    },
    getBenchmarkData() {
      this.benchmarkData = {};
      this.hasBenchmarkData = true;
      if (this.benchmarkPhase === "") {
        return;
      }
      axios
        .get(
          `/api/bff/countries/${this.$route.params.countryCode}/benchmark/${this.benchmarkPhase}`,
          common.configWithUserLanguageAndNoCacheHeader(
            this.$i18n.locale,
            this.selectedYear,
            this.selectedRegion.regionId
          )
        )
        .then((response) => {
          common.hideLoading();
          this.benchmarkData = response.data;
          if (isEmpty(this.benchmarkData)) {
            this.hasBenchmarkData = false;
            this.notifier({
              title: this.$i18n.t("mixed.noData"),
              message: this.$i18n.t(
                "countryProfile.benchmark.benchmarkNoCountryForSelectedPhase"
              ),
              type: "warn",
            });
          } else {
            this.healthIndicatorData.categories.forEach((category) => {
              this.$set(category, "showCategory", false);
            });
          }
        })
        .catch(() => {
          this.notifier({
            title: this.$i18n.t("mixed.serverErrorTitle"),
            message: this.$i18n.t(
              "countryProfile.benchmark.serverErrorDescription"
            ),
            type: "error",
          });
        });
    },
    countryDataSheetUrl() {
      const yearParam = this.selectedYear ? `&year=${this.selectedYear}` : "";
      return `/api/export_country_data/${this.$route.params.countryCode}?user_language=${this.$i18n.locale}${yearParam}`;
    },
    getLocaleBenchmarkValue(indicatorId) {
      const value =
        this.benchmarkData[indicatorId].benchmarkValue.toLowerCase();
      const formatMapping = {
        at: this.$i18n.t("countryProfile.benchmark.benchmarkValues.atAvg"),
        above: this.$i18n.t(
          "countryProfile.benchmark.benchmarkValues.aboveAvg"
        ),
        below: this.$i18n.t(
          "countryProfile.benchmark.benchmarkValues.belowAvg"
        ),
      };

      return formatMapping[value];
    },
  },
});
</script>

<template>
  <div class="country-detail content-width content-centered">
    <div class="health-indicator-section">
      <div class="header-section">
        <div class="country-name page-title">
          <div
            class="flag"
            :style="{
              backgroundImage:
                'url(' +
                `/static/img/flags/${this.healthIndicatorData?.countryAlpha2Code?.toLowerCase()}.svg` +
                ')',
            }"
          />
          <div
            :class="[
              'country-name-and-date',
              this.healthIndicatorData.countryName.length > 10
                ? 'reduced-font'
                : '',
            ]"
          >
            {{ healthIndicatorData.countryName }}

            <span
              id="collected-date"
              v-if="healthIndicatorData.updatedDate !== ''"
              class="copy-italics"
            >
              {{ updatedDate }}
            </span>
          </div>
        </div>
        <div class="region-section">
          <div class="compare-to-header">
            {{ $t("countryProfile.compareTo") }}
          </div>
          <RegionSelector></RegionSelector>
        </div>

        <div class="header-section-button-container">
          <a :href="countryDataSheetUrl()" class="header-section-button">
            <img
              src="/static/img/downloadFile.svg"
              height="35"
              width="35"
              style="align-self: center"
              loading="lazy"
            />
            <p style="text-align: center">
              {{ $t("countryProfile.exportCountryDataButton") }}
            </p>
          </a>
          <div
            class="header-section-button"
            @click="generatePDF()"
            style="align-self: center"
          >
            <img
              src="/static/img/downloadPDF.svg"
              height="35"
              width="35"
              style="align-self: center"
              loading="lazy"
            />
            <p style="text-align: center">
              {{ $t("countryProfile.downloadScorecard") }}
            </p>
          </div>
        </div>
      </div>
      <div class="box overall-card">
        <div class="overall-info-container">
          <div class="title">
            <div class="sub-header-country-profile">
              {{ $t("countryProfile.overallDigitalHealthPhase") }}
            </div>
            <div class="phase-desc">
              <p>
                {{ $t("countryProfile.overallDigitalHealthPhaseDescription") }}
              </p>
            </div>
          </div>
          <div
            :class="
              'overall-score ' + ' phase' + healthIndicatorData.countryPhase
            "
          >
            {{
              healthIndicatorData.countryPhase
                ? healthIndicatorData.countryPhase
                : "NA"
            }}
          </div>
        </div>
        <div class="country-progress-over-time" @click="expandCountryProgress">
          <p>{{ $t("countryProfile.countryProgressOverTime") }}</p>
          <div
            :class="
              showCountryProgressOverTime
                ? 'progress-accordion-expanded'
                : 'progress-accordion'
            "
          ></div>
        </div>
      </div>
      <div class="comparison-graph-panel" v-show="showCountryProgressOverTime">
        <CountryProgressLineGraphContainer
          :locale="locale"
          :countryName="healthIndicatorData.countryName"
        />
      </div>
      <div class="box overall-card">
        <CountryProfileYearSelector></CountryProfileYearSelector>
      </div>

      <div class="row">
        <div class="column-60percent">
          <div class="legend">
            <div class="government-data">
              <div class="bar" />
              <p>{{ $t("countryProfile.govtData") }}</p>
            </div>
            <div class="non-government-data">
              <div class="bar" />
              <p>{{ $t("countryProfile.nonGovtData") }}</p>
            </div>
          </div>
          <div v-if="healthIndicatorData" class="health-indicators">
            <div
              v-for="(category, index) in healthIndicatorData.categories"
              :key="index"
              class="country-profile-indicator-panel-container-category-section"
            >
              <div class="category-bar box">
                <div
                  :class="
                    category.showCategory ? 'accordion expanded' : 'accordion'
                  "
                  @click="onCategoryExpand(category, index)"
                >
                  <div class="category-name-and-phase-value">
                    <div
                      class="indicator-panel-container-category-name-and-icon sub-header-country-profile"
                    >
                      <CategoryImage
                        :categoryId="category.id"
                        :width="30"
                        :height="30"
                        class="category-image"
                      >
                      </CategoryImage>
                      <p>{{ category.name }}</p>
                    </div>
                    <div
                      :class="
                        category.phase >= 0
                          ? 'category-phase phase' + category.phase
                          : 'category-phase phaseNA'
                      "
                    >
                      {{ category.phase >= 0 ? category.phase : "NA" }}
                    </div>
                  </div>
                </div>
                <div
                  class="category-accordion-content"
                  :style="
                    category.showCategory ? 'display: flex' : 'display:none'
                  "
                >
                  <div
                    v-for="(indicator, index_indicator) in category.indicators"
                    :key="index_indicator"
                    class="indicator"
                  >
                    <div :class="`govt-approved-` + govtApproved"></div>
                    <div class="indicator-details-container">
                      <div class="indicator-id">
                        {{ indicator.code }}
                      </div>
                      <div>
                        <div class="indicator-name-value">
                          {{ indicator.name }}
                        </div>
                        <div class="indicator-description">
                          {{ indicator.indicatorDescription }}
                        </div>
                        <div class="indicator-score-description">
                          {{ indicator.scoreDescription }}
                        </div>
                      </div>
                    </div>
                    <div :class="'score-container ' + locale">
                      <div class="score">
                        <p class="score-benchmark">
                          {{ $t("countryProfile.score") }}
                        </p>
                        <div
                          :class="
                            'indicator-score' + ' phase' + indicator.score
                          "
                        >
                          {{ indicator.score >= 0 ? indicator.score : "NA" }}
                        </div>
                      </div>

                      <div class="separator" />

                      <div class="score">
                        <div
                          v-if="benchmarkData[indicator.id.toString()]"
                          class="score-benchmark-and-average"
                        >
                          <p class="score-benchmark">
                            {{ $t("countryProfile.benchmark.text") }}
                          </p>
                          <p
                            v-if="selectedRegion.regionName == null"
                            class="score-global-average"
                          >
                            {{
                              $t(
                                "countryProfile.benchmark.benchmarkValues.globalAverage"
                              )
                            }}
                          </p>
                          <p v-else class="score-global-average">
                            {{ selectedRegion.regionName }}
                            {{ $t("countryProfile.benchmark.average") }}
                          </p>
                        </div>

                        <div
                          v-if="benchmarkData[indicator.id.toString()]"
                          :class="
                            'indicator-score' +
                            ' phase' +
                            benchmarkData[indicator.id].benchmarkScore
                          "
                        >
                          {{
                            benchmarkData[indicator.id].benchmarkScore != -1
                              ? benchmarkData[indicator.id].benchmarkScore
                              : "NA"
                          }}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="column-40percent">
          <div class="phase-overview box">
            <div class="header-bold">
              {{ $t("countryProfile.phaseOverview") }}
            </div>
            <phase-overview-spider-graph
              v-if="healthIndicatorData.categories && globalData.categories"
              :countryDataCategories="healthIndicatorData.categories"
              :regionalDataCategories="globalData.categories"
              :countryName="healthIndicatorData.countryName"
              :regionName="selectedRegion.regionName"
            />
          </div>
          <div class="health-indicator-container">
            <development-indicators></development-indicators>
          </div>
          <div class="country-summary-container box">
            <country-summary @summaryLoaded="onSummaryLoaded"></country-summary>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss">
@import "country-profile";
</style>
