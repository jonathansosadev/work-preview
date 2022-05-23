<template>
  <section class="old-report-page">
    <!-- If we had any error during asyncData -->
    <template v-if="error">
      <AppText tag="div" type="danger" size="lg" class="old-report-page__error">{{ $t_locale('pages/report/_token')(error) }}</AppText>
    </template>

    <!-- Otherwise, we continue as normal -->
    <template v-else>
      <!-- REPORT HEADER & KPIS -->

      <div class="report-header not-printable">
        <div class="report-header__top">
          <div>
            <img src="/logo/logo-custeed-long.svg" alt="logo" />
          </div>
        </div>
        <div class="report-header__bottom">
          <div>
            <span style="color: black;">
              {{ displayablePeriod }} <br />
              <b style="color: #757575; font-size: 13px;">{{ displayablePeriod2 }}</b>
            </span>
            <Button type="white" class="report-header__bottom__btn-print" onclick="window.print()">
              <span style="font-size: 13px; font-weight: 600;"><i class="icon-gs-printer"></i>&nbsp;&nbsp;{{ $t_locale('pages/report/_token')('headerPrint') }}</span>
            </Button>
          </div>
        </div>
      </div>

      <!-- REPORT CONTENT -->
      <div class="report-container">
        <!-- GARAGES STATS LOOP -->
        <div v-for="(garageStats, index) in garagesStats" :key="index">
          <div class="page-breaker"></div>

          <!-- GARAGE SUMMARY IF MULTIPLE GARAGES -->
          <div class="container-fluid">
            <div style="color: black; margin-top: 20px;">
              <template v-if="garagesStats.length > 0">
                <div class="row">
                  <h2 class="garage-name blue-gs">{{ garageStats.garagePublicDisplayName }}</h2>
                </div>
                <div class="row garage-details">
                  <div class="col-xs-12 garage-details-bloc">
                    <table style="width: 100%;">
                      <tr class="center">
                        <td colspan="5" style="padding-bottom: 20px;">
                          <template v-if="listSubscribedTo(garageStats)">
                            {{ $t_locale('pages/report/_token')('soloGarageSumSubscription') }}
                            <strong class="blue-gs">{{ listSubscribedTo(garagesStats[0]) }}</strong>
                          </template>
                          <template v-if="listNotSubscribedTo(garageStats)">
                            <br />
                            {{ $t_locale('pages/report/_token')('soloGarageSumNotSubscription') }}
                            <strong class="red-gs">{{ listNotSubscribedTo(garagesStats[0]) }}</strong>
                          </template>
                        </td>
                      </tr>
                      <tr style="text-align: center;">
                        <td style="width: 20%;">
                          <i class="icon-gs-chat-bubble icon-size" aria-hidden="true"></i><br />
                          <span v-if="!isVehicleInspection(garageStats.garageType)" class="kpi-subtitle">{{
                            $t_locale('pages/report/_token')('soloGarageSumCountReviews', { count: garageStats.countSurveysResponded })
                          }}</span>
                          <span v-else class="kpi-subtitle">{{
                            $t_locale('pages/report/_token')('soloGarageSumCountReviews', { count: garageStats.countSurveysResponded })
                          }}</span>
                        </td>
                        <td style="width: 20%;">
                          <span><i class="icon-gs-gauge-dashboard icon-size" aria-hidden="true"></i></span>
                          <br />
                          <template
                            v-if="garageStats.countSurveysResponded && !isVehicleInspection(garageStats.garageType)"
                            ><span class="kpi-subtitle">NPS {{ getNPS(garageStats) }}</span></template
                          >
                          <template v-else-if="isVehicleInspection(garageStats.garageType)"
                            ><span class="kpi-subtitle"
                              >NPS {{ getVehicleInspectionNPS(garageStats) }}</span
                            ></template
                          >
                          <template v-else><span class="kpi-subtitle">NPS -</span></template>
                        </td>
                        <td style="width: 20%;">
                          <span><i class="icon-gs-happy icon-size" aria-hidden="true"></i></span>
                          <br />
                          <template v-if="hasSurveysRespondedAndIsNotVI(garageStats)">
                            <span class="kpi-subtitle"
                              >{{ getGarageGlobalScore(garageStats) }}/{{ getRatingBase(garageStats) }}</span
                            ><br />
                          </template>
                          <template v-else-if="isVehicleInspection(garageStats.garageType)">
                            <span class="kpi-subtitle" :class="getGarageGlobalScoreVIColor(garageStats)"
                              >{{ getGarageGlobalScoreVI(garageStats) }}/{{ getRatingBase(garageStats) }}
                            </span>
                            <br />
                          </template>
                          <template v-else
                            >-<span class="kpi-subtitle">-/{{ getRatingBase(garageStats) }}</span></template
                          >
                        </td>
                        <td v-if="!isVehicleInspection(garageStats.garageType)" style="width: 20%;">
                          <span><i class="icon-gs-car-repair icon-size" aria-hidden="true"></i></span>
                          <br />
                          <template v-if="garageStats.countSurveysResponded"
                            ><span class="kpi-subtitle">{{
                              $t_locale('pages/report/_token')('soloGarageSumLeads', { count: leadNumber(garageStats) })
                            }}</span></template
                          >
                          <template v-else
                            ><span class="kpi-subtitle">{{ $t_locale('pages/report/_token')('soloGarageSumLeads', { count: '0' }) }}</span></template
                          >
                        </td>
                        <td style="width: 20%;">
                          <span><i class="icon-gs-sad icon-size" aria-hidden="true"></i></span>
                          <br />
                          <template v-if="garageStats.countSurveysResponded">
                            <span class="kpi-subtitle">{{
                              $t_locale('pages/report/_token')('soloGarageSumUnsatisfied', { count: unSatisfiedNumber(garageStats) })
                            }}</span></template
                          >
                          <template v-else
                            ><span class="kpi-subtitle">{{
                              $t_locale('pages/report/_token')('soloGarageSumUnsatisfied', { count: '0' })
                            }}</span></template
                          >
                        </td>
                      </tr>
                    </table>
                  </div>
                </div>
              </template>
            </div>
          </div>

          <!-- GARAGE LEADS -->
          <template v-if="garageStats.countSurveyLead > 0 && !isVehicleInspection(garageStats.garageType)">
            <div class="container-fluid">
              <div style="padding: 0;">
                <div class="lead-block">
                  <table width="100%">
                    <tr>
                      <td style="width: 80px;">
                        <i class="icon-gs-car-repair printable-gold-gs" aria-hidden="true" style="font-size: 60px; color: #e7b22f;"></i>
                      </td>
                      <td>
                        <div class="lead-title">
                          <span style="font-size: 28px; font-weight: bold; color: #e7b22f;" class="printable-gold-gs">{{
                            renderNumber(garageStats.countSurveyLead)
                          }}</span>
                          <span style="font-size: 28px; font-weight: bold; color: #e7b22f;" class="printable-gold-gs">
                            {{ $t_locale('pages/report/_token')('partLeadLeads') }}</span
                          >
                        </div>
                        <div class="lead-body">
                          <span
                            style="
                              padding-right: 14px;
                              border-right: 1px solid #bcbcbc;
                              color: #757575;
                              font-size: 1rem;
                              font-weight: bold;
                            "
                            class="printable-gold-gs"
                            >{{ leadVnNumber(garageStats) }} {{ $t_locale('pages/report/_token')('partLeadLeadsVn') }}</span
                          >
                          <span
                            style="
                              padding-left: 10px;
                              padding-right: 14px;
                              border-right: 1px solid #bcbcbc;
                              color: #757575;
                              font-size: 1rem;
                              font-weight: bold;
                            "
                            class="printable-gold-gs"
                            >{{ leadVoNumber(garageStats) }} {{ $t_locale('pages/report/_token')('partLeadLeadsVo') }}</span
                          >
                          <span
                            v-if="
                              garageStats.countSurveyLead -
                                leadVnNumber(garageStats) -
                                leadVoNumber(garageStats) >
                              0
                            "
                            style="padding-left: 10px; color: #757575; font-size: 1rem; font-weight: bold;"
                            class="printable-gold-gs"
                          >
                            {{
                              garageStats.countSurveyLead - leadVnNumber(garageStats) - leadVoNumber(garageStats)
                            }}
                            {{ $t_locale('pages/report/_token')('partLeadLeadsUndefined') }}
                          </span>
                        </div>
                      </td>
                    </tr>
                  </table>
                </div>
              </div>
            </div>
            <div class="container-fluid">
              <div style="padding: 0;">
                <table class="table survey-lists printable-survey-list">
                  <tbody>
                    <tr class="spacer-line"></tr>

                    <!-- Vn Details -->
                    <tr
                      v-if="
                        isDisplayableLead(garageStats) &&
                        orderBySurveyUpdatedAt(getLeadVnByGarageStats(garageStats)).length > 0
                      "
                    >
                      <td>
                        <div style="font-size: 18px; font-weight: bold;">
                          {{ $t_locale('pages/report/_token')('partLeadsVn') }}
                        </div>
                      </td>
                    </tr>
                    <tr
                      v-for="(dataRecordStatistic, index) in orderBySurveyUpdatedAt(
                        getLeadVnByGarageStats(garageStats)
                      )"
                      :key="index"
                      v-show="
                        isDisplayableLead(garageStats) &&
                        orderBySurveyUpdatedAt(getLeadVnByGarageStats(garageStats)).length > 0 &&
                        isDisplayableLeadVn(garageStats)
                      "
                      style="border-top: 1px solid lightgrey;"
                    >
                      <td>
                        <div class="row">
                          <div class="col-xs-3" style="padding-right: 0;">
                            <span class="label-text">{{ $t_locale('pages/report/_token')('customer') }}</span>
                            <span class="blue-gs content-text"> {{ dataRecordStatistic.customerFullName }}</span>
                            <br />
                            <span class="label-text">{{ $t_locale('pages/report/_token')('mobile') }}</span>
                            <span v-if="dataRecordStatistic.customerPhone" class="blue-gs content-text">
                              {{ dataRecordStatistic.customerPhone }}</span
                            >
                            <span v-else class="grey-gs"> {{ $t_locale('pages/report/_token')('undefined') }}</span>
                            <br />
                            <span class="label-text">{{ $t_locale('pages/report/_token')('email') }} </span>
                            <a
                              v-if="dataRecordStatistic.customerEmail"
                              :href="`mailto:${dataRecordStatistic.customerEmail}`"
                              class="content-text"
                            >
                              {{ dataRecordStatistic.customerEmail }}</a
                            >
                            <span v-else class="grey-gs"> {{ $t_locale('pages/report/_token')('undefined') }}</span>
                            <br />
                          </div>
                          <div class="col-xs-3" style="padding-right: 0;">
                            <span class="label-text">{{ $t_locale('pages/report/_token')('reviewDate') }} </span>
                            <span v-if="dataRecordStatistic.surveyUpdatedAt" class="blue-gs content-text">
                              {{ formatdate(dataRecordStatistic.surveyUpdatedAt, 'DD/MM/YYYY') }}</span
                            >
                            <span v-else class="grey-gs"> {{ $t_locale('pages/report/_token')('undefined') }}</span>
                            <br />
                            <span class="label-text">{{ $t_locale('pages/report/_token')('currentVehicle') }} </span>
                            <span v-if="dataRecordStatistic.vehiculeMake" class="blue-gs content-text">
                              {{ dataRecordStatistic.vehiculeMake
                              }}<template v-if="dataRecordStatistic.vehiculeRegistrationDate">
                                {{ formatdate(dataRecordStatistic.vehiculeRegistrationDate, 'YYYY') }}</template
                              ></span
                            >
                            <span v-else class="grey-gs"> {{ $t_locale('pages/report/_token')('undefined') }}</span>
                            <br />
                            <span class="label-text">{{ $t_locale('pages/report/_token')('immat') }} </span>
                            <span v-if="dataRecordStatistic.vehiculeRegistrationPlate" class="blue-gs content-text">
                              {{ dataRecordStatistic.vehiculeRegistrationPlate }}</span
                            >
                            <span v-else class="grey-gs"> {{ $t_locale('pages/report/_token')('undefined') }}</span>
                          </div>
                          <div class="col-xs-3" style="padding-right: 0;">
                            <template
                              v-if="
                                dataRecordStatistic.leadTiming ||
                                dataRecordStatistic.leadSaleType ||
                                dataRecordStatistic.leadVehicleModel ||
                                dataRecordStatistic.leadTradeIn !== null
                              "
                            >
                              <span class="label-text">{{ $t_locale('pages/report/_token')('when') }} </span>
                              <span
                                :class="
                                  !dataRecordStatistic.leadTiming ? 'grey-gs' : 'printable-gold-gs gold-gs bold-gs'
                                "
                              >
                                {{ displayLeadTiming(dataRecordStatistic.leadTiming) || $t_locale('pages/report/_token')('undefined') }}</span
                              >
                              <br />
                              <span class="label-text">{{ $t_locale('pages/report/_token')('newOrUsed') }} </span>
                              <span
                                :class="
                                  !dataRecordStatistic.leadSaleType ? 'grey-gs' : 'printable-gold-gs gold-gs bold-gs'
                                "
                              >
                                {{ displayLeadSaleType(dataRecordStatistic.leadSaleType) || $t_locale('pages/report/_token')('undefined') }}</span
                              >
                              <br />
                              <span class="label-text">{{ $t_locale('pages/report/_token')('model') }} </span>
                              <span
                                :class="
                                  dataRecordStatistic.leadKnowVehicle === null
                                    ? 'grey-gs'
                                    : 'printable-gold-gs gold-gs bold-gs'
                                "
                                ><template v-if="dataRecordStatistic.leadKnowVehicle !== null"
                                  ><template v-if="dataRecordStatistic.leadKnowVehicle">
                                    {{ dataRecordStatistic.leadVehicle }}</template
                                  ><template v-else> {{ $t_locale('pages/report/_token')('no') }}</template></template
                                ><template v-else> {{ $t_locale('pages/report/_token')('undefined') }}</template></span
                              >
                              <br />
                              <span class="label-text">{{ $t_locale('pages/report/_token')('tradeInDesired') }} </span>
                              <span
                                :class="
                                  dataRecordStatistic.leadTradeIn ? 'printable-gold-gs gold-gs bold-gs' : 'grey-gs'
                                "
                                ><template v-if="dataRecordStatistic.leadTradeIn">{{
                                  displayLeadTradeIn(dataRecordStatistic.leadTradeIn)
                                }}</template
                                ><template v-else> {{ $t_locale('pages/report/_token')('undefined') }}</template></span
                              >
                              <br />
                            </template>
                            <template v-else>
                              <div class="grey-gs" style="padding-top: 21px;">{{ $t_locale('pages/report/_token')('noInformationOnProject') }}</div>
                            </template>
                          </div>
                          <div class="col-xs-3" style="padding-right: 0;">
                            <template
                              v-if="
                                dataRecordStatistic.leadTiming ||
                                dataRecordStatistic.leadSaleType ||
                                dataRecordStatistic.leadVehicleModel ||
                                dataRecordStatistic.leadTradeIn !== null
                              "
                            >
                              <span class="label-text">{{ $t_locale('pages/report/_token')('make') }} </span>
                              <span
                                :class="
                                  isUndefinedValue(dataRecordStatistic.leadBrands)
                                    ? 'grey-gs'
                                    : 'printable-gold-gs gold-gs bold-gs'
                                "
                                ><template> {{ displayLeadMake(dataRecordStatistic.leadBrands) }}</template></span
                              >
                              <br />
                              <span class="label-text">{{ $t_locale('pages/report/_token')('type') }} </span>
                              <span
                                :class="
                                  isUndefinedValue(dataRecordStatistic.leadBodyType)
                                    ? 'grey-gs'
                                    : 'printable-gold-gs gold-gs bold-gs'
                                "
                                ><template> {{ displayLeadBodyType(dataRecordStatistic.leadBodyType) }}</template></span
                              >
                              <br />
                              <span class="label-text">{{ $t_locale('pages/report/_token')('energy') }} </span>
                              <span
                                :class="
                                  isUndefinedValue(dataRecordStatistic.leadEnergyType)
                                    ? 'grey-gs'
                                    : 'printable-gold-gs gold-gs bold-gs'
                                "
                                ><template>
                                  {{ displayLeadEnergyType(dataRecordStatistic.leadEnergyType) }}</template
                                ></span
                              >
                              <br />
                              <span class="label-text">{{ $t_locale('pages/report/_token')('financing') }} </span>
                              <span
                                :class="
                                  isUndefinedValue(dataRecordStatistic.leadFinancing, false)
                                    ? 'grey-gs'
                                    : 'printable-gold-gs gold-gs bold-gs'
                                "
                                ><template>
                                  {{ displayLeadFinancing(dataRecordStatistic.leadFinancing) }}</template
                                ></span
                              >
                              <br />
                            </template>
                            <template v-else>
                              <div class="grey-gs" style="padding-top: 21px;">{{ $t_locale('pages/report/_token')('noInformationOnProject') }}</div>
                            </template>
                          </div>
                        </div>
                      </td>
                    </tr>
                    <tr
                      v-if="
                        isDisplayableLead(garageStats) &&
                        orderBySurveyUpdatedAt(getLeadVnByGarageStats(garageStats)).length > 0 &&
                        !isDisplayableLeadVn(garageStats)
                      "
                    >
                      <td colspan="5" style="padding-top: 0;">
                        <div>
                          {{ $t_locale('pages/report/_token')('noDetails') }}
                        </div>
                      </td>
                    </tr>
                    <!-- Vo Details -->
                    <tr
                      v-if="
                        isDisplayableLead(garageStats) &&
                        orderBySurveyUpdatedAt(getLeadVoByGarageStats(garageStats)).length > 0
                      "
                    >
                      <td>
                        <div style="font-size: 18px; font-weight: bold;">
                          {{ $t_locale('pages/report/_token')('partLeadsVo') }}
                        </div>
                      </td>
                    </tr>
                    <tr
                      v-for="(dataRecordStatistic, index) in orderBySurveyUpdatedAt(
                        getLeadVoByGarageStats(garageStats)
                      )"
                      :key="index"
                      v-show="
                        isDisplayableLead(garageStats) &&
                        orderBySurveyUpdatedAt(getLeadVoByGarageStats(garageStats)).length > 0 &&
                        isDisplayableLeadVo(garageStats)
                      "
                      style="border-top: 1px solid lightgrey;"
                    >
                      <td>
                        <div class="row">
                          <div class="col-xs-3" style="padding-right: 0;">
                            <span class="label-text">{{ $t_locale('pages/report/_token')('customer') }}</span>
                            <span class="blue-gs content-text"> {{ dataRecordStatistic.customerFullName }}</span>
                            <br />
                            <span class="label-text">{{ $t_locale('pages/report/_token')('mobile') }}</span>
                            <span v-if="dataRecordStatistic.customerPhone" class="blue-gs content-text">
                              {{ dataRecordStatistic.customerPhone }}</span
                            >
                            <span v-else class="grey-gs"> {{ $t_locale('pages/report/_token')('undefined') }}</span>
                            <br />
                            <span class="label-text">{{ $t_locale('pages/report/_token')('email') }} </span>
                            <a
                              v-if="dataRecordStatistic.customerEmail"
                              :href="`mailto:${dataRecordStatistic.customerEmail}`"
                              class="content-text"
                            >
                              {{ dataRecordStatistic.customerEmail }}</a
                            >
                            <span v-else class="grey-gs"> {{ $t_locale('pages/report/_token')('undefined') }}</span>
                            <br />
                          </div>
                          <div class="col-xs-3" style="padding-right: 0;">
                            <span class="label-text">{{ $t_locale('pages/report/_token')('reviewDate') }} </span>
                            <span v-if="dataRecordStatistic.surveyUpdatedAt" class="blue-gs content-text">
                              {{ formatdate(dataRecordStatistic.surveyUpdatedAt, 'DD/MM/YYYY') }}</span
                            >
                            <span v-else class="grey-gs"> {{ $t_locale('pages/report/_token')('undefined') }}</span>
                            <br />
                            <span class="label-text">{{ $t_locale('pages/report/_token')('currentVehicle') }} </span>
                            <span v-if="dataRecordStatistic.vehiculeMake" class="blue-gs content-text">
                              {{ dataRecordStatistic.vehiculeMake
                              }}<template v-if="dataRecordStatistic.vehiculeRegistrationDate">
                                {{ formatdate(dataRecordStatistic.vehiculeRegistrationDate, 'YYYY') }}</template
                              ></span
                            >
                            <span v-else class="grey-gs"> {{ $t_locale('pages/report/_token')('undefined') }}</span>
                            <br />
                            <span class="label-text">{{ $t_locale('pages/report/_token')('immat') }} </span>
                            <span v-if="dataRecordStatistic.vehiculeRegistrationPlate" class="blue-gs content-text">
                              {{ dataRecordStatistic.vehiculeRegistrationPlate }}</span
                            >
                            <span v-else class="grey-gs"> {{ $t_locale('pages/report/_token')('undefined') }}</span>
                          </div>
                          <div class="col-xs-3" style="padding-right: 0;">
                            <template
                              v-if="
                                dataRecordStatistic.leadTiming ||
                                dataRecordStatistic.leadSaleType ||
                                dataRecordStatistic.leadVehicleModel ||
                                dataRecordStatistic.leadTradeIn !== null
                              "
                            >
                              <span class="label-text">{{ $t_locale('pages/report/_token')('when') }} </span>
                              <span
                                :class="
                                  !dataRecordStatistic.leadTiming ? 'grey-gs' : 'printable-gold-gs gold-gs bold-gs'
                                "
                              >
                                {{ displayLeadTiming(dataRecordStatistic.leadTiming) || $t_locale('pages/report/_token')('undefined') }}</span
                              >
                              <br />
                              <span class="label-text">{{ $t_locale('pages/report/_token')('newOrUsed') }} </span>
                              <span
                                :class="
                                  !dataRecordStatistic.leadSaleType ? 'grey-gs' : 'printable-gold-gs gold-gs bold-gs'
                                "
                              >
                                {{ displayLeadSaleType(dataRecordStatistic.leadSaleType) || $t_locale('pages/report/_token')('undefined') }}</span
                              >
                              <br />
                              <span class="label-text">{{ $t_locale('pages/report/_token')('model') }} </span>
                              <span
                                :class="
                                  dataRecordStatistic.leadKnowVehicle === null
                                    ? 'grey-gs'
                                    : 'printable-gold-gs gold-gs bold-gs'
                                "
                                ><template v-if="dataRecordStatistic.leadKnowVehicle !== null"
                                  ><template v-if="dataRecordStatistic.leadKnowVehicle">
                                    {{ dataRecordStatistic.leadVehicle }}</template
                                  ><template v-else> {{ $t_locale('pages/report/_token')('no') }}</template></template
                                ><template v-else> {{ $t_locale('pages/report/_token')('undefined') }}</template></span
                              >
                              <br />
                              <span class="label-text">{{ $t_locale('pages/report/_token')('tradeInDesired') }} </span>
                              <span
                                :class="
                                  dataRecordStatistic.leadTradeIn ? 'printable-gold-gs gold-gs bold-gs' : 'grey-gs'
                                "
                                ><template v-if="dataRecordStatistic.leadTradeIn">{{
                                  displayLeadTradeIn(dataRecordStatistic.leadTradeIn)
                                }}</template
                                ><template v-else> {{ $t_locale('pages/report/_token')('undefined') }}</template></span
                              >
                              <br />
                            </template>
                            <template v-else>
                              <div class="grey-gs" style="padding-top: 21px;">{{ $t_locale('pages/report/_token')('noInformationOnProject') }}</div>
                            </template>
                          </div>
                          <div class="col-xs-3" style="padding-right: 0;">
                            <template
                              v-if="
                                dataRecordStatistic.leadTiming ||
                                dataRecordStatistic.leadSaleType ||
                                dataRecordStatistic.leadVehicleModel ||
                                dataRecordStatistic.leadTradeIn !== null
                              "
                            >
                              <span class="label-text">{{ $t_locale('pages/report/_token')('make') }} </span>
                              <span
                                :class="
                                  isUndefinedValue(dataRecordStatistic.leadBrands)
                                    ? 'grey-gs'
                                    : 'printable-gold-gs gold-gs bold-gs'
                                "
                                ><template> {{ displayLeadMake(dataRecordStatistic.leadBrands) }}</template></span
                              >
                              <br />
                              <span class="label-text">{{ $t_locale('pages/report/_token')('type') }} </span>
                              <span
                                :class="
                                  isUndefinedValue(dataRecordStatistic.leadBodyType)
                                    ? 'grey-gs'
                                    : 'printable-gold-gs gold-gs bold-gs'
                                "
                                ><template> {{ displayLeadBodyType(dataRecordStatistic.leadBodyType) }}</template></span
                              >
                              <br />
                              <span class="label-text">{{ $t_locale('pages/report/_token')('energy') }} </span>
                              <span
                                :class="
                                  isUndefinedValue(dataRecordStatistic.leadEnergyType)
                                    ? 'grey-gs'
                                    : 'printable-gold-gs gold-gs bold-gs'
                                "
                                ><template>
                                  {{ displayLeadEnergyType(dataRecordStatistic.leadEnergyType) }}</template
                                ></span
                              >
                              <br />
                              <span class="label-text">{{ $t_locale('pages/report/_token')('financing') }} </span>
                              <span
                                :class="
                                  isUndefinedValue(dataRecordStatistic.leadFinancing, false)
                                    ? 'grey-gs'
                                    : 'printable-gold-gs gold-gs bold-gs'
                                "
                                ><template>
                                  {{ displayLeadFinancing(dataRecordStatistic.leadFinancing) }}</template
                                ></span
                              >
                              <br />
                            </template>
                            <template v-else>
                              <div class="grey-gs" style="padding-top: 21px;">{{ $t_locale('pages/report/_token')('noInformationOnProject') }}</div>
                            </template>
                          </div>
                        </div>
                      </td>
                    </tr>
                    <tr
                      v-if="
                        isDisplayableLead(garageStats) &&
                        orderBySurveyUpdatedAt(getLeadVoByGarageStats(garageStats)).length > 0 &&
                        !isDisplayableLeadVo(garageStats)
                      "
                    >
                      <td colspan="5" style="padding-top: 0;">
                        <div>
                          {{ $t_locale('pages/report/_token')('noDetails') }}
                        </div>
                      </td>
                    </tr>

                    <!-- Undefined Details -->
                    <tr
                      v-if="
                        isDisplayableLead(garageStats) &&
                        orderBySurveyUpdatedAt(getLeadUndefinedByGarageStats(garageStats)).length > 0
                      "
                    >
                      <td>
                        <div style="font-size: 18px; font-weight: bold;">
                          {{ $t_locale('pages/report/_token')('partLeadsUndefined') }}
                        </div>
                      </td>
                    </tr>
                    <tr
                      v-for="(dataRecordStatistic, index) in orderBySurveyUpdatedAt(
                        getLeadUndefinedByGarageStats(garageStats)
                      )"
                      :key="index"
                      v-show="
                        isDisplayableLead(garageStats) &&
                        orderBySurveyUpdatedAt(getLeadUndefinedByGarageStats(garageStats)).length > 0 &&
                        isDisplayableLeadVn(garageStats)
                      "
                      style="border-top: 1px solid lightgrey;"
                    >
                      <td>
                        <div class="row">
                          <div class="col-xs-3" style="padding-right: 0;">
                            <span class="label-text">{{ $t_locale('pages/report/_token')('customer') }}</span>
                            <span class="blue-gs content-text"> {{ dataRecordStatistic.customerFullName }}</span>
                            <br />
                            <span class="label-text">{{ $t_locale('pages/report/_token')('mobile') }}</span>
                            <span v-if="dataRecordStatistic.customerPhone" class="blue-gs content-text">
                              {{ dataRecordStatistic.customerPhone }}</span
                            >
                            <span v-else class="grey-gs"> {{ $t_locale('pages/report/_token')('undefined') }}</span>
                            <br />
                            <span class="label-text">{{ $t_locale('pages/report/_token')('email') }} </span>
                            <a
                              v-if="dataRecordStatistic.customerEmail"
                              :href="`mailto:${dataRecordStatistic.customerEmail}`"
                              class="content-text"
                            >
                              {{ dataRecordStatistic.customerEmail }}</a
                            >
                            <span v-else class="grey-gs"> {{ $t_locale('pages/report/_token')('undefined') }}</span>
                            <br />
                          </div>
                          <div class="col-xs-3" style="padding-right: 0;">
                            <span class="label-text">{{ $t_locale('pages/report/_token')('reviewDate') }} </span>
                            <span v-if="dataRecordStatistic.surveyUpdatedAt" class="blue-gs content-text">
                              {{ formatdate(dataRecordStatistic.surveyUpdatedAt, 'DD/MM/YYYY') }}</span
                            >
                            <span v-else class="grey-gs"> {{ $t_locale('pages/report/_token')('undefined') }}</span>
                            <br />
                            <span class="label-text">{{ $t_locale('pages/report/_token')('currentVehicle') }} </span>
                            <span v-if="dataRecordStatistic.vehiculeMake" class="blue-gs content-text">
                              {{ dataRecordStatistic.vehiculeMake
                              }}<template v-if="dataRecordStatistic.vehiculeRegistrationDate">
                                {{ formatdate(dataRecordStatistic.vehiculeRegistrationDate, 'YYYY') }}</template
                              ></span
                            >
                            <span v-else class="grey-gs"> {{ $t_locale('pages/report/_token')('undefined') }}</span>
                            <br />
                            <span class="label-text">{{ $t_locale('pages/report/_token')('immat') }} </span>
                            <span v-if="dataRecordStatistic.vehiculeRegistrationPlate" class="blue-gs content-text">
                              {{ dataRecordStatistic.vehiculeRegistrationPlate }}</span
                            >
                            <span v-else class="grey-gs"> {{ $t_locale('pages/report/_token')('undefined') }}</span>
                          </div>
                          <div class="col-xs-3" style="padding-right: 0;">
                            <template
                              v-if="
                                dataRecordStatistic.leadTiming ||
                                dataRecordStatistic.leadSaleType ||
                                dataRecordStatistic.leadVehicleModel ||
                                dataRecordStatistic.leadTradeIn !== null
                              "
                            >
                              <span class="label-text">{{ $t_locale('pages/report/_token')('when') }} </span>
                              <span
                                :class="
                                  !dataRecordStatistic.leadTiming ? 'grey-gs' : 'printable-gold-gs gold-gs bold-gs'
                                "
                              >
                                {{ displayLeadTiming(dataRecordStatistic.leadTiming) || $t_locale('pages/report/_token')('undefined') }}</span
                              >
                              <br />
                              <span class="label-text">{{ $t_locale('pages/report/_token')('newOrUsed') }} </span>
                              <span
                                :class="
                                  !dataRecordStatistic.leadSaleType ? 'grey-gs' : 'printable-gold-gs gold-gs bold-gs'
                                "
                              >
                                {{ displayLeadSaleType(dataRecordStatistic.leadSaleType) || $t_locale('pages/report/_token')('undefined') }}</span
                              >
                              <br />
                              <span class="label-text">{{ $t_locale('pages/report/_token')('model') }} </span>
                              <span
                                :class="
                                  dataRecordStatistic.leadKnowVehicle === null
                                    ? 'grey-gs'
                                    : 'printable-gold-gs gold-gs bold-gs'
                                "
                                ><template v-if="dataRecordStatistic.leadKnowVehicle !== null"
                                  ><template v-if="dataRecordStatistic.leadKnowVehicle">
                                    {{ dataRecordStatistic.leadVehicle }}</template
                                  ><template v-else> {{ $t_locale('pages/report/_token')('no') }}</template></template
                                ><template v-else> {{ $t_locale('pages/report/_token')('undefined') }}</template></span
                              >
                              <br />
                              <span class="label-text">{{ $t_locale('pages/report/_token')('tradeInDesired') }} </span>
                              <span
                                :class="
                                  dataRecordStatistic.leadTradeIn ? 'printable-gold-gs gold-gs bold-gs' : 'grey-gs'
                                "
                                ><template v-if="dataRecordStatistic.leadTradeIn">{{
                                  displayLeadTradeIn(dataRecordStatistic.leadTradeIn)
                                }}</template
                                ><template v-else> {{ $t_locale('pages/report/_token')('undefined') }}</template></span
                              >
                              <br />
                            </template>
                            <template v-else>
                              <div class="grey-gs" style="padding-top: 21px;">{{ $t_locale('pages/report/_token')('noInformationOnProject') }}</div>
                            </template>
                          </div>
                          <div class="col-xs-3" style="padding-right: 0;">
                            <template
                              v-if="
                                dataRecordStatistic.leadTiming ||
                                dataRecordStatistic.leadSaleType ||
                                dataRecordStatistic.leadVehicleModel ||
                                dataRecordStatistic.leadTradeIn !== null
                              "
                            >
                              <span class="label-text">{{ $t_locale('pages/report/_token')('make') }} </span>
                              <span
                                :class="
                                  isUndefinedValue(dataRecordStatistic.leadBrands)
                                    ? 'grey-gs'
                                    : 'printable-gold-gs gold-gs bold-gs'
                                "
                                ><template> {{ displayLeadMake(dataRecordStatistic.leadBrands) }}</template></span
                              >
                              <br />
                              <span class="label-text">{{ $t_locale('pages/report/_token')('type') }} </span>
                              <span
                                :class="
                                  isUndefinedValue(dataRecordStatistic.leadBodyType)
                                    ? 'grey-gs'
                                    : 'printable-gold-gs gold-gs bold-gs'
                                "
                                ><template> {{ displayLeadBodyType(dataRecordStatistic.leadBodyType) }}</template></span
                              >
                              <br />
                              <span class="label-text">{{ $t_locale('pages/report/_token')('energy') }} </span>
                              <span
                                :class="
                                  isUndefinedValue(dataRecordStatistic.leadEnergyType)
                                    ? 'grey-gs'
                                    : 'printable-gold-gs gold-gs bold-gs'
                                "
                                ><template>
                                  {{ displayLeadEnergyType(dataRecordStatistic.leadEnergyType) }}</template
                                ></span
                              >
                              <br />
                              <span class="label-text">{{ $t_locale('pages/report/_token')('financing') }} </span>
                              <span
                                :class="
                                  isUndefinedValue(dataRecordStatistic.leadFinancing, false)
                                    ? 'grey-gs'
                                    : 'printable-gold-gs gold-gs bold-gs'
                                "
                                ><template>
                                  {{ displayLeadFinancing(dataRecordStatistic.leadFinancing) }}</template
                                ></span
                              >
                              <br />
                            </template>
                            <template v-else>
                              <div class="grey-gs" style="padding-top: 21px;">{{ $t_locale('pages/report/_token')('noInformationOnProject') }}</div>
                            </template>
                          </div>
                        </div>
                      </td>
                    </tr>
                    <tr
                      v-if="
                        isDisplayableLead(garageStats) &&
                        orderBySurveyUpdatedAt(getLeadUndefinedByGarageStats(garageStats)).length > 0 &&
                        !isDisplayableLeadVn(garageStats)
                      "
                    >
                      <td colspan="5" style="padding-top: 0;">
                        <div>
                          {{ $t_locale('pages/report/_token')('noDetails') }}
                        </div>
                      </td>
                    </tr>

                    <tr v-if="!isDisplayableLead(garageStats)">
                      <td colspan="5" style="padding-top: 0;">
                        <div>
                          {{ $t_locale('pages/report/_token')('noDetails') }}
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </template>

          <!-- GARAGE SATISFIED -->
          <template v-if="satisfiedViNumber(garageStats) > 0">
            <div class="page-breaker"></div>
            <div class="container-fluid printable-only">
              <div style="color: black; margin-top: 20px; padding: 0;">
                <div v-if="garagesStats.length > 1" class="row">
                  <h2 class="garage-name">{{ garageStats.garagePublicDisplayName }}</h2>
                </div>
              </div>
            </div>
            <div class="container-fluid">
              <div style="padding: 0;">
                <div class="satisfied-block">
                  <table width="100%">
                    <tr>
                      <td style="width: 80px;">
                        <i
                          class="icon-gs-happy printable-green-gs"
                          aria-hidden="true"
                          style="font-size: 60px; color: #00ad6d;"
                        ></i>
                      </td>
                      <td>
                        <div class="satisfied-title">
                          <span
                            style="font-size: 28px; font-weight: bold; color: #00ad6d;"
                            class="printable-green-gs"
                            >{{ satisfiedViNumber(garageStats) }}</span
                          >
                          <span style="font-size: 28px; font-weight: bold; color: #00ad6d;" class="printable-green-gs">
                            {{ $t_locale('pages/report/_token')('satisfied') }}
                            {{
                              satisfiedViNumber(garageStats) > 0 ? ` (${satisfiedViPercent(garageStats)}%)` : ''
                            }}</span
                          >
                        </div>
                      </td>
                    </tr>
                  </table>
                </div>
              </div>
            </div>
            <div class="container-fluid">
              <div style="padding: 0;">
                <table class="table survey-lists printable-survey-list">
                  <tbody>
                    <tr class="spacer-line"></tr>

                    <!-- VEHICLE INSPECTION -->
                    <tr
                      v-for="(dataRecordStatistic, index) in orderBySurveyUpdatedAt(
                        filterVi(garageStats.surveysSatisfied)
                      )"
                      :key="index"
                      v-show="
                        isVehicleInspection(garageStats.garageType) &&
                        isDisplayableUnsatisfiedVi(garageStats, report)
                      "
                      style="border-top: 1px solid lightgrey;"
                      class="satisfied-line"
                    >
                      <td>
                        <div class="row">
                          <div class="col-xs-4">
                            <span class="label-text">{{ $t_locale('pages/report/_token')('customer') }} </span>
                            <span class="blue-gs content-text">{{ dataRecordStatistic.customerFullName }}</span>
                            <br />
                            <span class="label-text">{{ $t_locale('pages/report/_token')('providedDate') }} </span>
                            <span class="blue-gs content-text">{{
                              formatdate(dataRecordStatistic.completedAt, 'DD/MM/YYYY')
                            }}</span
                            ><br />
                            <span
                              class="label-text"
                              v-if="
                                dataRecordStatistic.vehicleMakePublicDisplayName ||
                                dataRecordStatistic.vehicleModelPublicDisplayName
                              "
                              >{{ $t_locale('pages/report/_token')('vehicle') }}
                            </span>
                            <span
                              v-if="
                                dataRecordStatistic.vehicleMakePublicDisplayName ||
                                dataRecordStatistic.vehicleModelPublicDisplayName
                              "
                              class="blue-gs content-text"
                              >{{ dataRecordStatistic.vehicleMakePublicDisplayName
                              }}{{
                                dataRecordStatistic.vehicleMakePublicDisplayName &&
                                dataRecordStatistic.vehicleModelPublicDisplayName
                                  ? ' / '
                                  : ''
                              }}{{ dataRecordStatistic.vehicleModelPublicDisplayName }}</span
                            >
                            <br />
                          </div>
                          <div class="col-xs-4">
                            <span class="label-text">{{ $t_locale('pages/report/_token')('score') }} </span
                            ><span
                              class="bold-gs content-text"
                              :class="{
                                'green-gs': dataRecordStatistic.surveyScore / 2 >= 4.5,
                                'orange-gs': dataRecordStatistic.surveyScore / 2 < 4.5,
                              }"
                              >{{ frenchDecimal(dataRecordStatistic.surveyScore / 2) }}</span
                            >
                            <span
                              v-if="frenchDecimal(dataRecordStatistic.surveyScore / 2)"
                              style="font-size: 9px;"
                              class="bold-gs"
                              :class="{
                                'green-gs': dataRecordStatistic.surveyScore / 2 >= 4.5,
                                'orange-gs': dataRecordStatistic.surveyScore / 2 < 4.5,
                              }"
                              >/5</span
                            >
                            <span v-else> - </span>
                            <br />
                          </div>
                        </div>
                        <div class="row" style="padding-top: 10px;">
                          <div class="col-xs-12">
                            <span class="label-text">{{ $t_locale('pages/report/_token')('comment') }} </span>
                            <span
                              v-if="dataRecordStatistic.surveyComment"
                              class="blue-gs"
                              :class="{
                                'content-text-green': dataRecordStatistic.surveyScore / 2 >= 4.5,
                                'content-text-orange': dataRecordStatistic.surveyScore / 2 < 4.5,
                              }"
                              >{{ dataRecordStatistic.surveyComment }}</span
                            >
                            <span v-else class="grey-gs">{{ $t_locale('pages/report/_token')('undefined') }}</span>
                          </div>
                        </div>
                      </td>
                    </tr>
                    <tr
                      v-if="
                        isVehicleInspection(garageStats.garageType) &&
                        orderBySurveyUpdatedAt(filterVi(garageStats.surveysUnsatisfied)).length > 0 &&
                        !isDisplayableUnsatisfiedVi(garageStats, report)
                      "
                    >
                      <td colspan="5" style="padding-top: 0;">
                        <div>
                          {{ $t_locale('pages/report/_token')('noDetails') }}
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </template>

          <!-- GARAGE UNSATISFIED -->
          <template v-if="unSatisfiedNumber(garageStats) > 0">
            <div class="page-breaker"></div>
            <div class="container-fluid printable-only">
              <div style="color: black; margin-top: 20px; padding: 0;">
                <div v-if="garagesStats.length > 1" class="row">
                  <h2 class="garage-name">{{ garageStats.garagePublicDisplayName }}</h2>
                </div>
              </div>
            </div>
            <div class="container-fluid">
              <div style="padding: 0;">
                <div class="unsatisfied-block">
                  <table width="100%">
                    <tr>
                      <td style="width: 80px;">
                        <i
                          class="icon-gs-sad printable-red-gs"
                          aria-hidden="true"
                          style="font-size: 60px; color: #d04331;"
                        ></i>
                      </td>
                      <td>
                        <div class="unsatisfied-title">
                          <span style="font-size: 28px; font-weight: bold; color: #d04331;" class="printable-red-gs">{{
                            unSatisfiedNumber(garageStats)
                          }}</span>
                          <span
                            v-if="isVehicleInspection(garageStats.garageType)"
                            style="font-size: 28px; font-weight: bold; color: #d04331;"
                            class="printable-red-gs"
                          >
                            {{ $t_locale('pages/report/_token')('unsatisfied') }}
                            {{
                              unSatisfiedNumber(garageStats) > 0 ? ` (${unSatisfiedViPercent(garageStats)}%)` : ''
                            }}</span
                          >
                          <span
                            v-else
                            style="font-size: 28px; font-weight: bold; color: #d04331;"
                            class="printable-red-gs"
                          >
                            {{ $t_locale('pages/report/_token')('unsatisfied') }}
                            {{
                              unSatisfiedNumber(garageStats) > 0 ? ` (${unSatisfiedPercent(garageStats)}%)` : ''
                            }}</span
                          >
                        </div>
                        <div class="unsatisfied-body">
                          <span
                            v-if="!isVehicleInspection(garageStats.garageType)"
                            style="
                              padding-right: 14px;
                              border-right: 1px solid #bcbcbc;
                              color: #757575;
                              font-size: 1rem;
                              font-weight: bold;
                            "
                            class="printable-red-gs"
                            >{{ unSatisfiedApvNumber(garageStats) }} {{ $t_locale('pages/report/_token')('maintenance') }}
                            {{
                              unSatisfiedNumber(garageStats) > 0 ? ` (${unSatisfiedApvPercent(garageStats)}%)` : ''
                            }}</span
                          >
                          <span
                            v-if="!isVehicleInspection(garageStats.garageType)"
                            style="
                              padding-left: 10px;
                              padding-right: 10px;
                              border-right: 1px solid #bcbcbc;
                              color: #757575;
                              font-size: 1rem;
                              font-weight: bold;
                            "
                            class="printable-red-gs"
                            >{{ unSatisfiedVnNumber(garageStats) }} {{ $t_locale('pages/report/_token')('saleNew') }}
                            {{
                              unSatisfiedVnNumber(garageStats) > 0 ? ` (${unSatisfiedVnPercent(garageStats)}%)` : ''
                            }}</span
                          >
                          <span
                            v-if="!isVehicleInspection(garageStats.garageType)"
                            style="padding-left: 14px; color: #757575; font-size: 1rem; font-weight: bold;"
                            class="printable-red-gs"
                            >{{ unSatisfiedVoNumber(garageStats) }} {{ $t_locale('pages/report/_token')('saleUsed') }}
                            {{
                              unSatisfiedVoNumber(garageStats) > 0 ? ` (${unSatisfiedVoPercent(garageStats)}%)` : ''
                            }}</span
                          >
                        </div>
                      </td>
                    </tr>
                  </table>
                </div>
              </div>
            </div>
            <div class="container-fluid">
              <div style="padding: 0;">
                <table class="table survey-lists printable-survey-list">
                  <tbody>
                    <tr class="spacer-line"></tr>

                    <!-- APV -->
                    <tr
                      v-if="
                        !isVehicleInspection(garageStats.garageType) &&
                        orderBySurveyUpdatedAt(filterApv(garageStats.surveysUnsatisfied)).length > 0
                      "
                    >
                      <td>
                        <div style="font-size: 18px; font-weight: bold;">
                          {{ $t_locale('pages/report/_token')('unsatisfiedMaintenance') }}
                        </div>
                      </td>
                    </tr>
                    <tr
                      v-for="(dataRecordStatistic, index) in orderBySurveyUpdatedAt(
                        filterApv(garageStats.surveysUnsatisfied)
                      )"
                      :key="index"
                      v-show="
                        !isVehicleInspection(garageStats.garageType) &&
                        isDisplayableUnsatisfiedApv(garageStats, report)
                      "
                      style="border-top: 1px solid lightgrey;"
                      class="unsatisfied-line"
                    >
                      <td>
                        <div class="row">
                          <div class="col-xs-4">
                            <span class="label-text">{{ $t_locale('pages/report/_token')('customer') }} </span>
                            <span class="blue-gs content-text">{{ dataRecordStatistic.customerFullName }}</span>
                            <br />
                            <span class="label-text">{{ $t_locale('pages/report/_token')('providedDate') }} </span>
                            <span class="blue-gs content-text">{{
                              formatdate(dataRecordStatistic.completedAt, 'DD/MM/YYYY')
                            }}</span
                            ><br />
                            <span
                              class="label-text"
                              v-if="
                                dataRecordStatistic.vehicleMakePublicDisplayName ||
                                dataRecordStatistic.vehicleModelPublicDisplayName
                              "
                              >{{ $t_locale('pages/report/_token')('vehicle') }}
                            </span>
                            <span
                              v-if="
                                dataRecordStatistic.vehicleMakePublicDisplayName ||
                                dataRecordStatistic.vehicleModelPublicDisplayName
                              "
                              class="blue-gs content-text"
                              >{{ dataRecordStatistic.vehicleMakePublicDisplayName
                              }}{{
                                dataRecordStatistic.vehicleMakePublicDisplayName &&
                                dataRecordStatistic.vehicleModelPublicDisplayName
                                  ? ' / '
                                  : ''
                              }}{{ dataRecordStatistic.vehicleModelPublicDisplayName }}</span
                            >
                            <br />
                          </div>
                          <div class="col-xs-4">
                            <span class="label-text">{{ $t_locale('pages/report/_token')('service') }} </span
                            ><span class="blue-gs content-text">{{ getPrestaType(dataRecordStatistic) }}</span
                            ><br />
                            <span class="label-text">{{ $t_locale('pages/report/_token')('score') }} </span
                            ><span class="red-gs bold-gs">{{ frenchDecimal(dataRecordStatistic.surveyScore) }}</span>
                            <span
                              v-if="frenchDecimal(dataRecordStatistic.surveyScore)"
                              style="font-size: 9px;"
                              class="red-gs bold-gs"
                              >/10</span
                            >
                            <span v-else> - </span>
                            <br />
                          </div>
                          <div class="col-xs-4">
                            <span class="label-text">{{ $t_locale('pages/report/_token')('publication') }} </span
                            ><span class="blue-gs content-text">{{ getReviewTitle(dataRecordStatistic) }}</span
                            ><br />
                            <span class="label-text">{{ $t_locale('pages/report/_token')('answer') }} </span
                            ><span class="blue-gs content-text">{{ getReviewCommentTitle(dataRecordStatistic) }}</span
                            ><br />
                            <span v-if="displayFollowup(dataRecordStatistic)">
                              <span class="label-text">{{ $t_locale('pages/report/_token')('followup') }}</span
                              >&nbsp;<span class="blue-gs content-text">{{
                                getFollowUpTitle(dataRecordStatistic)
                              }}</span
                              ><br />
                            </span>
                            <span class="label-text">{{ $t_locale('pages/report/_token')('leadProject') }} </span>
                            <span class="blue-gs content-text">{{
                              dataRecordStatistic.surveyLeadType ? $t_locale('pages/report/_token')('yes') : $t_locale('pages/report/_token')('no')
                            }}</span>
                            <br />
                          </div>
                        </div>
                        <div class="row" style="padding-top: 10px;">
                          <div class="col-xs-12">
                            <span class="label-text">{{ $t_locale('pages/report/_token')('comment') }} </span>
                            <span v-if="dataRecordStatistic.surveyComment" class="blue-gs content-text-red">{{
                              dataRecordStatistic.surveyComment
                            }}</span>
                            <span v-else class="grey-gs">{{ $t_locale('pages/report/_token')('undefined') }}</span>
                          </div>
                        </div>
                      </td>
                    </tr>
                    <tr
                      v-if="
                        !isVehicleInspection(garageStats.garageType) &&
                        orderBySurveyUpdatedAt(filterApv(garageStats.surveysUnsatisfied)).length > 0 &&
                        !isDisplayableUnsatisfiedApv(garageStats, report)
                      "
                    >
                      <td colspan="5" style="padding-top: 0;">
                        <div>
                          {{ $t_locale('pages/report/_token')('noDetails') }}
                        </div>
                      </td>
                    </tr>

                    <!-- VN -->
                    <tr
                      v-if="
                        !isVehicleInspection(garageStats.garageType) &&
                        orderBySurveyUpdatedAt(filterVn(garageStats.surveysUnsatisfied)).length > 0
                      "
                    >
                      <td>
                        <div style="font-size: 18px; font-weight: bold;">
                          {{ $t_locale('pages/report/_token')('unsatisfiedVn') }}
                        </div>
                      </td>
                    </tr>
                    <tr
                      v-for="(dataRecordStatistic, index) in orderBySurveyUpdatedAt(
                        filterVn(garageStats.surveysUnsatisfied)
                      )"
                      :key="index"
                      v-show="
                        !isVehicleInspection(garageStats.garageType) &&
                        isDisplayableUnsatisfiedVn(garageStats, report)
                      "
                      style="border-top: 1px solid lightgrey;"
                      class="unsatisfied-line"
                    >
                      <td>
                        <div class="row">
                          <div class="col-xs-4">
                            <span class="label-text">{{ $t_locale('pages/report/_token')('customer') }} </span>
                            <span class="blue-gs content-text">{{ dataRecordStatistic.customerFullName }}</span>
                            <br />
                            <span class="label-text">{{ $t_locale('pages/report/_token')('providedDate') }} </span>
                            <span class="blue-gs content-text">{{
                              formatdate(dataRecordStatistic.completedAt, 'DD/MM/YYYY')
                            }}</span
                            ><br />
                            <span
                              class="label-text"
                              v-if="
                                dataRecordStatistic.vehicleMakePublicDisplayName ||
                                dataRecordStatistic.vehicleModelPublicDisplayName
                              "
                              >{{ $t_locale('pages/report/_token')('vehicle') }}
                            </span>
                            <span
                              v-if="
                                dataRecordStatistic.vehicleMakePublicDisplayName ||
                                dataRecordStatistic.vehicleModelPublicDisplayName
                              "
                              class="blue-gs content-text"
                              >{{ dataRecordStatistic.vehicleMakePublicDisplayName
                              }}{{
                                dataRecordStatistic.vehicleMakePublicDisplayName &&
                                dataRecordStatistic.vehicleModelPublicDisplayName
                                  ? ' / '
                                  : ''
                              }}{{ dataRecordStatistic.vehicleModelPublicDisplayName }}</span
                            >
                            <br />
                          </div>
                          <div class="col-xs-4">
                            <span class="label-text">{{ $t_locale('pages/report/_token')('service') }} </span
                            ><span class="blue-gs content-text">{{ getPrestaType(dataRecordStatistic) }}</span
                            ><br />
                            <span class="label-text">{{ $t_locale('pages/report/_token')('score') }} </span
                            ><span class="red-gs bold-gs">{{ frenchDecimal(dataRecordStatistic.surveyScore) }}</span>
                            <span
                              v-if="frenchDecimal(dataRecordStatistic.surveyScore)"
                              style="font-size: 9px;"
                              class="red-gs bold-gs"
                              >/10</span
                            >
                            <span v-else> - </span>
                            <br />
                          </div>
                          <div class="col-xs-4">
                            <span class="label-text">{{ $t_locale('pages/report/_token')('publication') }} </span
                            ><span class="blue-gs content-text">{{ getReviewTitle(dataRecordStatistic) }}</span
                            ><br />
                            <span class="label-text">{{ $t_locale('pages/report/_token')('answer') }} </span
                            ><span class="blue-gs content-text">{{ getReviewCommentTitle(dataRecordStatistic) }}</span
                            ><br />
                            <span class="label-text" v-if="displayFollowup(dataRecordStatistic)">{{
                              $t_locale('pages/report/_token')('followup')
                            }}</span
                            ><span class="blue-gs content-text">{{ getFollowUpTitle(dataRecordStatistic) }}</span
                            ><br />
                            <span class="label-text">{{ $t_locale('pages/report/_token')('leadProject') }} </span>
                            <span class="blue-gs content-text">{{
                              dataRecordStatistic.surveyLeadType ? $t_locale('pages/report/_token')('yes') : $t_locale('pages/report/_token')('no')
                            }}</span>
                            <br />
                          </div>
                        </div>
                        <div class="row" style="padding-top: 10px;">
                          <div class="col-xs-12">
                            <span class="label-text">{{ $t_locale('pages/report/_token')('comment') }} </span>
                            <span v-if="dataRecordStatistic.surveyComment" class="blue-gs content-text-red">{{
                              dataRecordStatistic.surveyComment
                            }}</span>
                            <span v-else class="grey-gs">{{ $t_locale('pages/report/_token')('undefined') }}</span>
                          </div>
                        </div>
                      </td>
                    </tr>
                    <tr
                      v-if="
                        !isVehicleInspection(garageStats.garageType) &&
                        orderBySurveyUpdatedAt(filterVn(garageStats.surveysUnsatisfied)).length > 0 &&
                        !isDisplayableUnsatisfiedVn(garageStats, report)
                      "
                    >
                      <td colspan="5" style="padding-top: 0;">
                        <div>
                          {{ $t_locale('pages/report/_token')('noDetails') }}
                        </div>
                      </td>
                    </tr>

                    <!-- VO -->
                    <tr
                      v-if="
                        !isVehicleInspection(garageStats.garageType) &&
                        orderBySurveyUpdatedAt(filterVo(garageStats.surveysUnsatisfied)).length > 0
                      "
                    >
                      <td>
                        <div style="font-size: 18px; font-weight: bold;">
                          {{ $t_locale('pages/report/_token')('unsatisfiedVo') }}
                        </div>
                      </td>
                    </tr>
                    <tr
                      v-for="(dataRecordStatistic, index) in orderBySurveyUpdatedAt(
                        filterVo(garageStats.surveysUnsatisfied)
                      )"
                      :key="index"
                      v-show="
                        !isVehicleInspection(garageStats.garageType) &&
                        isDisplayableUnsatisfiedVo(garageStats, report)
                      "
                      style="border-top: 1px solid lightgrey;"
                      class="unsatisfied-line"
                    >
                      <td>
                        <div class="row">
                          <div class="col-xs-4">
                            <span class="label-text">{{ $t_locale('pages/report/_token')('customer') }} </span>
                            <span class="blue-gs content-text">{{ dataRecordStatistic.customerFullName }}</span>
                            <br />
                            <span class="label-text">{{ $t_locale('pages/report/_token')('providedDate') }} </span>
                            <span class="blue-gs content-text">{{
                              formatdate(dataRecordStatistic.completedAt, 'DD/MM/YYYY')
                            }}</span
                            ><br />
                            <span
                              class="label-text"
                              v-if="
                                dataRecordStatistic.vehicleMakePublicDisplayName ||
                                dataRecordStatistic.vehicleModelPublicDisplayName
                              "
                              >{{ $t_locale('pages/report/_token')('vehicle') }}
                            </span>
                            <span
                              v-if="
                                dataRecordStatistic.vehicleMakePublicDisplayName ||
                                dataRecordStatistic.vehicleModelPublicDisplayName
                              "
                              class="blue-gs content-text"
                              >{{ dataRecordStatistic.vehicleMakePublicDisplayName
                              }}{{
                                dataRecordStatistic.vehicleMakePublicDisplayName &&
                                dataRecordStatistic.vehicleModelPublicDisplayName
                                  ? ' / '
                                  : ''
                              }}{{ dataRecordStatistic.vehicleModelPublicDisplayName }}</span
                            >
                            <br />
                          </div>
                          <div class="col-xs-4">
                            <span class="label-text">{{ $t_locale('pages/report/_token')('service') }} </span
                            ><span class="blue-gs content-text">{{ getPrestaType(dataRecordStatistic) }}</span
                            ><br />
                            <span class="label-text">{{ $t_locale('pages/report/_token')('score') }} </span
                            ><span class="red-gs bold-gs">{{ frenchDecimal(dataRecordStatistic.surveyScore) }}</span>
                            <span
                              v-if="frenchDecimal(dataRecordStatistic.surveyScore)"
                              style="font-size: 9px;"
                              class="red-gs bold-gs"
                              >/10</span
                            >
                            <span v-else> - </span>
                            <br />
                          </div>
                          <div class="col-xs-4">
                            <span class="label-text">{{ $t_locale('pages/report/_token')('publication') }} </span
                            ><span class="blue-gs content-text">{{ getReviewTitle(dataRecordStatistic) }}</span
                            ><br />
                            <span class="label-text">{{ $t_locale('pages/report/_token')('answer') }} </span
                            ><span class="blue-gs content-text">{{ getReviewCommentTitle(dataRecordStatistic) }}</span
                            ><br />
                            <span v-if="displayFollowup(dataRecordStatistic)">{{ $t_locale('pages/report/_token')('followup') }}</span
                            ><span class="blue-gs content-text">{{ getFollowUpTitle(dataRecordStatistic) }}</span
                            ><br />
                            <span class="label-text">{{ $t_locale('pages/report/_token')('leadProject') }} </span>
                            <span class="blue-gs content-text">{{
                              dataRecordStatistic.surveyLeadType ? $t_locale('pages/report/_token')('yes') : $t_locale('pages/report/_token')('no')
                            }}</span>
                            <br />
                          </div>
                        </div>
                        <div class="row" style="padding-top: 10px;">
                          <div class="col-xs-12">
                            <span class="label-text">{{ $t_locale('pages/report/_token')('comment') }} </span>
                            <span v-if="dataRecordStatistic.surveyComment" class="blue-gs content-text-red">{{
                              dataRecordStatistic.surveyComment
                            }}</span>
                            <span v-else class="grey-gs">{{ $t_locale('pages/report/_token')('undefined') }}</span>
                          </div>
                        </div>
                      </td>
                    </tr>
                    <tr
                      v-if="
                        !isVehicleInspection(garageStats.garageType) &&
                        orderBySurveyUpdatedAt(filterVo(garageStats.surveysUnsatisfied)).length > 0 &&
                        !isDisplayableUnsatisfiedVo(garageStats, report)
                      "
                    >
                      <td colspan="5" style="padding-top: 0;">
                        <div>
                          {{ $t_locale('pages/report/_token')('noDetails') }}
                        </div>
                      </td>
                    </tr>

                    <!-- VEHICLE INSPECTION -->
                    <tr
                      v-for="(dataRecordStatistic, index) in orderBySurveyUpdatedAt(
                        filterVi(garageStats.surveysUnsatisfied)
                      )"
                      :key="index"
                      v-show="
                        isVehicleInspection(garageStats.garageType) &&
                        isDisplayableUnsatisfiedVi(garageStats, report)
                      "
                      style="border-top: 1px solid lightgrey;"
                      class="unsatisfied-line"
                    >
                      <td>
                        <div class="row">
                          <div class="col-xs-4">
                            <span class="label-text">{{ $t_locale('pages/report/_token')('customer') }} </span>
                            <span class="blue-gs content-text">{{ dataRecordStatistic.customerFullName }}</span>
                            <br />
                            <span class="label-text">{{ $t_locale('pages/report/_token')('providedDate') }} </span>
                            <span class="blue-gs content-text">{{
                              formatdate(dataRecordStatistic.completedAt, 'DD/MM/YYYY')
                            }}</span
                            ><br />
                            <span
                              class="label-text"
                              v-if="
                                dataRecordStatistic.vehicleMakePublicDisplayName ||
                                dataRecordStatistic.vehicleModelPublicDisplayName
                              "
                              >{{ $t_locale('pages/report/_token')('vehicle') }}
                            </span>
                            <span
                              v-if="
                                dataRecordStatistic.vehicleMakePublicDisplayName ||
                                dataRecordStatistic.vehicleModelPublicDisplayName
                              "
                              class="blue-gs content-text"
                              >{{ dataRecordStatistic.vehicleMakePublicDisplayName
                              }}{{
                                dataRecordStatistic.vehicleMakePublicDisplayName &&
                                dataRecordStatistic.vehicleModelPublicDisplayName
                                  ? ' / '
                                  : ''
                              }}{{ dataRecordStatistic.vehicleModelPublicDisplayName }}</span
                            >
                            <br />
                          </div>
                          <div class="col-xs-4">
                            <span class="label-text">{{ $t_locale('pages/report/_token')('score') }} </span
                            ><span class="red-gs bold-gs content-text">{{
                              frenchDecimal(dataRecordStatistic.surveyScore / 2)
                            }}</span>
                            <span
                              v-if="frenchDecimal(dataRecordStatistic.surveyScore / 2)"
                              style="font-size: 9px;"
                              class="red-gs bold-gs"
                              >/5</span
                            >
                            <span v-else> - </span>
                            <br />
                          </div>
                        </div>
                        <div class="row" style="padding-top: 10px;">
                          <div class="col-xs-12">
                            <span class="label-text">{{ $t_locale('pages/report/_token')('comment') }} </span>
                            <span v-if="dataRecordStatistic.surveyComment" class="blue-gs content-text-red">{{
                              dataRecordStatistic.surveyComment
                            }}</span>
                            <span v-else class="grey-gs">{{ $t_locale('pages/report/_token')('undefined') }}</span>
                          </div>
                        </div>
                      </td>
                    </tr>
                    <tr
                      v-if="
                        isVehicleInspection(garageStats.garageType) &&
                        orderBySurveyUpdatedAt(filterVi(garageStats.surveysUnsatisfied)).length > 0 &&
                        !isDisplayableUnsatisfiedVi(garageStats, report)
                      "
                    >
                      <td colspan="5" style="padding-top: 0;">
                        <div>
                          {{ $t_locale('pages/report/_token')('noDetails') }}
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </template>

          <!-- GARAGE FollowupUnsatisfied  -->
          <template
            v-if="isDisplayableUnsatisfied(garageStats, report) && unSatisfiedFollowupNumber(garageStats) > 0"
          >
            <div class="page-breaker"></div>
            <div class="container-fluid printable-only">
              <div style="color: black; margin-top: 20px; padding: 0;">
                <div v-if="garagesStats.length > 1" class="row">
                  <h2 class="garage-name">{{ garageStats.garagePublicDisplayName }}</h2>
                </div>
              </div>
            </div>
            <div class="container-fluid">
              <div style="padding: 0;">
                <div class="unsatisfied-block">
                  <table width="100%">
                    <tr>
                      <td style="width: 80px;">
                        <i
                          class="icon-gs-alert-warning-circle printable-red-gs"
                          aria-hidden="true"
                          style="font-size: 60px; color: #d04331;"
                        ></i>
                      </td>
                      <td>
                        <div class="unsatisfied-title">
                          <span class="printable-red-gs" style="font-size: 28px; font-weight: bold; color: #d04331;">{{
                            $t_locale('pages/report/_token')('unsatisfiedFollowup')
                          }}</span>
                        </div>
                        <div class="unsatisfied-body">
                          <span
                            style="
                              padding-right: 10px;
                              border-right: 1px solid #bcbcbc;
                              color: #757575;
                              font-size: 1rem;
                              font-weight: bold;
                            "
                            class="printable-red-gs"
                          >
                            {{ unSatisfiedFollowupNumberNotContacted(garageStats) }} {{ $t_locale('pages/report/_token')('customersNotContacted') }}
                          </span>
                          <span
                            style="padding-left: 10px; color: #757575; font-size: 1rem; font-weight: bold;"
                            class="printable-red-gs"
                          >
                            {{ unSatisfiedFollowupNumberNotResolved(garageStats) }} {{ $t_locale('pages/report/_token')('problemsNotResolved') }}
                          </span>
                        </div>
                      </td>
                    </tr>
                  </table>
                </div>
              </div>
            </div>
            <div class="container-fluid">
              <div style="padding: 0;">
                <table class="table survey-lists printable-survey-list">
                  <tbody>
                    <tr class="spacer-line"></tr>
                    <div v-for="type in ['Maintenance', 'vn', 'vo', 'NewVehicleSale', 'UsedVehicleSale']" :key="type">
                      <tr
                        v-if="
                          getUnSatisfiedFollowupNotContacted(garageStats, type).length > 0 &&
                          isDisplayableUnsatisfiedByType(garageStats, report, type)
                        "
                      >
                        <td>
                          <div style="font-size: 18px; font-weight: bold;">
                            {{ $t_locale('pages/report/_token')('customersNotContactedType', { type: formatType(type) }) }} :
                          </div>
                        </td>
                      </tr>
                      <tr
                        v-for="(dataRecordStatistic, index) in orderBySurveyUpdatedAt(
                          getUnSatisfiedFollowupNotContacted(garageStats, type)
                        )"
                        :key="index"
                        v-show="isDisplayableUnsatisfiedByType(garageStats, report, type)"
                        style="border-top: 1px solid lightgrey;"
                        class="unsatisfied-line"
                      >
                        <td>
                          <div class="row">
                            <div class="col-xs-4">
                              <span class="label-text">{{ $t_locale('pages/report/_token')('customer') }} </span>
                              <span class="blue-gs content-text">{{ dataRecordStatistic.customerFullName }}</span>
                              <br />
                              <span class="label-text">{{ $t_locale('pages/report/_token')('providedDate') }} </span>
                              <span class="blue-gs content-text">{{
                                formatdate(dataRecordStatistic.completedAt, 'DD/MM/YYYY')
                              }}</span>
                              <br />
                              <span
                                class="label-text"
                                v-if="
                                  dataRecordStatistic.garageProvidedFrontDeskUserName !== 'UNDEFINED' &&
                                  dataRecordStatistic.garageProvidedFrontDeskUserName
                                "
                                >{{ $t_locale('pages/report/_token')('handler') }}
                              </span>
                              <span
                                v-if="
                                  dataRecordStatistic.garageProvidedFrontDeskUserName !== 'UNDEFINED' &&
                                  dataRecordStatistic.garageProvidedFrontDeskUserName
                                "
                                class="blue-gs content-text"
                                >{{ dataRecordStatistic.garageProvidedFrontDeskUserName }}</span
                              >
                              <br
                                v-if="
                                  dataRecordStatistic.garageProvidedFrontDeskUserName !== 'UNDEFINED' &&
                                  dataRecordStatistic.garageProvidedFrontDeskUserName
                                "
                              />
                            </div>
                            <div class="col-xs-4">
                              <span class="label-text">{{ $t_locale('pages/report/_token')('service') }} </span>
                              <span class="blue-gs content-text">{{ getPrestaType(dataRecordStatistic) }}</span>
                              <br />
                              <span class="label-text" v-if="dataRecordStatistic.surveyUpdatedAt"
                                >{{ $t_locale('pages/report/_token')('reviewDate') }}
                              </span>
                              <span v-if="dataRecordStatistic.surveyUpdatedAt" class="blue-gs content-text">{{
                                formatdate(dataRecordStatistic.surveyUpdatedAt, 'DD/MM/YYYY')
                              }}</span>
                              <br v-if="dataRecordStatistic.surveyUpdatedAt" />
                              <span class="label-text" v-if="dataRecordStatistic.followupSurveyUpdatedAt"
                                >{{ $t_locale('pages/report/_token')('followupAnswerDate') }}
                              </span>
                              <span v-if="dataRecordStatistic.followupSurveyUpdatedAt" class="blue-gs content-text">{{
                                formatdate(dataRecordStatistic.followupSurveyUpdatedAt, 'DD/MM/YYYY')
                              }}</span>
                              <br v-if="dataRecordStatistic.followupSurveyUpdatedAt" />
                              <br />
                            </div>
                            <div class="col-xs-4">
                              <span class="label-text" v-if="dataRecordStatistic.unsatisfactionIsRecontacted !== null"
                                >{{ $t_locale('pages/report/_token')('customerContacted') }}
                              </span>
                              <span
                                v-if="
                                  dataRecordStatistic.unsatisfactionIsRecontacted !== null &&
                                  dataRecordStatistic.unsatisfactionIsRecontacted
                                "
                                class="blue-gs content-text"
                                >{{ $t_locale('pages/report/_token')('yes') }}</span
                              >
                              <span
                                v-if="
                                  dataRecordStatistic.unsatisfactionIsRecontacted !== null &&
                                  !dataRecordStatistic.unsatisfactionIsRecontacted
                                "
                                class="red-gs bold-gs"
                                >{{ $t_locale('pages/report/_token')('no') }}</span
                              >
                              <br v-if="dataRecordStatistic.unsatisfactionIsRecontacted !== null" />
                              <span
                                class="label-text"
                                v-if="
                                  dataRecordStatistic.unsatisfactionIsResolved !== null ||
                                  dataRecordStatistic.unsatisfactionIsResolutionInProgress
                                "
                                >{{ $t_locale('pages/report/_token')('problemResolved') }}
                              </span>
                              <span
                                v-if="
                                  (dataRecordStatistic.unsatisfactionIsResolved !== null ||
                                    dataRecordStatistic.unsatisfactionIsResolutionInProgress) &&
                                  dataRecordStatistic.unsatisfactionIsResolved === true
                                "
                                class="blue-gs content-text"
                                >{{ $t_locale('pages/report/_token')('yes') }}</span
                              >
                              <span
                                v-else-if="
                                  (dataRecordStatistic.unsatisfactionIsResolved !== null ||
                                    dataRecordStatistic.unsatisfactionIsResolutionInProgress) &&
                                  dataRecordStatistic.unsatisfactionIsResolved === false
                                "
                                class="red-gs bold-gs"
                                >{{ $t_locale('pages/report/_token')('no') }}</span
                              >
                              <span
                                v-else-if="
                                  dataRecordStatistic.unsatisfactionIsResolved !== null ||
                                  dataRecordStatistic.unsatisfactionIsResolutionInProgress
                                "
                                class="orange-gs bold-gs"
                                >{{ $t_locale('pages/report/_token')('inProgress') }}</span
                              >
                              <br
                                v-if="
                                  dataRecordStatistic.unsatisfactionIsResolved !== null ||
                                  dataRecordStatistic.unsatisfactionIsResolutionInProgress
                                "
                              />
                              <span
                                class="label-text"
                                v-if="dataRecordStatistic.unsatisfiedIsEvaluationChanged !== null"
                                >{{ $t_locale('pages/report/_token')('customerChangedOpinion') }}
                              </span>
                              <span
                                v-if="
                                  dataRecordStatistic.unsatisfiedIsEvaluationChanged !== null &&
                                  dataRecordStatistic.unsatisfiedIsEvaluationChanged
                                "
                                class="blue-gs content-text"
                                >{{ $t_locale('pages/report/_token')('yes') }}</span
                              >
                              <span
                                v-if="
                                  dataRecordStatistic.unsatisfiedIsEvaluationChanged !== null &&
                                  !dataRecordStatistic.unsatisfiedIsEvaluationChanged
                                "
                                class="red-gs bold-gs"
                                >{{ $t_locale('pages/report/_token')('no') }}</span
                              >
                              <br v-if="dataRecordStatistic.unsatisfiedIsEvaluationChanged !== null" />
                            </div>
                          </div>
                          <div class="row" style="padding-top: 10px;">
                            <div class="col-xs-12">
                              <span class="label-text">{{ $t_locale('pages/report/_token')('followupUnsatisfiedComment') }} </span>
                              <span
                                v-if="dataRecordStatistic.followupUnsatisfiedComment"
                                class="blue-gs content-text"
                                >{{ dataRecordStatistic.followupUnsatisfiedComment }}</span
                              >
                              <span v-else class="grey-gs">{{ $t_locale('pages/report/_token')('undefined') }}</span>
                            </div>
                          </div>
                        </td>
                      </tr>
                      <tr
                        v-if="
                          getUnSatisfiedFollowupNotResolved(garageStats, type).length > 0 &&
                          isDisplayableUnsatisfiedByType(garageStats, report, type)
                        "
                      >
                        <td>
                          <div style="font-size: 18px; font-weight: bold;">
                            {{ $t_locale('pages/report/_token')('problemsNotResolvedType', { type: formatType(type) }) }} :
                          </div>
                        </td>
                      </tr>
                      <tr
                        v-for="(dataRecordStatistic, index) in orderBySurveyUpdatedAt(
                          getUnSatisfiedFollowupNotResolved(garageStats, type)
                        )"
                        :key="index"
                        v-show="isDisplayableUnsatisfiedByType(garageStats, report, type)"
                        style="border-top: 1px solid lightgrey;"
                        class="unsatisfied-line"
                      >
                        <td>
                          <div class="row">
                            <div class="col-xs-4">
                              <span class="label-text">{{ $t_locale('pages/report/_token')('customer') }} </span>
                              <span class="blue-gs content-text">{{ dataRecordStatistic.customerFullName }}</span>
                              <br />
                              <span class="label-text">{{ $t_locale('pages/report/_token')('providedDate') }} </span>
                              <span class="blue-gs content-text">{{
                                formatdate(dataRecordStatistic.completedAt, 'DD/MM/YYYY')
                              }}</span>
                              <br />
                              <span class="label-text" v-if="dataRecordStatistic.garageProvidedFrontDeskUserName"
                                >{{ $t_locale('pages/report/_token')('handler') }}
                              </span>
                              <span
                                v-if="dataRecordStatistic.garageProvidedFrontDeskUserName"
                                class="blue-gs content-text"
                                >{{ dataRecordStatistic.garageProvidedFrontDeskUserName }}</span
                              >
                              <br v-if="dataRecordStatistic.garageProvidedFrontDeskUserName" />
                            </div>
                            <div class="col-xs-4">
                              <span class="label-text">{{ $t_locale('pages/report/_token')('service') }} </span>
                              <span class="blue-gs content-text">{{ getPrestaType(dataRecordStatistic) }}</span>
                              <br />
                              <span class="label-text" v-if="dataRecordStatistic.surveyUpdatedAt"
                                >{{ $t_locale('pages/report/_token')('reviewDate') }}
                              </span>
                              <span v-if="dataRecordStatistic.surveyUpdatedAt" class="blue-gs content-text">{{
                                formatdate(dataRecordStatistic.surveyUpdatedAt, 'DD/MM/YYYY')
                              }}</span>
                              <br v-if="dataRecordStatistic.surveyUpdatedAt" />
                              <span class="label-text" v-if="dataRecordStatistic.followupSurveyUpdatedAt"
                                >{{ $t_locale('pages/report/_token')('followupAnswerDate') }}
                              </span>
                              <span v-if="dataRecordStatistic.followupSurveyUpdatedAt" class="blue-gs content-text">{{
                                formatdate(dataRecordStatistic.followupSurveyUpdatedAt, 'DD/MM/YYYY')
                              }}</span>
                              <br v-if="dataRecordStatistic.followupSurveyUpdatedAt" />
                              <br />
                            </div>
                            <div class="col-xs-4">
                              <span class="label-text" v-if="dataRecordStatistic.unsatisfactionIsRecontacted !== null"
                                >{{ $t_locale('pages/report/_token')('customerContacted') }}
                              </span>
                              <span
                                v-if="
                                  dataRecordStatistic.unsatisfactionIsRecontacted !== null &&
                                  dataRecordStatistic.unsatisfactionIsRecontacted
                                "
                                class="blue-gs content-text"
                                >{{ $t_locale('pages/report/_token')('yes') }}</span
                              >
                              <span
                                v-if="
                                  dataRecordStatistic.unsatisfactionIsRecontacted !== null &&
                                  !dataRecordStatistic.unsatisfactionIsRecontacted
                                "
                                class="red-gs bold-gs"
                                >{{ $t_locale('pages/report/_token')('no') }}</span
                              >
                              <br v-if="dataRecordStatistic.unsatisfactionIsRecontacted !== null" />
                              <span
                                class="label-text"
                                v-if="
                                  dataRecordStatistic.unsatisfactionIsResolved !== null ||
                                  dataRecordStatistic.unsatisfactionIsResolutionInProgress
                                "
                                >{{ $t_locale('pages/report/_token')('problemResolved') }}
                              </span>
                              <span
                                v-if="
                                  (dataRecordStatistic.unsatisfactionIsResolved !== null ||
                                    dataRecordStatistic.unsatisfactionIsResolutionInProgress) &&
                                  dataRecordStatistic.unsatisfactionIsResolved === true
                                "
                                class="blue-gs content-text"
                                >{{ $t_locale('pages/report/_token')('yes') }}</span
                              >
                              <span
                                v-else-if="
                                  (dataRecordStatistic.unsatisfactionIsResolved !== null ||
                                    dataRecordStatistic.unsatisfactionIsResolutionInProgress) &&
                                  dataRecordStatistic.unsatisfactionIsResolved === false
                                "
                                class="red-gs bold-gs"
                                >{{ $t_locale('pages/report/_token')('no') }}</span
                              >
                              <span
                                v-else-if="
                                  dataRecordStatistic.unsatisfactionIsResolved !== null ||
                                  dataRecordStatistic.unsatisfactionIsResolutionInProgress
                                "
                                class="orange-gs bold-gs"
                                >{{ $t_locale('pages/report/_token')('inProgress') }}</span
                              >
                              <br
                                v-if="
                                  dataRecordStatistic.unsatisfactionIsResolved !== null ||
                                  dataRecordStatistic.unsatisfactionIsResolutionInProgress
                                "
                              />
                              <span
                                class="label-text"
                                v-if="dataRecordStatistic.unsatisfiedIsEvaluationChanged !== null"
                                >{{ $t_locale('pages/report/_token')('customerChangedOpinion') }}
                              </span>
                              <span
                                v-if="
                                  dataRecordStatistic.unsatisfiedIsEvaluationChanged !== null &&
                                  dataRecordStatistic.unsatisfiedIsEvaluationChanged
                                "
                                class="blue-gs content-text"
                                >{{ $t_locale('pages/report/_token')('yes') }}</span
                              >
                              <span
                                v-if="
                                  dataRecordStatistic.unsatisfiedIsEvaluationChanged !== null &&
                                  !dataRecordStatistic.unsatisfiedIsEvaluationChanged
                                "
                                class="red-gs bold-gs"
                                >{{ $t_locale('pages/report/_token')('no') }}</span
                              >
                              <br v-if="dataRecordStatistic.unsatisfiedIsEvaluationChanged !== null" />
                            </div>
                          </div>
                          <div class="row" style="padding-top: 10px;">
                            <div class="col-xs-12">
                              <span class="label-text">{{ $t_locale('pages/report/_token')('followupUnsatisfiedComment') }} </span>
                              <span
                                v-if="dataRecordStatistic.followupUnsatisfiedComment"
                                class="blue-gs content-text"
                                >{{ dataRecordStatistic.followupUnsatisfiedComment }}</span
                              >
                              <span v-else class="grey-gs">{{ $t_locale('pages/report/_token')('undefined') }}</span>
                            </div>
                          </div>
                        </td>
                      </tr>
                    </div>
                  </tbody>
                </table>
              </div>
            </div>
          </template>
        </div>
      </div>
    </template>
  </section>
