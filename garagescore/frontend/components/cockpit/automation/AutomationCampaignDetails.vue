<template>
  <div class="campaign">
    <div class="target-name">
      {{ index + 1 }}.&nbsp;<AutomationCampaignTargetsName :target="target" />
    </div>
    <div class="campaign__part campaign__part--small-margin">
      <AppText class="campaign__date" tag="span" type="muted">
        <Tag
          :content="$t_locale('components/cockpit/automation/AutomationCampaignDetails')(tagType)"
          :background="colorType"
          icon="targetBold"
        >
        </Tag>
      </AppText>
    </div>
    <div @click="displayDetails(target); show()" class="campaign__part campaign__part--margin">
      <AppText class="campaign__custom-content" tag="span" type="muted">
          {{ $t_locale('components/cockpit/automation/AutomationCampaignDetails')('details') }} 
          <i v-if="isDisplayDetails" class="icon-gs-up dropdown-content__item-icon"></i>
          <i v-else class="icon-gs-down dropdown-content__item-icon"></i>
      </AppText>
    </div>
  </div>
</template>

<script>
import AutomationCampaignTargetsName from "~/components/automation/AutomationCampaignTargetsName.vue";
import Tag from "~/components/ui/Tag.vue";

export default {
  components: { AutomationCampaignTargetsName, Tag },

  props: {
    index: {
      type: Number,
      required: true,
    },
    tagType: {
      type: String,
      default: "",
    },
    target: {
      type: String,
      default: "",
    },
    displayDetails: {
      type: Function,
      required: true,
    },
  },

  data() {
    return {
      isDisplayDetails: false
    }
  },

  computed: {
    colorType() {
      if (this.tagType === 'apv') {
        return 'grey-subdued';
      }
      return 'grey-default';
    }
  },

  methods: {
    show() {
      this.isDisplayDetails = !this.isDisplayDetails;
    }
  }
};
</script>

<style lang="scss" scoped>
.target-name {
  font-size: 1.143rem;
  font-weight: bold;
  font-stretch: normal;
  font-style: normal;
  line-height: 1.31;
  letter-spacing: normal;
  text-align: left;
}

.tagType {
  width: 3.643rem;
  height: 0.857rem;
  margin: 0 0 0 0.357rem;
  font-size: 0.714rem;
  font-weight: bold;
  font-stretch: normal;
  font-style: normal;
  line-height: 1.2;
  letter-spacing: normal;
  text-align: left;
  color: $white;
}

.dropdown-content {
  border-radius: 3px;
  overflow: hidden;

  &__item-icon {
    font-size: 10px;
    margin-left: 3px;
  }
}

.campaign {
  font-size: 1rem;

  &__part {
    display: flex;
    align-items: center;

    &--small-margin {
      margin-top: 0.5rem;
    }

    &--margin {
      margin-top: 0.5rem;
      cursor: pointer;
    }

    &--header {
      cursor: pointer;
      line-height: 1.2;
      font-size: 0.929rem;
      font-weight: normal;
      max-width: 100%;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      display: flex;
      flex-direction: row;
      color: $dark-grey;
    }

  }
}
</style>
