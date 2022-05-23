<template>
  <div>
    <TableRow>
      <TableRowCell :display="['sm']">
        <TeamDetails
          :index="index"
          @click="filterByDms(row)"
          :name="row.frontDesk"
          :garageName="row.garagePublicDisplayName"
          baseRoute="cockpit-satisfaction"
        />
      </TableRowCell>
    </TableRow>
    <TableRow border>
      <TableRowCell :style="{ flex: 2 }" :display="['md', 'lg']">
        <TeamDetails
          :index="index"
          @click="filterByDms(row)"
          :name="row.frontDesk"
          :garageName="row.garagePublicDisplayName"
          baseRoute="cockpit-satisfaction"
        />
      </TableRowCell>
      <TableRowCell center>
        <template v-if="row.countSurveyRespondedAll">
          <KPINumber
            :value="reviewRespondedPercentage"
            :positiveValue="27"
            :neutralValue="27"
            :warningValue="20"
            :dangerValue="0"
            prc
          />&nbsp;
          <AppText
            tag="span"
            size="mds"
            type="muted"
            bold
          >
            {{ `(${row.countSurveyRespondedAll})` }}
          </AppText>
        </template>
        <span v-else>--</span>
      </TableRowCell>
      <TableRowCell center>
        <KPINumber
          :value="oneDecimal(row.scoreNPS)"
          :positiveValue="60"
          :neutralValue="60"
          :warningValue="40"
          :dangerValue="-100"
          v-if="oneDecimal(row.scoreNPS)"
        />
        <span v-else>--</span>
      </TableRowCell>
      <TableRowCell center v-if="isDisplayed">
        <AppText
          tag="span"
          :type="colorScore(row.scoreAPV)"
          v-if="row.scoreAPV"
          bold
        >
          {{ oneDecimal(row.scoreAPV) }}
        </AppText>
        <span v-else>--</span>
      </TableRowCell>
      <TableRowCell center v-if="isDisplayed">
        <AppText
          tag="span"
          :type="colorScore(row.scoreVN)"
          v-if="row.scoreVN"
          bold
        >
          {{ oneDecimal(row.scoreVN) }}
        </AppText>
        <span v-else>--</span>
      </TableRowCell>
      <TableRowCell center v-if="isDisplayed">
        <AppText
          tag="span"
          :type="colorScore(row.scoreVO)"
          v-if="row.scoreVO"
          bold
        >
          {{ oneDecimal(row.scoreVO) }}
        </AppText>
        <span v-else>--</span>
      </TableRowCell>
      <TableRowCell center>
        <nuxt-link :to="{ name: 'cockpit-contacts', query: { garageId: row.garageId } }" class="table__link">
          <KPINumber
            :value="promotorsPercent"
            :positiveValue="80"
            :neutralValue="80"
            :warningValue="75"
            :dangerValue="0"
            link
            prc
          />
        </nuxt-link>
      </TableRowCell>
      <TableRowCell center>
        <nuxt-link :to="{ name: 'cockpit-unsatisfied', query: { garageId: row.garageId } }" class="table__link">
          <KPINumber
            :value="detractorsPercent"
            reverse
            :positiveValue="5"
            :neutralValue="5"
            :warningValue="10"
            :dangerValue="100"
            link
            prc
          />
        </nuxt-link>
      </TableRowCell>
    </TableRow>
  </div>
</template>

<script>
import TeamDetails from '~/components/global/TeamDetails.vue';
import KPINumber from '~/components/ui/KPINumber.vue';
import { scoreToColor } from '~/util/scoreToColor';
import GarageTypes from '~/utils/models/garage.type.js';

export default {
  props: {
    row: Object,
    index: Number,
    filterByDms: { type: Function, required: true },
    currentCockpitType: String,
  },

  components: {
    KPINumber,
    TeamDetails,
  },

  computed: {
    promotorsPercent() {
      return (
        (this.row.countSurveyPromotor / this.row.countSurveyRespondedAll) * 100
      );
    },

    detractorsPercent() {
      return (
        (this.row.countSurveyDetractor / this.row.countSurveyRespondedAll) * 100
      );
    },

    reviewRespondedPercentage() {
      return (
        (this.row.countSurveysResponded /
          this.row.countReceivedAndScheduledSurveys) *
        100
      );
    },
    isDisplayed() {
      return ![GarageTypes.VEHICLE_INSPECTION].includes(this.currentCockpitType);
    },
  },

  methods: {
    colorScore(value) {
      return scoreToColor(value);
    },
    oneDecimal(value, isPercent) {
      if (isNaN(value) || value === null) {
        return '--';
      }
      if (!value) {
        return '0%';
      }
      if (value >= 10 || value <= -10) {
        return `${Math.floor(value)}${isPercent ? '%' : ''}`;
      }
      const showPercent = isPercent ? '%' : '';
      return `${Number.parseFloat(Number.parseFloat(value).toFixed(1))}${showPercent}`;
    },
  },
};
</script>