</template>

<script>
import gsIDEncryption from '~/utils/public-link-encrypted-id';
import ReportConfigs from '~/utils/reports/config';
import GarageSubscriptionTypes from '~/utils/models/garage.subscription.type';
import leadSaleTypes from '~/utils/models/data/type/lead-sale-types';
import dataTypes from '~/utils/models/data/type/data-types';
import GarageTypes from '~/utils/models/garage.type.js';
import { orderBy, sortBy, filter } from 'lodash';
import { makeApolloQueries } from '~/util/graphql';

export default {
  layout: 'old-report',

  head() {
    const head = { link: [], title: '' };

    // 1. Setting up the right title
    if (!this.report) {
      head.title = 'GarageScore';
    } else if (this.reportPeriodId === 'daily') {
      head.title = this.$t_locale('pages/report/_token')('titleDaily');
    } else if (this.reportPeriodId === 'weekly') {
      head.title = this.$t_locale('pages/report/_token')('titleWeekly');
    } else if (this.reportPeriodId === 'monthly') {
      head.title = this.$t_locale('pages/report/_token')('titleMonthly');
    }

    // 2. Setting up external css
    head.link.push({
      rel: 'stylesheet',
      type: 'text/css',
      href: 'https://fonts.googleapis.com/css?family=Quicksand:400,700',
    });
    head.link.push({
      rel: 'stylesheet',
      type: 'text/css',
      href: 'https://maxcdn.bootstrapcdn.com/bootstrap/3.3.6/css/bootstrap.min.css',
    });
    head.link.push({
      rel: 'stylesheet',
      type: 'text/css',
      href: 'https://maxcdn.bootstrapcdn.com/font-awesome/4.5.0/css/font-awesome.min.css',
    });
    head.link.push({
      rel: 'stylesheet',
      type: 'text/css',
      href: 'https://fonts.googleapis.com/css?family=Roboto:400,700,400italic,700italic',
    });

    return head;
  },

  async asyncData({ req, route, app, store }) {
    const ERROR_MESSAGES = {
      REPORT_NOT_FOUND: 'reportNotFound',
      NO_GARAGES: 'noConfiguredGarage',
      FALLBACK_ERROR: 'fallbackError',
    };

    try {
      const id = gsIDEncryption.decrypt(route.params.token);
      const report = await req.app.models.Report.findById(id || route.params.token);

      if (!report) {
        throw new Error(ERROR_MESSAGES.REPORT_NOT_FOUND);
      }

      const reportConfig = ReportConfigs.get(report.reportConfigId);
      const user = await req.app.models.User.findById(report.userId);
      const locale = user ? (await user.getLocale()) || 'fr_FR' : 'fr_FR';

      app.i18n.locale = locale.slice(0, 2);
      store.commit('setLang', locale.slice(0, 2));

      const requestName = 'reportGetData';

      const request = {
        name: requestName,
        fields: `
        status
        message
        data {
          garageId
          garagePublicDisplayName
          garagePublicSearchName
          garageType
          garageRatingType
          garagePublicSubscriptions {
            subscribed
            notSubscribed
          }
          countSurveyLead
          countSurveySatisfied
          countSurveyUnsatisfied
          countSurveysResponded
          countSurveysRespondedAPV
          countSurveysRespondedVN
          countSurveysRespondedVO
          countSurveyPromotor
          countSurveyDetractor
          score
          scoreAPV
          scoreVN
          scoreVO
          scoreNPS
          surveysLead {
            garageId
            dataId
            completedAt
            customerFullName
            customerEmail
            customerPhone
            surveyUpdatedAt
            vehiculeRegistrationPlate
            vehiculeRegistrationDate
            vehiculeModel
            vehiculeMake
            leadTiming
            leadType
            leadSaleType
            leadKnowVehicle
            leadVehicle
            leadTradeIn
            leadBrands
            leadEnergyType
            leadBodyType
            leadFinancing
          }
          surveysUnsatisfied {
            garageId
            dataId
            completedAt
            customerFullName
            customerCity
            surveyUpdatedAt
            surveyScore
            type
            surveyComment
            vehicleMakePublicDisplayName
            vehicleModelPublicDisplayName
            publicReviewStatus
            publicReviewCommentStatus
          }
          surveysUnsatisfiedFollowup {
            garageId
            dataId
            completedAt
            customerFullName
            garageProvidedFrontDeskUserName
            type
            surveyUpdatedAt
            followupSurveyUpdatedAt
            unsatisfactionIsRecontacted
            unsatisfactionIsResolved
            unsatisfactionIsResolutionInProgress
            unsatisfiedIsEvaluationChanged
            followupUnsatisfiedComment
          }
          surveysSatisfied {
            completedAt
            customerFullName
            customerCity
            surveyUpdatedAt
            surveyScore
            type
            surveyComment
            vehicleMakePublicDisplayName
            vehicleModelPublicDisplayName
            transactionPublicDisplayName
            publicReviewStatus
            publicReviewCommentStatus
          }
        }
      `,
        args: {
          reportId: report.id,
        },
      };

      const res = await makeApolloQueries([request]);
      const { status, message, data } = res.data[requestName];

      if (!data.length) {
        throw new Error(ERROR_MESSAGES.NO_GARAGES);
      }

      return {
        error: status === 'error' ? message : null,
        report,
        reportConfig,
        garagesStats: sortBy(data, 'garagePublicSearchName'),
      };
    } catch (error) {
      if (Object.values(ERROR_MESSAGES).includes(error.message)) {
        return {
          error: error.message,
        };
      }
      return { error: ERROR_MESSAGES.FALLBACK_ERROR };
    }
  },

  computed: {
    reportPeriodId() {
      return this.reportConfig ? this.reportConfig.id : null;
    },

    displayablePeriod() {
      if (this.reportPeriodId === 'daily') {
        return this.$t_locale('pages/report/_token')('titleDaily');
      } else if (this.reportPeriodId === 'weekly') {
        return this.$t_locale('pages/report/_token')('titleWeekly');
      } else if (this.reportPeriodId === 'monthly') {
        return this.$t_locale('pages/report/_token')('titleMonthly');
      }
    },

    displayablePeriod2() {
      if (this.reportPeriodId === 'daily') {
        return this.$t_locale('pages/report/_token')('titleDaily2', { date: this.getDateFormat(this.report.period) });
      } else if (this.reportPeriodId === 'weekly') {
        return this.$t_locale('pages/report/_token')('titleWeekly2', {
          start: this.getDateFormat(this.report.minDate),
          end: this.getDateFormat(this.report.maxDate),
        });
      } else if (this.reportPeriodId === 'monthly') {
        return this.$t_locale('pages/report/_token')('titleMonthly2', {
          start: this.getDateFormat(this.report.minDate),
          end: this.getDateFormat(this.report.maxDate),
        });
      }
    },
  },

  methods: {
    getDateFormat(rawDate) {
      const date = new Date(rawDate);

      return this.$t_locale('pages/report/_token')('dateFormat', {
        day: date.getDate(),
        month: this.$t_locale('pages/report/_token')(`month[${date.getMonth()}]`),
        year: date.getFullYear(),
      });
    },
    isUndefinedValue(value, isArray = true) {
      const undefinedValues = ['unknown', 'Unknown', 'undefined', 'null', 'Non renseigné', null, undefined];
      return !value || undefinedValues.includes(value) || (isArray && undefinedValues.includes(value[0]));
    },

    addComaIntegrNumber(number) {
      const numberStr = number.toString();
      if (!numberStr) {
        return '0';
      }
      if (number && !numberStr.match(',') && !numberStr.match('.') && numberStr !== '10') {
        return `${numberStr},0`;
      }
      return numberStr;
    },

    frenchDecimal(number) {
      return number || number === 0 ? number.toString().replace(/\./, ',') : '';
    },

    renderNumber(value) {
      if (isNaN(value)) {
        return '-';
      }
      return value.toString().length > 3 ? value.toString().replace(/(.*)(\d{3,3}$)/, '$1.$2') : value;
    },

    formatFloatingPercent(number) {
      if (number === 0) return '0,0';
      return this.frenchDecimal(Math.round(number * 10) / 10);
    },

    percentCalculator(divider, factor) {
      if (isNaN(divider) || isNaN(factor)) {
        return '-';
      }
      if (divider === 0) return 0;
      const result = (factor / divider) * 100;
      return this.formatFloatingPercent(result);
    },

    displayLeadSaleType(leadSaleType) {
      return this.$t_locale('pages/report/_token')(leadSaleType ? `leadSaleType_${leadSaleType}` : 'undefined');
    },

    displayLeadTiming(leadTiming) {
      return this.$t_locale('pages/report/_token')(leadTiming ? `leadTiming_${leadTiming}` : 'undefined');
    },

    displayLeadTradeIn(leadTradeIn) {
      return this.$t_locale('pages/report/_token')(leadTradeIn ? `leadTradeIn_${leadTradeIn}` : 'undefined');
    },

    displayLeadMake(leadMake) {
      if (this.isUndefinedValue(leadMake)) {
        return this.$t_locale('pages/report/_token')('undefined');
      }
      return leadMake;
    },

    displayLeadBodyType(leadBodyType) {
      if (this.isUndefinedValue(leadBodyType)) {
        return this.$t_locale('pages/report/_token')('undefined');
      }

      const bodyTypes = typeof leadBodyType === 'string' ? leadBodyType.split(', ') : leadBodyType;
      const result = [];
      for (const bodyType of bodyTypes) {
        switch (bodyType) {
          case 'Citadine':
            result.push(this.$t_locale('pages/report/_token')('leadBodyType_urban'));
            break;
          case 'Berline':
            result.push(this.$t_locale('pages/report/_token')('leadBodyType_berline'));
            break;
          case 'Break':
            result.push(this.$t_locale('pages/report/_token')('leadBodyType_break'));
            break;
          case 'SUV, 4x4':
            result.push(this.$t_locale('pages/report/_token')('leadBodyType_suv'));
            break;
          case 'Monospace':
            result.push(this.$t_locale('pages/report/_token')('leadBodyType_monospace'));
            break;
          case 'Coupé / Cabriolet':
            result.push(this.$t_locale('pages/report/_token')('leadBodyType_coupe'));
            break;
          case 'Custom':
            result.push(this.$t_locale('pages/report/_token')('leadBodyType_Custom'));
            break;
          case 'Roadster':
            result.push(this.$t_locale('pages/report/_token')('leadBodyType_Roadster'));
            break;
          case 'GT':
            result.push(this.$t_locale('pages/report/_token')('leadBodyType_GT'));
            break;
          case 'Supermotard':
            result.push(this.$t_locale('pages/report/_token')('leadBodyType_Supermotard'));
            break;
          case 'Trail':
            result.push(this.$t_locale('pages/report/_token')('leadBodyType_Trail'));
            break;
          case 'Sportive':
            result.push(this.$t_locale('pages/report/_token')('leadBodyType_Sportive'));
            break;
          case 'Scooter':
            result.push(this.$t_locale('pages/report/_token')('leadBodyType_Scooter'));
            break;
          case 'Je ne sais pas':
            result.push(this.$t_locale('pages/report/_token')('leadBodyType_Unknown'));
            break;
          default:
            result.push(this.$t_locale('pages/report/_token')(`leadBodyType_${bodyType}`));
            break;
        }
      }
      return result.join(', ');
    },

    displayLeadEnergyType(leadEnergyType) {
      if (this.isUndefinedValue(leadEnergyType)) {
        return this.$t_locale('pages/report/_token')('undefined');
      }
      const energyTypes = typeof leadEnergyType === 'string' ? leadEnergyType.split(', ') : leadEnergyType;
      const result = [];
      for (const energyType of energyTypes) {
        switch (energyType) {
          case 'Essence':
            result.push(this.$t_locale('pages/report/_token')('leadEnergyType_fuel'));
            break;
          case 'Diesel':
            result.push(this.$t_locale('pages/report/_token')('leadEnergyType_diesel'));
            break;
          case 'Electrique':
            result.push(this.$t_locale('pages/report/_token')('leadEnergyType_electric'));
            break;
          case 'Hybride':
            result.push(this.$t_locale('pages/report/_token')('leadEnergyType_hybrid'));
            break;
          case 'Hybride rechargeable':
            result.push(this.$t_locale('pages/report/_token')('leadEnergyType_pluginHybrid'));
            break;
          case 'Ne sait pas':
            result.push(this.$t_locale('pages/report/_token')('leadEnergyType_unknown'));
            break;
          default:
            result.push(this.$t_locale('pages/report/_token')(`leadEnergyType_${energyType}`));
            break;
        }
      }
      return result.join(', ');
    },

    displayLeadFinancing(leadFinancing) {
      if (this.isUndefinedValue(leadFinancing, false)) {
        return this.$t_locale('pages/report/_token')('undefined');
      }
      switch (leadFinancing) {
        case 'Au comptant':
          return this.$t_locale('pages/report/_token')('leadFinancing_cash');
        case 'LOA,LLD':
        case 'Leasing(LOA,LLD)':
          return this.$t_locale('pages/report/_token')('leadFinancing_leasing');
        case 'Crédit':
        case 'Crédit classique':
          return this.$t_locale('pages/report/_token')('leadFinancing_credit');
        case 'Ne sait pas':
          return this.$t_locale('pages/report/_token')('leadFinancing_unknown');
        default:
          return this.$t_locale('pages/report/_token')(`leadFinancing_${leadFinancing}`);
      }
    },

    unSatisfiedNumber(stat) {
      if (this.isVehicleInspection(stat.garageType)) {
        return this.getVi(stat.surveysUnsatisfied).length;
      }

      if (isNaN(stat.countSurveyUnsatisfied)) {
        return '0';
      }
      return this.renderNumber(stat.countSurveyUnsatisfied);
    },

    getNPS(stat) {
      if (isNaN(stat.scoreNPS) || stat.scoreNPS === null) {
        if (
          isNaN(stat.countSurveysResponded) ||
          stat.countSurveysResponded === 0 ||
          stat.countSurveysResponded === null
        ) {
          return '-';
        }
        return Math.round(
          ((stat.countSurveyPromotor || 0) / stat.countSurveysResponded -
            (stat.countSurveyDetractor || 0) / stat.countSurveysResponded) *
            100
        );
      }
      return Math.round(stat.scoreNPS);
    },

    getVehicleInspectionNPS(stat) {
      if (
        !this.isVehicleInspection(stat.garageType) ||
        (stat.countSurveySatisfied === 0 && stat.countSurveyUnsatisfied === 0)
      )
        return '-';

      return Math.round(
        ((stat.countSurveySatisfied || 0) / stat.countSurveysResponded -
          (stat.countSurveyUnsatisfied || 0) / stat.countSurveysResponded) *
          100
      );
    },

    getGarageGlobalScore(stat) {
      // [SGS] : display rating /5
      const scoreDivider = this.isVehicleInspection(stat.garageType) && stat.garageRatingType === 'stars' ? 2 : 1;
      if (stat.score) {
        return this.addComaIntegrNumber(Math.round((stat.score / scoreDivider) * 10) / 10);
      }
      const divider =
        (stat.scoreAPV || stat.scoreAPV === 0 ? stat.countSurveysRespondedAPV : 0) +
        (stat.scoreVN || stat.scoreVN === 0 ? stat.countSurveysRespondedVN : 0) +
        (stat.scoreVO || stat.scoreVO === 0 ? stat.countSurveysRespondedVO : 0);
      const score =
        stat.scoreAPV * stat.countSurveysRespondedAPV +
        stat.scoreVN * stat.countSurveysRespondedVN +
        stat.scoreVO * stat.countSurveysRespondedVO;

      return this.addComaIntegrNumber(
        this.frenchDecimal(divider ? Math.round(((score / scoreDivider) * 10) / divider) / 10 : 0)
      );
    },

    getGarageGlobalScoreVI(stat, returnNumber = false) {
      // [SGS] : display rating /5
      if (
        !this.isVehicleInspection(stat.garageType) ||
        (stat.countSurveySatisfied === 0 && stat.countSurveyUnsatisfied === 0)
      )
        return '-';

      const scoreDivider = this.isVehicleInspection(stat.garageType) && stat.garageRatingType === 'stars' ? 2 : 1;
      const getAvgArray = (surveys) => {
        return (
          surveys &&
          surveys.map((survey) => {
            if (survey.surveyScore) return survey.surveyScore;
            else return 0;
          })
        );
      };
      const satisfiedAvgArray = getAvgArray(stat.surveysSatisfied);
      const unsatisfiedAvgArray = getAvgArray(stat.surveysUnsatisfied);
      const reducer = (accumulator, currentValue) => accumulator + currentValue;
      const satisfiedAvg = satisfiedAvgArray.length > 0 ? satisfiedAvgArray.reduce(reducer) : 0;
      const unsatisfiedAvg = unsatisfiedAvgArray.length > 0 ? unsatisfiedAvgArray.reduce(reducer) : 0;
      const avg = Math.round((((satisfiedAvg + unsatisfiedAvg) / stat.countSurveysResponded) * 10) / scoreDivider) / 10;
      if (avg > this.getRatingBase(stat)) return scoreDivider;

      return returnNumber && !isNaN(avg) ? avg : this.addComaIntegrNumber(this.frenchDecimal(avg));
    },

    getGarageGlobalScoreVIColor(garageStats) {
      const ratingBase = this.getRatingBase(garageStats);
      const garageGlobalScoreVI = this.getGarageGlobalScoreVI(garageStats, true);

      if ((ratingBase == 10 && garageGlobalScoreVI >= 9) || (ratingBase == 5 && garageGlobalScoreVI >= 4.5)) {
        return 'green-gs';
      } else if ((ratingBase == 10 && garageGlobalScoreVI > 6) || (ratingBase == 5 && garageGlobalScoreVI > 3)) {
        return 'orange-gs';
      } else if ((ratingBase == 10 && garageGlobalScoreVI <= 6) || (ratingBase == 5 && garageGlobalScoreVI <= 3)) {
        return 'red-gs';
      } else return;
    },

    leadNumber(stat) {
      if (isNaN(stat.countSurveyLead)) {
        return '0';
      }
      return this.renderNumber(stat.countSurveyLead);
    },

    listSubscribedTo(
      { garagePublicSubscriptions: { subscribed = [] }, garageType } = {
        garagePublicSubscriptions: { subscribed: [] },
        garageType: '',
      }
    ) {
      if (!subscribed || !subscribed.length) {
        return '';
      }
      let subscriptionsToDisplay = subscribed;

      // do not show leads for Vi garages
      if (this.isVehicleInspection(garageType)) {
        subscriptionsToDisplay = subscribed.filter((subscription) => subscription !== GarageSubscriptionTypes.LEAD);
      }

      return subscriptionsToDisplay.map((subscription) => this.$t_locale('pages/report/_token')(`sub${subscription}`)).join(', ');
    },

    listNotSubscribedTo(
      { garagePublicSubscriptions: { notSubscribed = [] }, garageType } = {
        garagePublicSubscriptions: { notSubscribed: [] },
        garageType: '',
      }
    ) {
      if (!notSubscribed || !notSubscribed.length) {
        return '';
      }

      let subscriptionsToDisplay = notSubscribed;

      // show only VI for VI garages
      if (this.isVehicleInspection(garageType)) {
        subscriptionsToDisplay = notSubscribed.filter(
          (subscription) => subscription === GarageSubscriptionTypes.VEHICLE_INSPECTION
        );
      }

      return subscriptionsToDisplay.map((subscription) => this.$t_locale('pages/report/_token')(`sub${subscription}`)).join(', ');
    },

    leadVoNumber(garageStats) {
      return this.getLeadVo(garageStats.surveysLead).length;
    },

    leadVnNumber(garageStats) {
      return this.getLeadVn(garageStats.surveysLead).length;
    },

    getLeadVo(dataRecordStatistics) {
      return filter(dataRecordStatistics, this.isLeadVo) || [];
    },

    getLeadVn(dataRecordStatistics) {
      return filter(dataRecordStatistics, this.isLeadVn) || [];
    },

    getLeadUndefined(dataRecordStatistics) {
      return filter(dataRecordStatistics, this.isLeadUndefined);
    },

    isLeadVo(dataRecordStatistic) {
      return dataRecordStatistic.leadSaleType === leadSaleTypes.USED_VEHICLE_SALE;
    },

    isLeadVn(dataRecordStatistic) {
      return dataRecordStatistic.leadSaleType === leadSaleTypes.NEW_VEHICLE_SALE;
    },

    isLeadUndefined(dataRecordStatistic) {
      return !this.isLeadVo(dataRecordStatistic) && !this.isLeadVn(dataRecordStatistic);
    },

    isDisplayableLead(garageStats) {
      return (
        garageStats.garagePublicSubscriptions &&
        garageStats.garagePublicSubscriptions.subscribed.includes(GarageSubscriptionTypes.LEAD) &&
        this.report.config &&
        (this.report.config.lead || this.report.config.leadVo || this.report.config.leadVn)
      );
    },

    isDisplayableLeadVn(garageStats) {
      return (
        garageStats.garagePublicSubscriptions &&
        garageStats.garagePublicSubscriptions.subscribed.includes(GarageSubscriptionTypes.LEAD) &&
        this.report.config &&
        this.report.config.leadVn
      );
    },

    isDisplayableLeadVo(garageStats) {
      return (
        garageStats.garagePublicSubscriptions &&
        garageStats.garagePublicSubscriptions.subscribed.includes(GarageSubscriptionTypes.LEAD) &&
        this.report.config &&
        this.report.config.leadVo
      );
    },

    orderBySurveyUpdatedAt(stats) {
      return orderBy(
        stats,
        (stat) => {
          if (stat.surveyUpdatedAt && this.$moment(stat.surveyUpdatedAt).isValid()) {
            return this.$moment(stat.surveyUpdatedAt).format('X');
          }
          return 0;
        },
        'desc'
      );
    },

    getLeadVnByGarageStats(garageStats) {
      return this.getLeadVn(garageStats.surveysLead);
    },

    getLeadVoByGarageStats(garageStats) {
      return this.getLeadVo(garageStats.surveysLead);
    },

    getLeadUndefinedByGarageStats(garageStats) {
      return this.getLeadUndefined(garageStats.surveysLead);
    },

    formatdate(date, format) {
      return this.$moment(date).format(format);
    },

    isDisplayableUnsatisfied(garageStats, report, dataRecordStatistic) {
      if (!dataRecordStatistic) {
        return (
          this.isDisplayableUnsatisfiedApv(garageStats, report) ||
          this.isDisplayableUnsatisfiedVn(garageStats, report) ||
          this.isDisplayableUnsatisfiedVo(garageStats, report)
        );
      }
      if (this.isApv(dataRecordStatistic) && this.isDisplayableUnsatisfiedApv(garageStats, report)) {
        return true;
      }
      if (this.isVn(dataRecordStatistic) && this.isDisplayableUnsatisfiedVn(garageStats, report)) {
        return true;
      }
      if (this.isVo(dataRecordStatistic) && this.isDisplayableUnsatisfiedVo(garageStats, report)) {
        return true;
      }
      return false;
    },

    isDisplayableUnsatisfiedApv(garageStats, report) {
      return (
        garageStats.garagePublicSubscriptions &&
        garageStats.garagePublicSubscriptions.subscribed.includes(GarageSubscriptionTypes.MAINTENANCE) &&
        report.config &&
        report.config.unsatisfiedApv
      );
    },

    isDisplayableUnsatisfiedVn(garageStats, report) {
      return (
        garageStats.garagePublicSubscriptions &&
        garageStats.garagePublicSubscriptions.subscribed.includes(GarageSubscriptionTypes.NEW_VEHICLE_SALE) &&
        report.config &&
        report.config.unsatisfiedVn
      );
    },

    isDisplayableUnsatisfiedVo(garageStats, report) {
      return (
        garageStats.garagePublicSubscriptions &&
        garageStats.garagePublicSubscriptions.subscribed.includes(GarageSubscriptionTypes.USED_VEHICLE_SALE) &&
        report.config &&
        report.config.unsatisfiedVo
      );
    },

    isDisplayableUnsatisfiedVi(garageStats, report) {
      /**
       * #4249 - SGS Report
       * This method is also used to display Satisfied review for Vehicle Inspection
       */
      return (
        garageStats.garagePublicSubscriptions &&
        garageStats.garagePublicSubscriptions.subscribed.includes(GarageSubscriptionTypes.VEHICLE_INSPECTION) &&
        report.config &&
        report.config.UnsatisfiedVI
      );
    },

    unSatisfiedApvPercent(garageStats) {
      if (!this.unSatisfiedApvNumber(garageStats) || !garageStats.countSurveysRespondedAPV) {
        return 0;
      }
      return this.formatFloatingPercent(
        (this.unSatisfiedApvNumber(garageStats) * 100) / garageStats.countSurveysRespondedAPV
      );
    },

    unSatisfiedVnPercent(garageStats) {
      if (!this.unSatisfiedVnNumber(garageStats) || !garageStats.countSurveysRespondedVN) {
        return 0;
      }
      return this.formatFloatingPercent(
        (this.unSatisfiedVnNumber(garageStats) * 100) / garageStats.countSurveysRespondedVN
      );
    },

    unSatisfiedVoPercent(garageStats) {
      if (!this.unSatisfiedVoNumber(garageStats) || !garageStats.countSurveysRespondedVO) {
        return 0;
      }
      return this.formatFloatingPercent(
        (this.unSatisfiedVoNumber(garageStats) * 100) / garageStats.countSurveysRespondedVO
      );
    },

    unSatisfiedPercent(stat) {
      if (isNaN(stat.countSurveysResponded) || isNaN(stat.countSurveyUnsatisfied)) {
        return '-';
      }
      if (stat.countSurveysResponded === 0) return 0;
      const result = (stat.countSurveyUnsatisfied / stat.countSurveysResponded) * 100;
      return this.formatFloatingPercent(result);
    },

    unSatisfiedViPercent(stat) {
      if (isNaN(stat.countSurveysResponded) || isNaN(stat.countSurveyUnsatisfied)) {
        return '-';
      }
      if (stat.countSurveysResponded === 0) return 0;
      const result = (stat.countSurveyUnsatisfied / stat.countSurveysResponded) * 100;
      return this.formatFloatingPercent(result);
    },

    satisfiedViPercent(garageStats) {
      if (isNaN(garageStats.countSurveysResponded) || isNaN(garageStats.countSurveySatisfied)) {
        return '-';
      }
      if (garageStats.countSurveysResponded === 0) return 0;
      const result = (garageStats.countSurveySatisfied / garageStats.countSurveysResponded) * 100;
      return this.formatFloatingPercent(result);
    },

    unSatisfiedApvNumber(garageStats) {
      return this.getApv(garageStats.surveysUnsatisfied).length;
    },

    unSatisfiedVnNumber(garageStats) {
      return this.getVn(garageStats.surveysUnsatisfied).length;
    },

    unSatisfiedVoNumber(garageStats) {
      return this.getVo(garageStats.surveysUnsatisfied).length;
    },

    unSatisfiedViNumber(garageStats) {
      return this.getVi(garageStats.surveysUnsatisfied).length;
    },

    satisfiedViNumber(garageStats) {
      return this.getVi(garageStats.surveysSatisfied).length;
    },

    isApv(dataRecordStatistic) {
      return (
        dataRecordStatistic.type === dataTypes.MAINTENANCE ||
        // refacto 18/12/2018: surveyType=>type (wait for the next reset of ghistory before removing the next lines)
        dataRecordStatistic.surveyType === dataTypes.MAINTENANCE ||
        (dataRecordStatistic.surveyType && dataRecordStatistic.surveyType.toUpperCase() === 'APV')
      );
    },

    getApv(dataRecordStatistics) {
      return filter(dataRecordStatistics, this.isApv);
    },

    isVn(dataRecordStatistic) {
      return (
        dataRecordStatistic.type === dataTypes.NEW_VEHICLE_SALE ||
        // refacto 18/12/2018: surveyType=>type (wait for the next reset of ghistory before removing the next lines)
        dataRecordStatistic.surveyType === dataTypes.NEW_VEHICLE_SALE ||
        (dataRecordStatistic.surveyType && dataRecordStatistic.surveyType.toUpperCase() === 'VN')
      );
    },

    getVn(dataRecordStatistics) {
      return filter(dataRecordStatistics, this.isVn);
    },

    isVo(dataRecordStatistic) {
      return (
        dataRecordStatistic.type === dataTypes.USED_VEHICLE_SALE ||
        // refacto 18/12/2018: surveyType=>type (wait for the next reset of ghistory before removing the next lines)
        dataRecordStatistic.surveyType === dataTypes.USED_VEHICLE_SALE ||
        (dataRecordStatistic.surveyType && dataRecordStatistic.surveyType.toUpperCase() === 'VO')
      );
    },

    isVi(dataRecordStatistic) {
      return (
        dataRecordStatistic.garageType === GarageTypes.VEHICLE_INSPECTION ||
        dataRecordStatistic.type === dataTypes.VEHICLE_INSPECTION
      );
    },

    getVo(dataRecordStatistics) {
      return filter(dataRecordStatistics, this.isVo);
    },

    getVi(dataRecordStatistics) {
      return filter(dataRecordStatistics, this.isVi);
    },

    filterApv(stats) {
      return filter(stats, this.isApv);
    },

    filterVn(stats) {
      return filter(stats, this.isVn);
    },

    filterVo(stats) {
      return filter(stats, this.isVo);
    },

    filterVi(stats) {
      return filter(stats, this.isVi);
    },

    getPrestaType(dataRecordStatistic) {
      if (this.isApv(dataRecordStatistic)) {
        return this.$t_locale('pages/report/_token')('serviceTypeMaintenance');
      }
      if (this.isVn(dataRecordStatistic)) {
        return this.$t_locale('pages/report/_token')('serviceTypeVn');
      }
      if (this.isVo(dataRecordStatistic)) {
        return this.$t_locale('pages/report/_token')('serviceTypeVo');
      }
      if (this.isVi(dataRecordStatistic)) {
        return this.$t_locale('pages/report/_token')('serviceTypeVi');
      }
      return '';
    },

    getReviewTitle(dataRecordStatistic) {
      if (dataRecordStatistic.publicReviewStatus === 'Approved') return this.$t_locale('pages/report/_token')('reviewTitlePublished');
      if (dataRecordStatistic.publicReviewStatus === 'Rejected') return this.$t_locale('pages/report/_token')('reviewTitleRejected');
      if (dataRecordStatistic.publicReviewStatus === 'Pending') return this.$t_locale('pages/report/_token')('reviewTitleInProcess');
      return this.$t_locale('pages/report/_token')('reviewTitleNoReview');
    },

    getReviewCommentTitle(dataRecordStatistic) {
      if (dataRecordStatistic.publicReviewCommentStatus === 'Approved') return this.$t_locale('pages/report/_token')('reviewCommentPublished');
      if (dataRecordStatistic.publicReviewCommentStatus === 'Rejected') return this.$t_locale('pages/report/_token')('reviewCommentRejected');
      if (dataRecordStatistic.publicReviewCommentStatus === 'Pending') return this.$t_locale('pages/report/_token')('reviewCommentInProcess');
      return this.$t_locale('pages/report/_token')('reviewCommentNoComment');
    },

    displayFollowup(dataRecordStatistic) {
      return (
        dataRecordStatistic.unsatisfactionIsResolved !== null ||
        dataRecordStatistic.unsatisfactionIsResolutionInProgress
      );
    },

    getFollowUpTitle(dataRecordStatistic) {
      if (dataRecordStatistic.unsatisfactionIsResolved === true) return this.$t_locale('pages/report/_token')('followupProblemResolved');
      if (dataRecordStatistic.unsatisfactionIsResolved === false) return this.$t_locale('pages/report/_token')('followupProblemUnresolved');
      if (dataRecordStatistic.unsatisfactionIsResolutionInProgress) return this.$t_locale('pages/report/_token')('followupProblemInProcess');
      return this.$t_locale('pages/report/_token')('followupNoProblem');
    },

    unSatisfiedFollowupNumber(garageStats) {
      return garageStats.surveysUnsatisfiedFollowup
        ? Object.keys(garageStats.surveysUnsatisfiedFollowup).length
        : 0;
    },

    unSatisfiedFollowupNumberNotContacted(garageStats) {
      return garageStats.surveysUnsatisfiedFollowup
        ? filter(garageStats.surveysUnsatisfiedFollowup, (gh) => !gh.unsatisfactionIsRecontacted).length
        : 0;
    },

    unSatisfiedFollowupNumberNotResolved(garageStats) {
      return garageStats.surveysUnsatisfiedFollowup
        ? filter(
            garageStats.surveysUnsatisfiedFollowup,
            (gh) => gh.unsatisfactionIsRecontacted && !gh.unsatisfactionIsResolved
          ).length
        : 0;
    },

    formatType(type) {
      switch (type) {
        case 'Maintenance':
          return this.$t_locale('pages/report/_token')('subMaintenance');
        case 'vn':
        case 'NewVehicleSale':
          return this.$t_locale('pages/report/_token')('subNewVehicleSale');
        case 'vo':
        case 'UsedVehicleSale':
          return this.$t_locale('pages/report/_token')('subUsedVehicleSale');
        default:
          return '';
      }
    },

    getUnSatisfiedFollowupNotContacted(garageStats, type) {
      return garageStats.surveysUnsatisfiedFollowup
        ? filter(garageStats.surveysUnsatisfiedFollowup, (gh) => !gh.unsatisfactionIsRecontacted && gh.type === type)
        : [];
    },

    isDisplayableUnsatisfiedByType(garageStats, report, type) {
      switch (type) {
        case 'Maintenance':
          return this.isDisplayableUnsatisfiedApv(garageStats, report);
        case 'vn':
        case 'NewVehicleSale':
          return this.isDisplayableUnsatisfiedVn(garageStats, report);
        case 'vo':
        case 'UsedVehicleSale':
          return this.isDisplayableUnsatisfiedApv(garageStats, report);
        default:
          return false;
      }
    },

    getUnSatisfiedFollowupNotResolved(garageStats, type) {
      return garageStats.surveysUnsatisfiedFollowup
        ? filter(
            garageStats.surveysUnsatisfiedFollowup,
            (gh) => gh.unsatisfactionIsRecontacted && !gh.unsatisfactionIsResolved && gh.type === type
          )
        : [];
    },

    isVehicleInspection(type) {
      return type === GarageTypes.VEHICLE_INSPECTION;
    },

    getRatingBase({ garageType, garageRatingType }) {
      if (this.isVehicleInspection(garageType) && garageRatingType === 'stars') {
        return 5;
      }
      return 10;
    },

    hasSurveysRespondedAndIsNotVI(garageStats) {
      return (
        garageStats.countSurveysResponded &&
        this.getGarageGlobalScore(garageStats) &&
        !this.isVehicleInspection(garageStats.garageType)
      );
    },
  },
};
</script>

