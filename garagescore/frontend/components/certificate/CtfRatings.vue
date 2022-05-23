<template>
  <section class="ratings">
    <div class="row">
      <div class="ratings-container col-xs-12">
        <div class="left-caret" v-on:click="prevTab()">
          <i class="icon-gs-left" v-if="this.listTab.length > 1"></i>
        </div>
        <div class="col-xss first" :class="[activeTab === 0 ? 'active' : '']" v-if="isValid(0)">
          <h4 class="satisfaction-type">{{ $t_locale('components/certificate/CtfRatings')('byCategories') }}</h4>
          <div class="meter-description" v-for="score in getScoresByCategory" v-if="score.abbreviatedLabel !== 'Autre'">
            <span class="letf-description">{{ $t_locale('components/certificate/CtfRatings')(score.abbreviatedLabel) }} ({{ score.respondentsCount}})</span>
            <span class="right-description">
                <span class="blue-bold-gs" :style="{color: getScoreColor(score.width)}">{{ score.value }}</span>/10
            </span>
            <ctf-blue-meter :percent-value="score.width" multi-color="true" :useCusteedHeader="useCusteedHeader"></ctf-blue-meter>
          </div>
        </div>
        <div class="col-xss second" :class="[activeTab === 1 ? 'active' : '']" v-if="isValid(1)">
          <h4 class="satisfaction-type">{{ $t_locale('components/certificate/CtfRatings')('byCarMake') }}</h4>
          <div class="meter-description" v-for="score in getScoresByMake">
            <span class="letf-description">{{ score.abbreviatedLabel }} ({{ score.respondentsCount}})</span>
            <span class="right-description">
                <span class="blue-bold-gs" :style="{color: getScoreColor(score.width)}">{{ score.value }}</span>/10
            </span>
            <ctf-blue-meter :percent-value="score.width" multi-color="true" :useCusteedHeader="useCusteedHeader"></ctf-blue-meter>
          </div>
        </div>
        <div class="col-xss third" :class="[activeTab === 2 ? 'active' : '']" v-if="isValid(2)">
          <h4 class="satisfaction-type">{{ $t_locale('components/certificate/CtfRatings')('byClients') }}</h4>
          <div class="meter-description" v-for="score in getScoresByValue()">
            <span class="letf-description">{{ $t_locale('components/certificate/CtfRatings')(score.label) }} ({{ score.respondentsCount}})</span>
            <span class="right-description blue-bold-gs" :class="{ 'custeedColor': useCusteedHeader }">{{ score.value }}{{ score.valueType === 'pct' ? '%' : '' }}</span>
            <ctf-blue-meter :percent-value="score.width" :useCusteedHeader="useCusteedHeader"></ctf-blue-meter>
          </div>
        </div>
        <div class="right-caret" v-on:click="nextTab()">
          <i class="icon-gs-right" v-if="this.listTab.length > 1"></i>
        </div>
      </div>
      <div class="col-xs-12" v-if="couldDisplayMore">
          <span v-if="!displayAllScores" v-on:click="displayAllScores = true" class="clickable">
              {{ $t_locale('components/certificate/CtfRatings')('seeMore') }} <i class="icon-gs-down"></i>
          </span>
        <span v-if="displayAllScores" v-on:click="displayAllScores = false" class="clickable">
              {{ $t_locale('components/certificate/CtfRatings')('seeLess') }} <i class="icon-gs-up"></i>
          </span>
      </div>
      <div class="bottom-control">
        <span class="bubble" :class="[activeTab === 0 ? 'active' : '']" v-on:click="activeTab = 0" v-if="isValid(0)"></span>
        <span class="bubble" :class="[activeTab === 1 ? 'active' : '']" v-on:click="activeTab = 1" v-if="isValid(1)"></span>
        <span class="bubble" :class="[activeTab === 2 ? 'active' : '']" v-on:click="activeTab = 2" v-if="isValid(2)"></span>
      </div>
    </div>
  </section>
</template>

