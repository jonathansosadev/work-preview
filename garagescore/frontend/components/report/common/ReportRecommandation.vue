<template>
  <div class="report-recommandation">
    <ReportChartHeader :title="$t_locale('components/report/common/ReportRecommandation')('recommandations')"></ReportChartHeader>

    <div class="report-recommandation__text">
        <span class="report-recommandation__text__main" :class="mainColor">{{ mainText }}</span>
        <br/>
        <span class="report-recommandation__text__opener">{{ opener }}</span>
        <br/>
        <span class="report-recommandation__text__action-plan">{{ actionPlan }}</span>
        <ul>
          <li v-for="(action, $index) in actionList" :key="$index">
             <span v-for="(substring) in action.split(/\[|\]/)" class="report-recommandation__text__action">
                {{ substring.replace(/welcomeLink|satisfactionTeamLink|contactTeamLink/, '') }}
                <a :href="welcomeLink" v-if="welcomeLink && substring === 'welcomeLink'" target="_blank">{{ $t_locale('components/report/common/ReportRecommandation')('export') }}</a>
                <a :href="satisfactionTeamLink" v-if="satisfactionTeamLink && substring === 'satisfactionTeamLink'" target="_blank">{{ $t_locale('components/report/common/ReportRecommandation')('team') }}</a>
                <a :href="contactTeamLink" v-if="contactTeamLink && substring === 'contactTeamLink'" target="_blank">{{ $t_locale('components/report/common/ReportRecommandation')('team') }}</a>
             </span>
          </li>
        </ul>
        <br v-if="conclusion"/>
        <span v-if="conclusion" class="report-recommandation__text__conclusion">{{ conclusion }}</span>
    </div>

  </div>
</template>

<script>
import ReportChartHeader from './ReportChartHeader.vue';

export default {
  name: 'ReportRecommandation',
  components: { ReportChartHeader },
  data() {
    return {
    }
  },
  props: {
    tabName: String,
    mainText: { type: String, default: "" },
    opener: { type: String, default : "" },
    welcomeLink: { type: String, default : "" },
    satisfactionTeamLink: { type: String, default : "" },
    contactTeamLink: { type: String, default : "" },
    actionPlan: { type: String, default: "" },
    actionList: { type: Array, default: [] },
    conclusion: { type: String, default: "" },
    evaluation: {
      type: String,
      validator : (value) => ['good', 'neutral', 'bad'].includes(value)
    }
  },

  computed: {
    mainColor() {
      return `report-recommandation__text__main--${this.evaluation}`;
    }
  }
}
</script>

<style lang="scss">
  .report-recommandation {
    &__text {
      padding-top: 1.5rem;
      padding-left: 1rem;
      padding-right: 1rem;
      color: $dark-grey;

      & > span {
        vertical-align: text-bottom;
        line-height: 2;
      }
      &__main, &__opener {
        font-weight: 700;
      }
      &__main {
        &--good {
          color: $bright-green;
        }
        &--neutral {
          color: $mac-n-cheese;
        }
        &--bad {
          color: $red;
        }
      }
      
      ul {
        margin: 0;
        li {
          margin-top: 0.5rem;
        }
      }
      &__action {
        margin-top: 0.5rem;
        line-height: 1.4;
      }

      &__conclusion {
        display: block;
        text-align: center;
        font-size: 1.25rem;
        font-style: italic;
      }
    }
  }
</style>