<style lang="scss" scoped>
.report-header {
  position: fixed;
  top: 0;
  width: 100%;
  z-index: 10;
  display: block;
  font-size: 1.14rem;

  &__top,
  &__bottom {
    display: flex;
    align-items: center;
    height: 50px;
    box-shadow: 0 0 10px 0 rgba($black, 0.16);
    div {
      display: flex;
      flex-direction: row;
      align-items: center;
      margin-right: auto;
      margin-left: auto;
      width: 1170px;
    }
  }
  &__top {
    background-color: $custeedBrandColor;
    img {
      height: 36px;
    }
  }
  &__bottom {
    background-color: $white;
    & > div {
      justify-content: space-between;
      width: 1170px;
      span {
        font-weight: 900;
      }
    }
    &__btn-print__txt {
      font-size: 13px;
      font-weight: 600;
    }
    &__alert {
      color: $red;
      margin-right: 0.5rem;
      font-size: 10px;
    }
  }
}
.old-report-page {
  padding-bottom: 128px;

  &__error {
    text-align: center;
  }
}

// LEGACY CSS

#app-loading {
  text-align: center;
}

#app-loading i {
  margin-right: 10px;
  margin-top: 35px;
}

#app-loading div {
  display: inline-block;
  line-height: 43px;
  vertical-align: top;
  margin-top: 35px;
}
td.no-result-msg {
  text-align: center;
  color: #595959;
  font-size: 16px;
  padding-top: 20px !important;
}
.loading-bar {
  background-color: rgba(72, 72, 72, 0.2);
  text-align: center;
  position: absolute;
  top: 150px;
}

