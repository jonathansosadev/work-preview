<template>
  <DropdownBase type="phantom" size="lg" class="dropdown-automation-campaigns" ref="dropdown" noMaxWidth>
    <template slot="label">
      {{ currentTargetName }}
    </template>

    <template>
      <div class="dropdown-content">
        <div class="dropdown-content__items custom-scrollbar">
          <button
            class="dropdown-content__item"
            v-for="(target, index) in availableCampaigns"
            :key="index"
            @click="manageCampaigns(target.id)"
          >
            <AutomationCampaignTargetsName :target="target.id" :tag="target.tag"></AutomationCampaignTargetsName>
          </button>
        </div>
      </div>
    </template>

    <template slot="dropdown-label">
      {{ $t_locale('components/cockpit/automation/DropdownAutomationCampaignsTarget')('Title') }}
    </template>

    <template slot="modal-title">
      {{ $t_locale('components/cockpit/automation/DropdownAutomationCampaignsTarget')('Title') }}
    </template>

    <template slot="mobile-content">
      <div class="select-list">
        <div class="select-list__title">
          <i class="icon-gs-cog"></i>
          {{ $t_locale('components/cockpit/automation/DropdownAutomationCampaignsTarget')('Title') }}
        </div>
        <div class="select-list__items">
          <button
            class="dropdown-content__item"
            v-for="(target, index) in availableCampaigns"
            :key="index"
            @click="manageCampaigns(target.id)"
          >
            <AutomationCampaignTargetsName :target="target.id" :tag="target.tag"></AutomationCampaignTargetsName>
          </button>
        </div>
      </div>
    </template>
  </DropdownBase>
</template>

<script>
  import DropdownBase from "~/components/global/DropdownBase";
  import AutomationCampaignTargetsName from "~/components/automation/AutomationCampaignTargetsName.vue";
  export default {
    components: { DropdownBase, AutomationCampaignTargetsName },
    props: {
      availableTargets: {
        type: Array,
        default: () => [],
      },
      currentTargetName: {
        type: String,
        default: "",
      },
      tagType: {
        type: Function,
        require: true,
      }
    },
    computed: {
      availableCampaigns() {
        return this.availableTargets.map(campaign => {
          return {
            id: campaign.id,
            name: campaign.name,
            tag: this.tagType(campaign.id)
          }
        });
      }
    },
    methods: {
      manageCampaigns(targetId) {
        this.$router.push({
          name: 'cockpit-automation-campaigns-manage-target',
          params: { target: targetId }
        });
      },
    },
  };
</script>

<style lang="scss" scoped>
  .dropdown-automation-campaigns {
    .dropdown-content {
      border-radius: 3px;
      box-shadow: 0 0 6px 0 rgba(0, 0, 0, 0.16);
      background-color: $white;
      min-width: 250px;
      &__search-block {
        box-sizing: border-box;
        margin: 1rem 1rem 7px 1rem;
        border-bottom: 1px solid $grey;
      }
      &__search {
        border: 1px solid $grey;
        border-radius: 3px;
        display: flex;
        flex-direction: row;
        align-items: center;
        margin-bottom: 7px;
        i {
          font-size: 14px;
          margin: 0 7px;
        }
        input {
          border: none;
          margin: 7px 7px 7px 0px;
          outline: 0px;
          width: 100%;
        }
      }
      &__items {
        max-height: 40vh;
        overflow-y: auto;
      }
      &__item {
        padding: 7px 14px;
        color: $black;
        width: 100%;
        border: none;
        background-color: transparent;
        cursor: pointer;
        font-weight: 300;
        display: flex;
        flex-direction: row;
        align-items: center;
        &--active {
          color: $blue;
        }
        &:focus,
        &:hover {
          background-color: $very-light-grey;
          font-weight: 500;
        }
        span {
          flex: 1;
          text-align: left;
          font-size: 1rem;
          text-overflow: ellipsis;
          max-width: 100%;
          overflow: hidden;
          display: block;
          white-space: nowrap;
        }
      }
      &__item-icon {
        font-size: 10px;
        margin-left: 3px;
      }
    }
    :focus {outline:none;}
  }
::v-deep .dropdown-button{
  color: $orange;
  border: 1px solid $orange;
}
::v-deep .dropdown-button{
  color: $orange;
}
::v-deep .dropdown-button--active {
  color: $orange;
}
::v-deep .dropdown-button--open {
  color: $blue;
  border: 1px solid $blue;
}
::v-deep .dropdown-button--disabled {
  color: $grey;
}
::v-deep .dropdown-button__right i {
  font-size: 1rem;
  position: relative;
  top: 1px;
}
</style>