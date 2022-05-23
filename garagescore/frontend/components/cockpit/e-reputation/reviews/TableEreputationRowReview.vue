<template>
  <TableRow :border="border">
    <TableRowCell :style="{ flex: 2 }">
      <ReviewEreputation
        v-bind="reviewProps"
        :cockpitProps="cockpitProps"
        @customer-click="onCustomerClick"
      />
    </TableRowCell>
    <TableRowCell center>
      <AppText
        tag="span"
        :type="colorSurveyScore"
        bold
        v-if="hasScore"
      >
        {{ row.surveyScore / 2 }}
      </AppText>
      <ThumbScore
        v-else
        :recommend="recommend"
        size="md"
      />
    </TableRowCell>
    <TableRowCell center>
      <SourceIcon :source="row.source" :show-name="false" />
    </TableRowCell>
    <TableRowCell center>
      <EreputationResponse
        :getRowSubview="getRowSubview"
        :review="row"
        @toggle="setRowSubview('publicReviewComment')"
      />
    </TableRowCell>
  </TableRow>
</template>

<script>
import ReviewEreputation from "~/components/cockpit/e-reputation/reviews/ReviewEreputation";
import SourceIcon from "~/components/global/SourceIcon";
import EreputationResponse from "~/components/cockpit/e-reputation/reviews/EreputationResponse";
import { scoreToColor } from "~/util/scoreToColor";

export default {
  name: 'TableEreputationRowReview',
  components: { ReviewEreputation, SourceIcon, EreputationResponse },
  props: {
    row: Object,
    border: Boolean,
    fetchResponses:{
      type: Function,
      default: () => ({})
    },
    onChangeRowSubview: {
      type: Function,
      required: true,
    },
    getRowSubview: {
      type: Function,
      required: true,
    },
    cockpitProps: {
      type: Object,
      required: true,
    },
  },
  methods: {
    async setRowSubview(view) {
      await this.onChangeRowSubview({
        id: this.row.id,
        view
      });
      await this.fetchResponses(this.row.surveyScore, this.row.garageId)
    },

    async onCustomerClick() {
      await this.setRowSubview("customer");
    },
  },

  computed: {
    hasScore() {
      return (
        typeof this.row.surveyScore !== "undefined" &&
        this.row.surveyScore >= 0 &&
        this.row.surveyScore <= 10
      );
    },

    recommend() {
      return this.row.recommend;
    },

    colorSurveyScore() {
      return scoreToColor(this.row.surveyScore);
    },

    reviewProps() {
      return {
        comment: this.row.surveyComment,
        customerFullName: this.row.customerFullName,
        date: this.row.surveyRespondedAt,
        garageName: this.row.garagePublicDisplayName,
        score: this.row.surveyScore / 2,
        garageId: this.row.garageId,
        recommend: this.row.recommend,
        source: this.row.source,
        rating: this.row.surveyScore
      };
    }
  }
};
</script>

<style lang="scss" scoped>
.c-icon-label {
  &--pointer {
    cursor: pointer;
    user-select: none;
  }
}
.gauge-adjust {
  position: relative;
  top: -0.7rem;
  width: 40px;
  height: 25px;
}
</style>