.underline-on-hover:hover {
  text-decoration: underline;
}

.not-showed {
  display: none;
}

.garage-name a,
.garage-name a:hover,
.garage-name a:focus {
  color: white;
}
.garage-name a:hover {
  text-decoration: underline;
}
.flag-showDirectoryPage {
  color: #559a0c;
}
.flag-hideDirectoryPage {
  color: #de454b;
}
.switch-button {
  display: inline-block;
  width: 58px;
  height: 30px;
  text-align: center;
  position: relative;
  left: -12px;
  top: 2px;
  border: 1px solid #219ab5;
  color: #219ab5;
  border-radius: 4px;
  vertical-align: top;
}
.switch-button i {
  padding: 5px;
}
.switch-button i.active {
  background-color: #219ab5;
  color: white;
}
.switch-button:hover {
  cursor: pointer;
}

.bold-gs {
  font-weight: bold;
}

.bold-hover:hover {
  font-weight: bold;
}

button:focus,
button:hover {
  outline: none;
}

.clickable-button:hover {
  cursor: pointer !important;
}
.first-col.clickable:hover,
.third-col.clickable:hover {
  cursor: pointer !important;
  background-color: rgba(214, 177, 88, 0.7);
}
td.second-col.clickable {
  border-radius: 5px;
  padding-top: 35px;
  vertical-align: top;
}
.second-col.clickable:hover {
  cursor: pointer !important;
  background-color: rgb(209, 199, 168);
}