<script>
  import CtfBlueMeter from './CtfBlueMeter.vue'

  export default {
    props: {
      useCusteedHeader: Boolean
    },
    data() {
      return {
        displayAllScores: false,
        couldDisplayMore: false,
        activeTab: 0,
        validTab: [],
        listTab: []
      };
    },
    components: {CtfBlueMeter},
    computed: {
      garage() {
        return this.$store.state.certificate.garage;
      },
      scores() {
        return this.$store.state.certificate.scores;
      },
      selectedServiceType() {
        this.displayAllScores = false;
        return this.$store.state.certificate.selectedServiceType;
      },
      getScoresByCategory() {
        const scores =
          this.scores &&
          this.scores.scores &&
          this.scores.scores[this.selectedServiceType] &&
          (this.scores.scores[this.selectedServiceType].byAbbreviatedCategoryLabel || this.scores.scores[this.selectedServiceType].formattedByItemRatings)
            ? (this.scores.scores[this.selectedServiceType].byAbbreviatedCategoryLabel || this.scores.scores[this.selectedServiceType].formattedByItemRatings)
            : [];
        return scores.slice(0, this.displayAllScores ? Infinity : 5);
      },
      getScoresByMake() {
        return this.scores &&
        this.scores.scores &&
        this.scores.scores[this.selectedServiceType] &&
        this.scores.scores[this.selectedServiceType].byVehicleMake
          ? this.scores.scores[this.selectedServiceType].byVehicleMake.slice(0, this.displayAllScores ? Infinity : 5)
          : [];
      }
    },
    mounted() {
      this.hasMoreScore();
      let moveSequence = [];
      const self = this;
      Array.prototype.forEach.call(document.getElementsByClassName('col-xss'), function(el) {
        el.addEventListener("touchstart",function () { moveSequence.push({ event: 'down' });}, false);
        el.addEventListener("touchmove",function (event) { moveSequence.push({ event: 'move', clientX: event.changedTouches[0].clientX, clientY: event.changedTouches[0].clientY });}, false);
//        el.onpointermove = function (event) { moveSequence.push({ event: 'move', clientX: event.clientX }); };
//        el.onpointerup = function () { moveSequence = []; };
        var touchEnd = function () {
//          console.log(event);
          if (moveSequence.length > 1
            && moveSequence[0].event === 'down'
            && moveSequence[1].event === 'move'
            && moveSequence[moveSequence.length - 1].event === 'move') {
            const moveWeight = moveSequence[1].clientX - moveSequence[moveSequence.length - 1].clientX;
            const moveVerticalWeight = moveSequence[1].clientY - moveSequence[moveSequence.length - 1].clientY;
            if (moveVerticalWeight < 20 && moveVerticalWeight > -20) {
              if (moveWeight < 10 && (self.activeTab === 1 || self.activeTab === 2)) {
                self.activeTab--;
              }
              if (moveWeight > 10 && (self.activeTab === 0 || self.activeTab === 1)) {
                self.activeTab++;
              }
            }
          }
          moveSequence = [];
        };
        el.addEventListener("touchend", touchEnd, false);
        el.addEventListener("touchcancel", touchEnd, false);
      });
      this.activeTab = (this.selectedServiceType === 'Maintenance') ? 0 : 1;
      this.updateScores();
    },
    watch: {
      selectedServiceType(newVal) {
        this.updateScores();
        // if(newVal === 'Maintenance' && this.validTab[0] && this.listTab[0] !== 0) {
        //   this.listTab.unshift(0);
        // } else if (newVal !== 'Maintenance' && this.validTab[0] && this.listTab[0] === 0){
        //   this.listTab.shift();
        // }
        this.hasMoreScore();
        if (newVal !== 'Maintenance' && this.activeTab === 0) this.activeTab = this.listTab[1];
      },
      activeTab() {
        this.hasMoreScore();
      }
    },
    methods: {
      updateScores() {
        this.validTab[0] = this.getScoresByCategory.length > 0;
        this.validTab[1] = this.getScoresByMake.length > 0;
        this.validTab[2] = this.getScoresByValue().length > 0;
        this.listTab = [];
        for (let i = 0; i < 3; i++) {
          if (this.validTab[i]) this.listTab.push(i);
        }
      },
      isValid(index) {
        if (index === 0) {
          return (this.selectedServiceType === 'Maintenance');
        } else {
          return !!this.validTab[index];
        }
      },
      nextTab() {
        let cur = this.listTab.indexOf(this.activeTab);
        if (this.listTab[cur + 1] !== undefined) this.activeTab = this.listTab[cur + 1];
        else this.activeTab = this.listTab[0];
        if (this.selectedServiceType !== 'Maintenance' && this.activeTab === 0) this.activeTab = this.listTab[1];
      },
      prevTab() {
        let cur = this.listTab.indexOf(this.activeTab);
        if (this.listTab[cur - 1] !== undefined) this.activeTab = this.listTab[cur - 1];
        else this.activeTab = this.listTab[this.listTab.length - 1];
        if (this.selectedServiceType !== 'Maintenance' && this.activeTab === 0) this.activeTab = this.listTab[this.listTab.length - 1];
      },
      getScoreColor(percentValue) {
        if(this.useCusteedHeader) {
          return '#152543';
        }

        if (percentValue >= 80) return '#43b9ad';
        if (percentValue < 60) return '#D14836';
        return '#EAB436'
      },
      hasMoreScore() {
        this.couldDisplayMore = this.scores && this.scores.scores && this.scores.scores[this.selectedServiceType]
          && ((this.scores.scores[this.selectedServiceType].byValue
              && this.scores.scores[this.selectedServiceType].byValue.length > 5)
            || (this.scores.scores[this.selectedServiceType].byAbbreviatedCategoryLabel
              && this.scores.scores[this.selectedServiceType].byAbbreviatedCategoryLabel.length > 5)
            || (this.scores.scores[this.selectedServiceType].formattedByItemRatings
              && this.scores.scores[this.selectedServiceType].formattedByItemRatings.length > 5)
            || (this.scores.scores[this.selectedServiceType].byVehicleMake
              && this.scores.scores[this.selectedServiceType].byVehicleMake.length > 5)
          );
      },
      getScoresByValue() {
        return this.scores && this.scores.scores && this.scores.scores[this.selectedServiceType] && this.scores.scores[this.selectedServiceType].byValue
          ? this.scores.scores[this.selectedServiceType].byValue.slice(0, this.displayAllScores ? Infinity : 5)
          : [];
      }
    }
  }
