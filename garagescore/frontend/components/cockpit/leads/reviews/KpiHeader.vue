<template>
  <div
    v-if="!mixinKpiData.isLoading"
    class="page-leads__part page-leads__part-kpi kpi-box-container"
  >
    <KpiBox
      :title="$t_locale('components/cockpit/leads/reviews/KpiHeader')('contactTitle')"
      :clickable="clickableTopContact"
    >
      <KpiBasic
        :todo="countLeadsWaitingForContact"
        :reminders="countLeadsContactPlanned"
        :done="countLeadsAlreadyContacted"
        :todoText="$t_locale('components/cockpit/leads/reviews/KpiHeader')('contactTodo')"
        :doneText="$t_locale('components/cockpit/leads/reviews/KpiHeader')('contactDone')"
      />
    </KpiBox>
    <KpiBox
      :title="$t_locale('components/cockpit/leads/reviews/KpiHeader')('meetingTitle')"
      :clickable="clickableTopMeting"
    >
      <KpiBasic
        :todo="countLeadsWaitingForMeeting"
        :reminders="countLeadsMeetingPlanned"
        :done="countLeadsAlreadyMet"
        :todoText="$t_locale('components/cockpit/leads/reviews/KpiHeader')('realizedTodo')"
        :doneText="$t_locale('components/cockpit/leads/reviews/KpiHeader')('realizedDone')"
      />
    </KpiBox>
    <KpiBox
      :title="$t_locale('components/cockpit/leads/reviews/KpiHeader')('propositionTitle')"
      :clickable="clickableTopProposition"
    >
      <KpiBasic
        :todo="countLeadsWaitingForProposition"
        :reminders="countLeadsPropositionPlanned"
        :done="countLeadsAlreadyProposed"
        :todoText="$t_locale('components/cockpit/leads/reviews/KpiHeader')('sendTodo')"
        :doneText="$t_locale('components/cockpit/leads/reviews/KpiHeader')('sendDone')"
      />
    </KpiBox>
    <KpiBox
      :title="$t_locale('components/cockpit/leads/reviews/KpiHeader')('closingTitle')"
      :clickable="clickableTopClosing"
    >
      <KpiBasic
        :todo="countLeadsWaitingForClosing"
        :done="countLeadsClosed"
        :todoText="$t_locale('components/cockpit/leads/reviews/KpiHeader')('closingTodo')"
        :doneText="$t_locale('components/cockpit/leads/reviews/KpiHeader')('closingDone')"
      />
    </KpiBox>
    <KpiBox
      :title="$t_locale('components/cockpit/leads/reviews/KpiHeader')('conversionsTitle')"
      :clickable="clickableAllSold"
    >
      <KpiDigest v-bind="kpiDigestProps" />
    </KpiBox>
  </div>

  <div
    v-else
    class="page-leads__part page-leads__part-kpi kpi-box-container"
  >
    <KPIBoxSkeleton v-for="n in 5" :key="n">
      <KPIBasicSkeleton />
    </KPIBoxSkeleton>
  </div>
</template>


<script>
import KpiBox from '~/components/global/KpiBox';
import KpiBasic from '~/components/global/KpiBasic';
import KpiDigest from '~/components/global/KpiDigest';
import KPIBoxSkeleton from '~/components/global/skeleton/KPIBoxSkeleton';
import KPIBasicSkeleton from '~/components/global/skeleton/KPIBasicSkeleton';
import { transformDataLeadSaleType } from '~/utils/kpi/componentHelper';