.first-col.clickable:before,
.third-col.clickable:before,
.second-col.clickable:before {
  pointer-events: none;
  position: absolute;
  content: '';
  width: 20px;
  height: 20px;
  margin-left: -5px;
  margin-top: -10px;
  border-radius: 5px 0 5px 0;
  border-bottom: 1px solid #ababab;
  border-right: 1px solid #ababab;
  background: white;
  background: linear-gradient(135deg, black 45%, #aaa 50%, #ccc 56%, transparent);
  filter: progid:DXImageTransform.Microsoft.gradient(GradientType=0,startColorstr='#ffffff', endColorstr='#000000');
  z-index: 5;
  box-shadow: 1px 1px 1px rgba(0, 0, 0, 0.4);
  -webkit-transition-duration: 0.3s;
  transition-duration: 0.3s;
  -webkit-transition-property: width, height;
  transition-property: width, height;
}
.second-col.clickable:before {
  margin-top: -35px;
}

.special-word {
  background-color: #eded00;
}

.first-body-row {
  margin-top: 40px;
  position: relative;
  top: 8px;
}

.star-container {
  display: inline-block;
}
.star-container-mobile {
  display: none;
}
.score-header-container {
  text-align: right;
}

html {
  min-width: 500px;
}
.main-stat td {
  padding: 5px;
  border: 1px solid #e6e6e6;
  border-radius: 5px;
}
.main-stat td.red-border {
  border: 1px solid #d14836;
  border-radius: 5px;
}
.main-stat td.orange-border {
  border: 1px solid #e9b330;
  border-radius: 5px;
}
.main-stat td.green-border {
  border: 1px solid #16a765;
  border-radius: 5px;
}

.main-stat {
  width: 100%;
  border-spacing: 10px;
  border-collapse: separate;
}

.main-stat .first-col {
  width: 35%;
  padding-top: 10px;
  padding-bottom: 5px;
}

.main-stat .first-col-2,
.main-stat .third-col-2 {
  width: 33%;
  padding: 15px;
  vertical-align: top;
}

.main-stat .third-col .right-cont,
.main-stat .first-col .right-cont {
  display: inline-block;
  width: 100%;
}

.main-stat .third-col .right-cont .pull-right,
.main-stat .first-col .right-cont .pull-right {
  display: inline-block;
  width: calc(100% - 53px);
}

.main-stat .third-col {
  width: 35%;
  padding-top: 10px;
  padding-bottom: 5px;
}

.main-stat .second-col {
  background-color: #ffffff;
}

.main-stat .second-col .row:after,
.main-stat .second-col .row:before {
  content: none;
}

.main-stat .second-col.red {
  background-color: #d14836;
  vertical-align: top;
}

.main-stat .second-col.green {
  background-color: #16a765;
  vertical-align: top;
}
.main-stat .second-col .green-text {
  color: #16a765;
}
.main-stat .second-col.yellow {
  background-color: #ffcc00;
  vertical-align: top;
}
.main-stat .second-col .yellow-text {
  color: rgb(214, 177, 108);
}
.main-stat .second-col .blue-text {
  color: #219ab5;
}

.main-stat .second-col .cat-title {
  margin-left: 30px;
}

.main-stat .second-col .float-icon {
  float: left;
  margin-left: 46px;
}

.main-stat .second-col .float-icon2 {
  float: left;
  margin-left: 30px;
}
.main-stat .second-col .float-numbers {
  margin-left: 115px;
}
.main-stat .second-col .float-numbers2 {
  margin-left: 85px;
}
.main-stat .second-col .second-col-data-numbers {
  display: inline-block;
  width: 55px;
  font-size: 18px;
  text-align: right;
}
.main-stat .second-col .subscribe-link {
  text-decoration: underline;
  cursor: pointer;
}
.main-stat .second-col .big-font-size {
  font-size: 32px;
  font-weight: bold;
}

.main-stat .second-col .normal-font-size {
  font-size: 14px;
  font-weight: bold;
}

.main-stat .second-col .small-font-size {
  font-size: 10px;
  font-weight: bold;
}

.size-XXXL {
  font-size: 32px;
}

.size-XXL {
  font-size: 24px;
}

.size-XL {
  font-size: 20px;
}

.size-L {
  font-size: 18px;
}

.size-M {
  font-size: 16px;
}

.size-S {
  font-size: 14px;
}

.size-13 {
  font-size: 13px;
}

.size-XS {
  font-size: 12px;
}

.size-XXS {
  font-size: 10px;
}

.vertical-bottom {
  line-height: 32px;
  vertical-align: bottom;
}

h3,
h2 {
  margin: 0;
  padding: 0;
}

.light-grey-2 {
  color: #ededed;
}
.light-grey-3 {
  color: #e6e6e6;
}

.small-text {
  font-size: 12px;
}

.stat-icon {
  margin-left: 4px;
  margin-top: 30px;
}

.survey-score,
.list-button {
  border-radius: 3px;
  padding: 0;
  width: 25px;
  height: 23px;
  border: none;
  background-color: transparent;
  font-size: 10px;
}
.list-lead-transfo-type {
  font-weight: 500;
  font-size: 10px;
  color: #595959;
}
.green-gs,
i.fa.green-gs {
  color: #16a765 !important;
}
.bg-green-gs {
  background-color: #16a765 !important;
}
.survey-score.green-gs {
  border: 1px solid #16a765;
}
.border-green-gs {
  border: 1px solid #16a765;
  border-radius: 10px;
  padding: 10px 32px;
  margin: 0 15px;
}
.list-button.green-gs.selected,
.list-button.green-gs:hover {
  background-color: #16a765;
  color: white;
}
.red-gs,
i.fa.red-gs {
  color: #d14836 !important;
}
.bg-red-gs {
  background-color: #d14836 !important;
}
.border-red-gs {
  border: 1px solid #d14836;
  border-radius: 10px;
  padding: 10px 32px;
  margin: 0 15px;
}
.survey-score.red-gs {
  border: 1px solid #d14836;
}
.list-button.red-gs.selected,
.list-button.red-gs:hover {
  background-color: #d14836;
  color: white;
}
.orange-gs,
i.fa.orange-gs {
  color: #e9b330 !important;
}
.bg-orange-gs {
  background-color: #e9b330 !important;
}
.border-orange-gs {
  border: 1px solid #e9b330;
  border-radius: 10px;
  padding: 10px 32px;
  margin: 0 15px;
}
.survey-score.orange-gs {
  border: 1px solid #e9b330;
}
.list-button.orange-gs.selected,
.list-button.orange-gs:hover {
  background-color: #e9b330;
  color: white;
}
.grey-gs {
  color: grey;
}
.grey-gs-6 {
  color: #c3c3c3;
}
.grey-gs-4,
i.grey-gs-4 {
  color: #727272;
}
.bg-grey-gs {
  background-color: grey !important;
}
.border-grey-gs-4 {
  border: 1px solid #727272;
  border-radius: 10px;
  padding: 10px 32px;
  margin: 0 15px;
}
.grey-gs2 {
  color: #595959;
}
.bg-grey-gs3 {
  color: #e6e6e6;
}
.survey-score.grey-gs {
  border: 1px solid grey;
}
.list-button.grey-gs.selected,
.list-button.grey-gs:hover {
  background-color: grey;
  color: white;
}
.gold-gs {
  color: #c9984f;
}
.bg-gold-gs {
  background-color: #c9984f !important;
}
.btn-gold-gs {
  color: #fff;
  background-color: #c9984f;
  border-color: #b18547;
}
.btn-gold-gs:hover {
  color: #fff;
  background-color: #ab8045;
  border-color: #8e6a39;
}
.list-button.gold-gs.selected,
.list-button.gold-gs:hover {
  background-color: #c9984f;
  color: white;
}

.special-icon,
.special-icon:hover {
  padding: 0px;
  padding-bottom: 0;
}

.survey-score {
  border-radius: 3px;
  font-weight: 700;
  text-align: center;
  line-height: 23px;
  font-size: 14px;
  padding-left: 5px;
  padding-right: 5px;
  width: 37px;
}

.ana-button {
  padding: 10px 38px;
  font-size: 16px;
  background-color: #219ab5;
  color: white;
  border: none;
  font-weight: bold;
}
.ana-button:hover {
  background-color: #208da6;
  color: white;
}
.lead-button {
  padding: 10px 38px;
  font-size: 16px;
  background-color: #c9984f;
  color: white;
  border: none;
  font-weight: bold;
}
.lead-button:hover {
  background-color: #b38549;
  color: white;
}

.light-grey {
  color: #d2d2d2;
}

.blue-gs {
  color: #219ab5;
}
a.blue-gs:hover {
  color: #219ab5;
}
.bg-blue-gs {
  background-color: #219ab5 !important;
}

.black-gs {
  color: #000000;
}
.bg-black-gs {
  background-color: #000000 !important;
}

.btn-blue-gs {
  color: #fff;
  background-color: #219ab5;
  border-color: #1e90a9;
}
.btn-blue-gs:hover {
  color: #fff;
  background-color: #1e90a9;
  border-color: #1b788f;
}

.results-warning {
  margin: 15px auto;
  padding: 5px;
  z-index: 20;
  border-radius: 5px;
  display: block;
  max-width: 992px;
  width: calc(100% - 180px);
  color: white;
  background: #16a765;
  line-height: 20px;
}
.results-warning .fa-info-circle {
  font-size: 22px;
  margin-left: 10px;
  margin-right: 3px;
  vertical-align: middle;
}
.results-warning button {
  background: none;
  border: none;
}
#survey-list-template,
#garage-list-template {
  background-color: white;
  margin-top: 0;
  width: 100%;
}