</script>

<style lang="scss" scoped>
  .ratings {
    width: 100%;
    display: inline-block;
    border-bottom: 2px dotted #BCBCBC;
    padding-top: 10px;
    padding-bottom: 10px;
    .ratings-container {
      display:flex;
      flex-direction:row;
    }
    .left-caret, .right-caret, .spacer, .bottom-control {
      display: none;
    }
    .blue-bold-gs {
      color: #43b9ad;
    }

    .blue-bold-gs.custeedColor {
      color : $custeedBrandColor;
    }

    .meter-description {
      font-size: 16px;
      
      color: #757575;
      .right-description {
        float: right;
      }
    }
    .clickable:hover {
      cursor: pointer;
    }
    .clickable {
      display: inline-block;
      float: right;
      margin-top: 10px;
      
      color: #757575
    }
    .col-xss {
      flex-basis: 0;
      flex-grow: 1;
      padding: 0 1rem;
    }

    @media (max-width: 1200px) {
      h4.satisfaction-type {
        font-size: 16px;
      }

      .meter-description {
        font-size: 14px;
      }
    }

    @media (max-width: 991px) and (min-width: 480px) {
      h4.satisfaction-type {
        margin-top: 20px;
        font-size: 11px;
      }

      .meter-description {
        font-size: 11px;
      }
    }

    @media (max-width: 480px) {
      .col-xss.active {
        display: inline-block;
        width: calc(100% - 80px);
        min-height: 235px;
      }

      /*.col-xss.active.first {*/
      /*padding-right: 80px;*/
      /*}*/
      /*.col-xss.active.second {*/
      /*padding-left: 40px;*/
      /*padding-right: 40px;*/
      /*}*/
      /*.col-xss.active.third {*/
      /*padding-left: 80px;*/
      /*}*/
      .col-xss {
        display: none;
        transition: visibility 0s, opacity 0.5s linear;
      }

      .clickable {
        margin-bottom: 0;
      }

      .spacer {
        display: inline-block;
        height: 24px;
      }

      .bottom-control {
        display: inline-block;
        width: 100%;
      }

      .left-caret, .right-caret {
        display: flex;
        width: 25px;
        color: #bcbcbc;
        font-size: 28px;
        flex-flow: column;
        align-items: center;
        justify-content: center;
      }

      .left-caret:hover, .right-caret:hover {
        cursor: pointer;
      }

      .left-caret {
        float: left;
        margin-left: 15px;
        text-align: right;
      }

      .bottom-control {
        text-align: center;
        margin-bottom: 10px;
        .bubble {
          width: 8px;
          height: 8px;
          border-radius: 4px;
          background-color: #bcbcbc;
          display: inline-block;
          margin: 0 6px;
        }
        .bubble:hover {
          cursor: pointer;
        }
        .bubble.active {
          background-color: #43b9ad;
        }
      }

      .right-caret {
        float: right;
        margin-right: 15px;
        text-align: left;
      }
    }
  }
</style>
