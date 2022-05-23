<template>
  <div class="custom-exports-list">
    <template v-if="customExports && customExports.length" >
      <div class="custom-exports-list__header">
        <div class="custom-exports-list__bloc custom-exports-list__bloc__header custom-exports-list__bloc__content">
          {{ $t_locale('components/global/exports/CustomExportsList')('HeaderContent') }}
        </div>
        <div class="custom-exports-list__bloc custom-exports-list__bloc__header custom-exports-list__bloc__actions">
            {{ $t_locale('components/global/exports/CustomExportsList')('HeaderActions') }}
        </div>
        <div class="custom-exports-list__bloc custom-exports-list__bloc__header custom-exports-list__bloc__spacer">
        </div>
      </div>

      <div
        class="custom-exports-list__column"
        v-for="(customExport, index) in orderedCustomExports"
        :key="index"
      >
      <div class="custom-exports-list__line">

          <div class="custom-exports-list__bloc custom-exports-list__bloc__content">
            <div class="custom-exports-list__bloc__content__label">
                {{ exportName(customExport) }}
                <i
                  class="icon-gs-programming-time custom-exports-list__bloc__content__label--icon"
                  :style="getFrequencyIconStyles(customExport)"
                  v-tooltip="{ content: exportFrequency(customExport) }"
                />
                <Button
                  class="custom-exports-list__bloc__details-trigger"
                  type="phantom"
                  @click="setCustomExportTooltip(customExport)"
                >
                  <AppText
                    class="custom-exports-list__bloc__details-trigger--text"
                    tag="span"
                    type="muted"
                    size="sml"
                    bold
                  >
                    {{ $t_locale('components/global/exports/CustomExportsList')("ShowDetails") }}
                  </AppText>
                  <i
                    class="icon-gs-down custom-exports-list__bloc__details-trigger--icon"
                    :style="getActiveTooltipStyles(customExport)"
                  />
                </Button>
            </div>
          </div>

          <div class="custom-exports-list__bloc custom-exports-list__bloc__actions">
            <Button
              type="icon-btn-md"
              @click="onSend(customExport)"
              v-tooltip="{ content: $t_locale('components/global/exports/CustomExportsList')('Tooltip_Send') }"
            >
              <i class="icon-gs-cloud-download" />
            </Button>
            <Button
              type="icon-btn-md"
              @click="onEdit(customExport)"
              v-tooltip="{ content: $t_locale('components/global/exports/CustomExportsList')('Tooltip_Edit') }"
            >
              <i class="icon-gs-edit" />
            </Button>
            <Button
              type="icon-btn-md"
              @click="onDelete(customExport)"
              v-tooltip="{ content: $t_locale('components/global/exports/CustomExportsList')('Tooltip_Delete') }"
            >
              <i class="icon-gs-trash" />
            </Button>
          </div>

          <div class="custom-exports-list__bloc custom-exports-list__bloc__spacer">
          </div>

      </div>


        <!-- Details part -->
        <div v-if="(isTooltipOpen && customExport.id === tooltipId) || (isSecondTooltipOpen && customExport.id === tooltipId)">
          <div class="custom-exports-list__bloc__details__header">
              <AppText tag="span" type="black" size="mds" bold>{{ $t_locale('components/global/exports/CustomExportsList')("DetailsExport") }}</AppText>
          </div>
          <div class="custom-exports-list__bloc__details">
            <div class="custom-exports-list__bloc__details--left">
              <div class="custom-exports-list__bloc__details__item">
                <AppText tag="span" type="black" size="mds" bold>{{ $t_locale('components/global/exports/CustomExportsList')("DetailsType") }} :</AppText>
                <AppText tag="span" type="muted" size="mds">{{ exportType(customExport) }} </AppText>
              </div>
              <div class="custom-exports-list__bloc__details__item">
                <AppText tag="span" type="black" size="mds" bold>{{ $t_locale('components/global/exports/CustomExportsList')("DetailsJob") }} :</AppText>
                <AppText tag="span" type="muted" size="mds">{{ exportDataTypes(customExport) }} </AppText>
              </div>
              <div class="custom-exports-list__bloc__details__item">
                <AppText tag="span" type="black" size="mds" bold>{{ $t_locale('components/global/exports/CustomExportsList')("DetailsGaragesCount") }} :</AppText>
                <AppText tag="span" type="muted" size="mds">{{ exportGaragesCount(customExport) }} </AppText>
              </div>
            </div>
            <div class="custom-exports-list__bloc__details--right">
              <div class="custom-exports-list__bloc__details__item">
                <AppText tag="span" type="black" size="mds" bold>{{ $t_locale('components/global/exports/CustomExportsList')("DetailsPeriod") }} :</AppText>
                <AppText tag="span" type="muted" size="mds">{{ exportPeriodId(customExport) }} </AppText>
              </div>
              <div class="custom-exports-list__bloc__details__item">
                <AppText tag="span" type="black" size="mds" bold>{{ $t_locale('components/global/exports/CustomExportsList')("DetailsFrequency") }} :</AppText>
                <AppText tag="span" type="muted" size="mds">{{ exportFrequency(customExport) }} </AppText>
              </div>
              <div class="custom-exports-list__bloc__details__item">
                <AppText tag="span" type="black" size="mds" bold>{{ $t_locale('components/global/exports/CustomExportsList')("DetailsFields") }} :</AppText>
                <AppText tag="span" type="muted" size="mds">{{ exportFieldsCount(customExport) }} </AppText>
                <span
                  class="custom-exports-list__bloc__details__item--icon"
                  v-tooltip="{ content: exportFields(customExport) }"
                >
                  <i class="icon-gs-help" />
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

    </template>
    <template v-else>
      <div class="custom-exports-list__no-results">
        {{ $t_locale('components/global/exports/CustomExportsList')('NoResult')}}
      </div>
    </template>
  </div>