.survey-lists,
.garage-lists {
  color: black;
  margin-bottom: 0;
}

.survey-lists tr:first-child th,
.garage-lists.survey-lists tr:first-child th {
  border-top: none;
}
.garage-lists .garage-lists-header {
  font-size: 12px;
}
.table.survey-lists > tbody > tr > td,
.table.garage-lists > tbody > tr > td {
  padding: 20px;
  padding-top: 0;
  border: none;
}
.table.survey-lists > tbody > tr > th,
.table.garage-lists > tbody > tr > th {
  padding: 10px 20px;
}
.garage-list-item {
  padding-top: 16px;
}
.customer-info {
  font-size: 13px;
  color: #595959;
  position: relative;
  top: -5px;
}

.filter-text {
  position: relative;
  top: -2px;
}

.customer-comment,
.customer-comment-empty {
  margin-left: 5px;
  margin-top: 5px;
  font-style: italic;
  display: block;
}
.customer-comment {
  color: #219ab5;
  font-size: 17px;
}
.customer-garage-name {
  padding-left: 5px;
  display: inline;
}
.customer-transaction {
  color: #727272;
  font-size: 10px;
  margin: 5px;
  margin-top: 12px;
}
.customer-comment-empty {
  color: #929292;
  font-size: 14px;
}