export default {
  components: {
    KpiBox,
    KpiBasic,
    KpiDigest,
    KPIBoxSkeleton,
    KPIBasicSkeleton,
  },

  props: {
    mixinKpiData: { type: Object, required: true },
    navigationDataProvider: { type: Object, required: true },
    filterReviews: { type: Function, required: true },
    currentKpiUserIdFilter: { type: String, required: true },
  },

  computed: {
    leadSaleType () {
      return this.navigationDataProvider.leadSaleType
    },
    usersCountLeads() {
      return this.usersKpi.countLeads || 0;
    },
    countLeadsWaitingForContact() {
      return this.usersKpi.countLeadsWaitingForContact || 0;
    },
    countLeadsContactPlanned() {
      return this.usersKpi.countLeadsContactPlanned || 0;
    },
    countLeadsAlreadyContacted() {
      return this.usersCountLeads - this.countLeadsWaitingForContact - this.countLeadsContactPlanned;
    },
    countLeadsWaitingForMeeting() {
      return this.usersKpi.countLeadsWaitingForMeeting || 0;
    },
    countLeadsMeetingPlanned() {
      return this.usersKpi.countLeadsMeetingPlanned || 0;
    },
    countLeadsAlreadyMet() {
      return this.countLeadsAlreadyContacted - this.countLeadsWaitingForMeeting - this.countLeadsMeetingPlanned;
    },
    countLeadsWaitingForProposition() {
      return this.usersKpi.countLeadsWaitingForProposition || 0;
    },
    countLeadsPropositionPlanned() {
      return this.usersKpi.countLeadsPropositionPlanned || 0;
    },
    countLeadsAlreadyProposed() {
      return this.countLeadsAlreadyMet - this.countLeadsWaitingForProposition - this.countLeadsPropositionPlanned;
    },
    countLeadsWaitingForClosing() {
      return this.usersKpi.countLeadsWaitingForClosing || 0;
    },
    countLeadsClosedWithSale() {
      return this.usersKpi.countLeadsClosedWithSale || 0;
    },
    countLeadsClosed() {
      return (this.usersKpi.countLeadsClosedWithoutSale || 0) + (this.usersKpi.countLeadsClosedWithSale || 0);
    },
    countLeadsClosedWithSaleVo() {
      return this.usersKpi.countLeadsClosedWithSaleVo || 0;
    },
    countLeadsClosedWithSaleVn() {
      return this.usersKpi.countLeadsClosedWithSaleVn + this.usersKpi.countLeadsClosedWithSaleUnknown || 0;
    },
    countLeadsClosedWithSaleApv() {
      return this.usersKpi.countLeadsClosedWithSaleApv || 0;
    },
    usersKpi() {
      const selectedKpi = this.mixinKpiData.data.kpiData.usersKpi || {};

      return transformDataLeadSaleType(
        selectedKpi,
        this.navigationDataProvider.currentLeadSaleTypeSuffix,
        'countLeads',
      );
    },
    kpiDigestProps() {
      return {
        done: this.countLeadsClosedWithSale,
        total: this.usersCountLeads,
        doneVo: this.countLeadsClosedWithSaleVo,
        doneVn: this.countLeadsClosedWithSaleVn,
        doneApv: this.countLeadsClosedWithSaleApv,
        displaySalesPerType: !this.leadSaleType,
        doneText: this.$t_locale('components/cockpit/leads/reviews/KpiHeader')('sales'),
      };
    },

    clickableTopMeting() {
      return this.buildClickableInstructions('top', 'Meeting', this.currentKpiUserIdFilter)
    },

    clickableTopContact() {
      return this.buildClickableInstructions('top', 'Contact', this.currentKpiUserIdFilter)
    },

    clickableTopProposition() {
      return this.buildClickableInstructions('top', 'Proposition', this.currentKpiUserIdFilter)
    },

    clickableTopClosing() {
      return this.buildClickableInstructions('top', 'Closing', this.currentKpiUserIdFilter)
    },

    clickableAllSold() {
      return this.buildClickableInstructions('all', 'Sold', this.currentKpiUserIdFilter)
    },

  },

  methods: {
    buildClickableInstructions(position, status, manager) {
      const instructions = { visible: true };

      instructions[position] = true;
      instructions.link = (toggle) => this.filterReviews(status, manager, toggle);
      instructions.query = [];
      instructions.query.push({ name: 'leadStatus', val: status || null });
      instructions.query.push({ name: 'leadManager', val: manager || null });
      instructions.query.push({ name: 'leadBodyType', val: null });
      instructions.query.push({ name: 'leadFinancing', val: null });
      instructions.query.push({ name: 'leadTiming', val: null });
      instructions.query.push({ name: 'leadSaleType', val: null });
      instructions.query.push({ name: 'leadSource', val: null });
      return instructions;
    },
  },

}
</script>

<style lang="scss" scoped>
  .kpi-box-container {
    & > *:not(:first-child) {
      margin-left: 1rem;
    }
  }
</style>