</template>

<script>
import { ExportTypes } from '~/utils/enumV2';
import { ExportFrequencies } from '~/utils/enumV2';
import { periodIdToString } from '~/util/periods';
import ExportHelper from '~/utils/exports/helper';
import TableRowCustomer from "~/components/global/TableRowCustomer";
import { Blue } from '~/assets/style/global.scss';

export default {
  name: 'CustomExportsList',
  components: {
    TableRowCustomer,
  },
   data() {
      return {
        isTooltipOpen: false,
        isSecondTooltipOpen: false,
        tooltipId: null,
      };
    },
  props: {
    customExports: {
      type: Array,
      default: () => []
    },
    onSend: Function,
    onEdit: Function,
    onDelete: Function,
  },
  methods: {
    exportName(customExport) {
      return customExport.name;
    },
    exportType(customExport) {
      return this.$t_locale('components/global/exports/CustomExportsList')(`ExportType_${customExport.exportType}`);
    },
    exportDataTypes(customExport) {
      if (customExport.exportType === ExportTypes.EREPUTATION) {
        return this.$t_locale('components/global/exports/CustomExportsList')('DataType_All');
      }
      if (ExportHelper.exportTypeIsUsingLeadSaleTypes(customExport.exportType)) {
        return customExport.dataTypes.map((e) => this.$t_locale('components/global/exports/CustomExportsList')(`LeadSaleType_${e}`)).join(', ');
      }
      return customExport.dataTypes.map((e) => this.$t_locale('components/global/exports/CustomExportsList')(`DataType_${e}`)).join(', ');
    },
    exportGaragesCount(customExport) {
      if (customExport.garageIds.includes('All')) {
        return this.$t_locale('components/global/exports/CustomExportsList')('Garages_All');
      }
      return customExport.garageIds.length;
    },
    exportPeriodId(customExport) {
      if (customExport.periodId !== null) {
        return this.fromPeriodIdToString(customExport.periodId);
      }
      const { startPeriodId, endPeriodId } = customExport;
      const displayedStart = this.fromPeriodIdToString(startPeriodId);
      const displayedEnd = this.fromPeriodIdToString(endPeriodId);
      return `${displayedStart} - ${displayedEnd}`;
    },
    exportFieldsCount(customExport) {
      return customExport.fields.length;
    },
    exportFields(customExport) {
      return customExport.fields.map((field) => this.$t_locale('components/global/exports/CustomExportsList')(field)).join(', ')
    },
    fromPeriodIdToString(periodId) {
      return periodIdToString(periodId, (k) => this.$t_locale('components/global/exports/CustomExportsList')(k), 'Period_');
    },
    exportFrequency(customExport) {
      return this.$t_locale('components/global/exports/CustomExportsList')(`Frequency_${customExport.frequency}`);
    },
    getFrequencyIconStyles(customExport) {
      if (customExport.frequency !== ExportFrequencies.NONE) {
        return {
          color: Blue
        };
      }
    },
    setCustomExportTooltip(customExport) {

      if (this.isTooltipOpen && this.tooltipId !== customExport.id) {
        this.isSecondTooltipOpen = true;
        this.isTooltipOpen = false;
      }
      this.tooltipId = customExport.id;
      this.isTooltipOpen = !this.isTooltipOpen;
      this.isSecondTooltipOpen = false;
    },
    getActiveTooltipStyles(customExport) {
      if (customExport.id === this.tooltipId && this.isTooltipOpen) {
        return {
          display: 'inline-block',
          transform: 'rotate(180deg)'
        };
      }
    },
  },
  computed: {
    orderedCustomExports() {
      return [...this.customExports].sort((export1, export2)  => {
        if(!export1.name || !export2.name) {
          return 0;
        }
        const sortByName = export1.name.localeCompare(export2.name);
        if(sortByName !== 0) {
          return sortByName;
        }

        if(!export1.exportType || !export2.exportType) {
          return 0;
        }
        return export1.exportType.localeCompare(export2.exportType);
      });
    },
  }
};
</script>