i.grey {
  color: grey;
}
i.blue {
  color: blue;
}
.public-review-container {
  padding: 20px;
}
.expand-transition {
  transition: all 0.9s ease;
  /*padding: 10px;*/
  overflow: hidden;
}
.expand-enter,
.expand-leave {
  height: 0;
  /*padding: 0 10px;*/
  opacity: 0;
}
.score-container {
  background-color: #219ab5;
  padding: 10px 6px;
  text-align: center;
  width: 90px;
  margin-right: 4px;
  display: inline-block;
}

.score-container p {
  font-size: 12px;
  color: white;
}
.sp-column.score-container {
  background-color: #c9984f;
  width: 90px;
  margin-right: 6px;
}

.score-container .score-number {
  font-size: 20px;
  font-weight: bold;
  text-transform: uppercase;
  margin-top: 5px;
}

.left-margin {
  margin: 1em 0 1em 1em;
}

.left-margin2 {
  margin: 1em 0 1em 2em;
}

.left-margin3 {
  margin: 1em 0 1em 3em;
}

.light-left-margin {
  margin-left: 10px;
}
.juridic-content {
  font-size: 10px;
  text-align: justify;
  color: #727272;
}
.text-grey {
  color: #999;
}
.text-red {
  color: #f66;
}
.score-block {
  padding: 0;
  margin-bottom: 10px;
  display: inline-block;
  min-width: 291px;
}
.clic-comment a,
.clic-comment a:hover {
  color: black;
  font-size: 14px;
  font-weight: bold;
  text-decoration: none;
}
.rating-progress-scale-7,
.rating-progress-scale-8,
.rating-progress-scale-9,
.rating-progress-scale-10 {
  color: #64b7cb;
}
.rating-progress-scale-5,
.rating-progress-scale-6 {
  color: #aaa;
}
.rating-progress-scale-3,
.rating-progress-scale-4 {
  color: #777;
}
.rating-progress-scale-0,
.rating-progress-scale-1,
.rating-progress-scale-2 {
  color: #777;
}
.rating-progress-scale-score-7,
.rating-progress-scale-score-8,
.rating-progress-scale-score-9,
.rating-progress-scale-score-10 {
  color: #64b7cb;
  border: 1px solid #64b7cb;
  border-radius: 3px;
  font-weight: bold;
}
.rating-progress-scale-score-5,
.rating-progress-scale-score-6 {
  color: #aaa;
  border: 1px solid #aaa;
  border-radius: 3px;
  font-weight: bold;
}
.rating-progress-scale-score-3,
.rating-progress-scale-score-4 {
  color: #777;
  border: 1px solid #aaa;
  border-radius: 3px;
  font-weight: bold;
}
.rating-progress-scale-score-0,
.rating-progress-scale-score-1,
.rating-progress-scale-score-2 {
  color: #777;
  border: 1px solid #aaa;
  border-radius: 3px;
  font-weight: bold;
}
.rating-progress-scale-score-7.selected,
.rating-progress-scale-score-8.selected,
.rating-progress-scale-score-9.selected,
.rating-progress-scale-score-10.selected {
  background: #64b7cb;
  color: white;
}
.rating-progress-scale-score-5.selected,
.rating-progress-scale-score-6.selected {
  background: #aaa;
  color: white;
}
.rating-progress-scale-score-3.selected,
.rating-progress-scale-score-4.selected {
  background: #777;
  color: white;
}
.rating-progress-scale-score-0.selected,
.rating-progress-scale-score-1.selected,
.rating-progress-scale-score-2.selected {
  background: #777;
  color: white;
}

