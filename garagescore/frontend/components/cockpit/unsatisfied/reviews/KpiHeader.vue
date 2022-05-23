<template>
  <div class="page-unsatisfied__part page-unsatisfied__part-kpi" v-if="!mixinKpiData.isLoading">
    <KpiBox
      :title="$t_locale('components/cockpit/unsatisfied/reviews/KpiHeader')('contactTitle')"
      :clickable="clickableTopContact"
    >
      <KpiBasic
        :todo="countUnsatisfiedWaitingForContact"
        :reminders="countUnsatisfiedContactPlanned"
        :done="countUnsatisfiedAlreadyContacted"
        :todoText="$t_locale('components/cockpit/unsatisfied/reviews/KpiHeader')('contactTodo')"
        :doneText="$t_locale('components/cockpit/unsatisfied/reviews/KpiHeader')('contactDone')"
      />
    </KpiBox>
    <KpiBox
      :title="$t_locale('components/cockpit/unsatisfied/reviews/KpiHeader')('meetingTitle')"
      :clickable="clickableTopVisit"
    >
      <KpiBasic
        :todo="countUnsatisfiedWaitingForVisit"
        :reminders="countUnsatisfiedVisitPlanned"
        :done="countUnsatisfiedAlreadyVisited"
        :todoText="$t_locale('components/cockpit/unsatisfied/reviews/KpiHeader')('meetingTodo')"
        :doneText="$t_locale('components/cockpit/unsatisfied/reviews/KpiHeader')('meetingDone')"
      />
    </KpiBox>
    <KpiBox
      :title="$t_locale('components/cockpit/unsatisfied/reviews/KpiHeader')('closingTitle')"
      :clickable="clickableTopClosing"
    >
      <KpiBasic
        :todo="countUnsatisfiedWaitingForClosing"
        :done="countUnsatisfiedClosed"
        :todoText="$t_locale('components/cockpit/unsatisfied/reviews/KpiHeader')('closingTodo')"
        :doneText="$t_locale('components/cockpit/unsatisfied/reviews/KpiHeader')('closingDone')"
      />
    </KpiBox>
    <KpiBox
      :title="$t_locale('components/cockpit/unsatisfied/reviews/KpiHeader')('resolvedTitle')"
      :clickable="clickableAllResolved"
    >
      <KpiDigest
        :done="countUnsatisfiedClosedWithResolution"
        :total="usersCountUnsatisfied"
        :doneApv="countUnsatisfiedClosedWithResolutionApv"
        :doneVo="countUnsatisfiedClosedWithResolutionVo"
        :doneVn="countUnsatisfiedClosedWithResolutionVn"
        :doneText="$t_locale('components/cockpit/unsatisfied/reviews/KpiHeader')('resolvedDone')"
      />
    </KpiBox>
  </div>

  <div class="page-unsatisfied__part page-unsatisfied__part-kpi" v-else>
    <KPIBoxSkeleton v-for="n in 4" :key="n">
      <KPIBasicSkeleton />
    </KPIBoxSkeleton>
  </div>
</template>

<script>
import KpiBasic from '~/components/global/KpiBasic';
import KpiBox from '~/components/global/KpiBox';
import KpiDigest from '~/components/global/KpiDigest';
import KPIBasicSkeleton from '~/components/global/skeleton/KPIBasicSkeleton';
import KPIBoxSkeleton from '~/components/global/skeleton/KPIBoxSkeleton';
import { transformDataDataTypeId } from '~/utils/kpi/componentHelper';

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
    dataTypeId: { type: String },
    filterReviews: { type: Function, required: true },
    currentKpiUserIdFilter: { type: String, required: true },
  },

  computed: {
    countUnsatisfiedAlreadyVisited() {
      return (
        this.countUnsatisfiedAlreadyContacted -
        this.countUnsatisfiedWaitingForVisit -
        this.countUnsatisfiedVisitPlanned || 0
      );
    },
    countUnsatisfiedWaitingForClosing() {
      return this.usersUnsatisfiedKpi.countUnsatisfiedWaitingForClosing || 0;
    },
    countUnsatisfiedClosedWithResolution() {
      return this.usersUnsatisfiedKpi.countUnsatisfiedClosedWithResolution || 0;
    },
    countUnsatisfiedClosed() {
      return (
        this.usersUnsatisfiedKpi.countUnsatisfiedClosedWithoutResolution
        + this.usersUnsatisfiedKpi.countUnsatisfiedClosedWithResolution
        || 0
      );
    },
    countUnsatisfiedClosedWithResolutionApv() {
      return this.usersUnsatisfiedKpi.countUnsatisfiedClosedWithResolutionApv || 0;
    },
    countUnsatisfiedClosedWithResolutionVo() {
      return this.usersUnsatisfiedKpi.countUnsatisfiedClosedWithResolutionVo || 0;
    },
    countUnsatisfiedClosedWithResolutionVn() {
      return this.usersUnsatisfiedKpi.countUnsatisfiedClosedWithResolutionVn || 0;
    },
    countUnsatisfiedAlreadyContacted() {
      return (
        this.usersCountUnsatisfied - this.countUnsatisfiedWaitingForContact - this.countUnsatisfiedContactPlanned || 0
      );
    },
    countUnsatisfiedWaitingForVisit() {
      return this.usersUnsatisfiedKpi.countUnsatisfiedWaitingForVisit || 0;
    },
    countUnsatisfiedVisitPlanned() {
      return this.usersUnsatisfiedKpi.countUnsatisfiedVisitPlanned || 0;
    },
    usersCountUnsatisfied() {
      return this.usersUnsatisfiedKpi.countUnsatisfied || 0;
    },
    countUnsatisfiedWaitingForContact() {
      return this.usersUnsatisfiedKpi.countUnsatisfiedWaitingForContact || 0;
    },
    countUnsatisfiedContactPlanned() {
      return this.usersUnsatisfiedKpi.countUnsatisfiedContactPlanned || 0;
    },

    usersUnsatisfiedKpi() {
      return transformDataDataTypeId(
        this.mixinKpiData.data.kpiData.usersKpi ?? {},
        this.dataTypeId,
      );
    },

    clickableTopContact() {
      return this.buildClickableInstructions('top', 'Contact', this.currentKpiUserIdFilter)
    },

    clickableTopVisit() {
      return this.buildClickableInstructions('top', 'Visit', this.currentKpiUserIdFilter)
    },

    clickableTopClosing() {
      return this.buildClickableInstructions('top', 'Closing', this.currentKpiUserIdFilter)
    },

    clickableAllResolved() {
      return this.buildClickableInstructions('all', 'Resolved', this.currentKpiUserIdFilter)
    },
  },

  methods: {
    buildClickableInstructions(position, status, manager) {
      const instructions = { visible: true };

      instructions[position] = true;
      instructions.link = (toggle) => this.filterReviews(status, manager, toggle);
      instructions.query = [];
      instructions.query.push({
        name: 'unsatisfiedStatus',
        val: status || null,
      });
      instructions.query.push({
        name: 'unsatisfiedManager',
        val: manager || null,
      });
      instructions.query.push({ name: 'type', val: null });
      instructions.query.push({ name: 'unsatisfiedElapsedTime', val: null });
      instructions.query.push({ name: 'unsatisfiedHasLead', val: null });
      instructions.query.push({ name: 'unsatisfiedFollowUpStatus', val: null });
      return instructions;
    },
  },
}
</script>
<style lang="scss" scoped>
.page-unsatisfied__part-kpi *+* {
  margin-top: 0;
  margin-left: 1rem;
}
</style>