<style lang="scss" scoped>
.custom-exports-list {
  width: 100%;
  display: flex;
  flex-direction: column;
  font-size: .857rem;
  padding: 0 .5rem;
  box-sizing: border-box;

  &__no-results {
    font-size: 1rem;
  }
  &__bloc {
    text-align: left;
    border-bottom: 1px solid rgba($grey, 0.5);
    padding: 1rem .5rem;
    flex-direction: column;
    justify-content: center;
    flex-grow: 0;
    flex-shrink: 0;
    box-sizing: border-box;
    display: flex;
    line-height: 1.35;

    &__content {
      text-align: left;
      flex-basis: 80%;

      &__label {
        color: $black;
        font-size: 1rem;
        font-weight: bold;
        word-break: break-word;
        word-wrap: break-word;

        &--icon {
          font-size: 1rem;
          position: relative;
          top: 2px;
          margin-left: .35rem;
          color: $grey;
        }
      }
    }

    &__details-trigger {
      margin-top: .35rem!important;
      padding: 0!important;
      height: 17px!important;

      &--icon {
        font-size: .75rem;
        position: relative;
        top: 1px;
        margin-left: 0.2rem;
      }
    }

    &__actions {
      display: flex;
      flex-basis: 18%;
      flex-direction: row;
      align-items: center;
      position: relative;
      justify-content: left;

      &__controls {
        display: flex;
        position: relative;
        flex-direction: row;
        align-items: center;
      }
    }
    &__details {
      display: flex;
      align-items: center;
      justify-content: left;
      flex-basis: 100%;
      background: $bg-grey;
      border-bottom: 1px solid rgba($grey, 0.5);
      flex-flow: row;
      padding: 0 1rem 1rem;
      position: relative;
      top: -1px;
      box-sizing: border-box;
      width: calc(100% + 0.6rem);

      &__header {
        padding: .7rem 1rem .7rem 1rem;
        background: $extra-light-grey;
        position: relative;
        top: -1px;
        box-sizing: border-box;
        width: calc(100% + 0.6rem);
      }

      &__item {
        margin-top: 1rem;

        &--icon {
          font-size: .9rem;
          position: relative;
          top: 1px;
          margin-left: .35rem;
          color: $grey;
        }
      }

      &--left {
        width: 50%;
        border-right: 1px solid $white;
      }
      &--right {
        width: 50%;
        padding-left: 1rem;
      }
    }

    &__spacer {
      flex-basis: 2%;
    }

    &__header {
      padding: 0 .5rem 0.5rem .5rem;
      font-size: .92rem;
      box-sizing: border-box;
    }
  }

  &__header {
    display:flex;
    flex-direction: row;
    margin-top: 1rem;
    width: 100%;
    flex: 1 1 auto;
  }

  &__column {
    display: flex;
    flex-direction: column;
    width: 100%;
    flex: 1 1 auto;
  }
  &__line {
    display: flex;
    flex-direction: row;
    width: 100%;
    flex: 1 1 auto;
  }
}
@media screen and (min-width:0\0) and (min-resolution: +72dpi) {
  //.foo CSS
  .custom-exports-list {width: 90%;}
}
</style>