.garagescore-garage-directory-page-trophy-L {
  text-align: center;
  position: relative;
  top: 5px;
}

.garagescore-garage-directory-page-trophy-L img {
  margin-top: -6px;
  width: 60px;
  height: 60px;
  border-radius: 50px;
}
.phone-icon {
  margin-top: 18px;
  font-size: 18px;
}

.star-container {
  display: inline-block;
  width: 110px;
  text-align: left;
  padding-top: 10px;
}
.garagescore-garage-tab-stars {
  display: inline-block;
  position: relative;
  top: 10px;
}
.garagescore-garage-tab-label-2 {
  position: relative;
  top: 3px;
}
.garagescore-garage-tab-label,
.garagescore-garage-tab-label-2 {
  line-height: 6px;
  font-size: 10px;
}
.garagescore-garage-directory-page-trophy {
  width: 35px;
  display: inline-block;
}

.garagescore-garage-directory-page-trophy img {
  margin-top: -2px;
  width: 35px;
  height: 35px;
}

.star:before {
  font-family: FontAwesome;
  content: '\f006';
  font-size: 20px;
}

.star-full:before {
  content: '\f005';
}
.star-half:before {
  content: '\f123';
}

.garagescore-garage-tab-stars .star {
  display: inline-block;
  line-height: 5px;
}

.garagescore-garage-tab-stars .star:before {
  color: #e7711b;
  font-size: 10px;
}
.survey-list-header,
.garage-list-header {
  font-size: 10px;
  font-weight: normal;
  background-color: #e6e6e6;
}
.survey-list-header-tr,
.garage-list-header-tr {
  height: 70px;
}
.survey-list-header-fixed,
.garage-list-header-fixed {
  position: fixed;
  top: 35px;
  z-index: 10;
  width: 100%;
  margin: 0;
}
.survey-list-header .header-column,
.garage-list-header .header-column {
  text-align: center;
}
.garage-list-header-item,
.survey-list-header-item {
  padding: 0;
  color: #727272;
}
.garage-list-header-item .text-title {
  padding-right: 3px;
}
.survey-header-button {
  background-color: transparent;
  border: none;
  padding-top: 3px;
  color: #727272;
}
.survey-header-button.showed i.grey-gs3,
.survey-header-button.showed:hover i.grey-gs3 {
  color: #727272;
  border-radius: 3px;
}
.survey-header-button.showed,
.survey-header-button.showed:hover,
.survey-header-button.showed i,
.survey-header-button.showed:hover i {
  color: #ffffff;
  border-radius: 3px;
}
.survey-header-button.selected,
.survey-header-button.selected:hover {
  background-color: #219ab5;
  color: #ffffff;
  border-radius: 3px;
}

i.font-18,
.font-18 {
  font-size: 18px;
}

i.font-24,
.font-24 {
  font-size: 24px;
}

i.font-16,
.font-16 {
  font-size: 16px;
}

.collapsable-container {
  border: 1px solid lightgray;
  border-radius: 7px;
  margin: 15px;
  margin-left: 20px;
  background-color: #e6e6e6;
}
.comment-container {
  border: 1px solid lightgray;
  border-radius: 7px;
  margin: 15px;
  padding: 15px;
  background-color: #e6e6e6;
}
.comment-area {
  border: 1px solid lightgray;
  border-radius: 7px;
  margin: 15px;
  padding: 15px;
  background-color: #e6e6e6;
  width: calc(100% - 30px);
}
.collapsable-container-2 {
  border: 2px solid lightgray;
  border-radius: 7px;
  margin: 15px;
  margin-left: 20px;
  background-color: white;
}
.back-icon {
  -ms-transform: rotate(180deg); /* IE 9 */
  -webkit-transform: rotate(180deg); /* Chrome, Safari, Opera */
  transform: rotate(180deg);
}

.pagination-button-right-container,
.pagination-button-left-container {
  display: inline-block;
  width: calc(50% - 40px);
}
.pagination-button-right-container {
  text-align: left;
}
.pagination-button-left-container {
  text-align: right;
}
.pagination-btn {
  margin: 3px;
}
.pagination-btn:focus,
.pagination-btn:hover {
  outline: none;
}
.current-page,
.current-page:hover {
  color: white;
  background-color: #219ab5;
  display: inline-block;
  cursor: default;
}

.report-public-review-btn,
.report-public-review-form {
  background-color: white;
  float: right;
  margin-bottom: 20px;
  width: 305px;
}
.report-public-review-form textarea {
  margin: 10px;
  width: calc(100% - 20px);
}
.report-public-review-form button {
  float: right;
  margin: 10px;
}
.report-public-review-form label {
  font-size: 10px;
  font-weight: normal;
  padding-left: 13px;
  padding-right: 13px;
  text-align: justify;
  margin-top: 10px;
}

.report-public-review-btn {
  border-radius: 5px;
  -webkit-transition: -webkit-transform 0.5s; /* Safari */
  transition: transform 0.5s;
}

.report-public-review-btn:hover {
  -webkit-transform: scale(1.05);
  transform: scale(1.05);
}

.overflow-hidden-elepsis {
  display: inline-block;
  overflow: hidden;
  white-space: nowrap;
  width: 100%;
  text-overflow: ellipsis;
}

.icon-size {
  font-size: 1.5rem;
  color: $dark-grey;
}

.kpi-subtitle {
  font-size: 1rem;
  font-weight: 700;
  color: $black;
  white-space: nowrap;
}

.content-text-red {
  color: $red;
}

.content-text-green {
  color: $green;
}

.content-text-orange {
  color: #e9b330;
}

.label-text {
  font-weight: 700;
  line-height: 1.7;
}

.content-text {
  color: $dark-grey;
}

.report-container {
  position: relative;
  max-width: 1170px;
  top: 114px;
  margin-left: auto;
  margin-right: auto;
  background-color: $white;
  box-shadow: 0 0 3px 0 rgba($black, 0.16);
  border-radius: 3px;
}

.garage-details-bloc {
  padding: 1rem;
  margin: 15px;
  width: calc(100% - 30px);
  border: 1px solid $light-grey;
  background: $bg-grey;
  border-radius: 3px;
}

.center {
  text-align: center;
}

@media (max-width: 768px) {
  .col-xs-0,
  .xs-hide {
    display: none;
  }
  .star-container {
    position: relative;
    left: 20px;
  }
  .star-container-mobile {
    display: block;
    text-align: center;
    font-size: 12px;
  }
  .score-header-container {
    text-align: center;
  }
  .garage-list-header-like,
  .garage-list-header-etabliss {
    height: 60px;
    text-align: left;
  }
  .report-header {
    &__top,
    &__bottom {
      div {
        padding: 0 1rem;
      }
    }
    &__bottom {
      & > div {
        padding: 0 1rem;
      }
    }
  }
}

@media (max-width: 768px) {
  .score-column {
    padding-left: calc(5% - 18px);
  }
  .survey-lists .container-fluid,
  table.garage-lists .container-fluid {
    padding: 10px !important;
  }
  .survey-lists .container,
  table.garage-lists .container {
    padding-left: 0 !important;
    padding-right: 0 !important;
  }
  .report-public-review-btn,
  .report-public-review-form {
    float: left;
  }
}

@media (min-width: 768px) {
  .col-sm-0 {
    display: none;
  }
  .score-column {
    padding-left: 14px;
  }
}

@media (min-width: 992px) {
  .star-container {
    width: 155px;
  }
  .col-sm-0 {
    display: inline-block;
  }
  .star-container .star:before {
    font-size: 12px;
  }
  .garagescore-garage-tab-label,
  .garagescore-garage-tab-label-2 {
    line-height: 10px;
    font-size: 12px;
  }
  .garagescore-garage-directory-page-trophy img {
    width: 50px;
    height: 50px;
    margin-top: -13px;
  }
  .garagescore-garage-directory-page-trophy {
    width: 50px;
  }
  .garagescore-garage-directory-page-trophy .value {
    width: 48px;
    top: 6px;
    font-size: 14px;
  }
  .score-column {
    padding-left: 14px;
  }
}

@media (min-width: 1200px) {
  .score-column {
    padding-left: 24px;
  }
}

// REPORTS

.unsatisfied-block,
.lead-block,
.satisfied-block {
  border-radius: 3px;
  color: white;
  padding: 20px;
  margin-bottom: 20px;
}

.unsatisfied-block {
  border: 1px solid $red;
}
.satisfied-block {
  border: 1px solid $green;
}

.lead-block {
  border: 1px solid $golden;
}

.unsatisfied-title,
.lead-title,
.satisfied-title {
  font-size: 28px;
  font-weight: bold;
}

.unsatisfied-body,
.lead-body {
  font-size: 16px;
}

.garage-name {
  font-size: 1.5rem;
  font-weight: 900;
  margin-left: 15px;
}

.table.survey-lists > tbody > tr > td {
  padding: 20px 0;
}

.garages-table > thead > tr:first-child > th:first-child {
  border-radius: 5px;
}

.garages-table {
  width: 100%;
  color: black;
  margin-top: 30px;
  margin-bottom: 30px;
}

.garages-table td,
.garages-table th {
  border: 2px solid #e6e6e6;
  padding: 5px;
  text-align: center;
  font-weight: normal;
  font-size: 12px;
}

.garages-table th {
  color: #727272;
}

.garages-table tr:first-child td:first-child {
  padding: 5px;
  min-width: 50px;
}

.big-margin {
  margin: 30px;
  display: inline-block;
}

.printable-only {
  display: none;
}
.printable-title h6 {
  width: 100%;
}
.printable-title {
  display: inline-block;
  width: calc(100% - 75px);
}
.overflow-text-sp {
  width: calc(100% - 44px);
  display: inline-block;
  text-overflow: ellipsis;
  overflow: hidden;
  vertical-align: middle;
}
.garascore-logo {
  color: rgb(51, 141, 205) !important;
  font-weight: bolder;
}
.garascore-logo a {
  text-decoration: none;
}

.bold-gs {
  font-weight: bold !important;
}

@media print {
  .first-col,
  .second-col,
  .third-col {
    border: 2px solid #e6e6e6 !important;
  }
  .big-margin {
    margin: 0;
  }
  a[href]:after {
    content: none !important;
  }

  .blue-gs {
    color: #219ab5 !important;
  }

  .printable-red-gs,
  .printable-red-gs:before,
  .printable-red-gs:after,
  .red-gs,
  .red-gs:before,
  .red-gs:after {
    color: #d14836 !important;
  }

  .printable-green-gs,
  .printable-green-gs:before,
  .printable-green-gs:after,
  .green-gs,
  .green-gs:before,
  .green-gs:after {
    color: $green !important;
  }

  .printable-orange-gs,
  .printable-orange-gs:before,
  .printable-orange-gs:after,
  .orange-gs,
  .orange-gs:before,
  .orange-gs:after {
    color: #e9b330 !important;
  }

  .printable-gold-gs,
  .printable-gold-gs:before,
  .printable-gold-gs:after,
  .gold-gs,
  .gold-gs:before,
  .gold-gs:after {
    color: #c9984f !important;
  }

  .printable-soft-gold,
  .printable-soft-gold:before,
  .printable-soft-gold:after {
    color: #e4b154 !important;
  }

  .printable-soft-grey,
  .printable-soft-grey:before,
  .printable-soft-grey:after {
    color: #afafaf !important;
  }

  .printable-grey,
  .printable-grey:before,
  .printable-grey:after {
    color: #c1c1c1 !important;
  }

  .printable-light-grey,
  .printable-light-grey:before,
  .printable-light-grey:after {
    color: #f1f1f1 !important;
  }

  .grey-gs {
    color: $grey !important;
  }

  .printable-survey-list {
    font-size: 9pt !important;
  }

  .not-printable {
    display: none !important;
  }

  .page-breaker {
    page-break-after: always;
  }

  .printable-only {
    display: inline-block;
  }
  .header-container {
    width: 100%;
  }
  .unsatisfied-block,
  .lead-block,
  .satisfied-block {
    padding-left: 0 !important;
  }
  .overflow-text-sp {
    text-overflow: clip;
  }

  .small-text {
    font-size: 12px;
  }
}
</style>
