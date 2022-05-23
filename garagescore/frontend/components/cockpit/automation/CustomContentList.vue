<template>
  <div class="custom-content-list">
    <template v-if="customContents.length" >
      <div class="custom-content-list__header">
        <div class="custom-content-list__bloc custom-content-list__bloc__header custom-content-list__bloc__content">
          {{ $t_locale('components/cockpit/automation/CustomContentList')('header_content') }}
        </div>
        <div class="custom-content-list__bloc custom-content-list__bloc__header custom-content-list__bloc__start-date">
          {{ $t_locale('components/cockpit/automation/CustomContentList')('header_startDate') }}
        </div>
        <div class="custom-content-list__bloc custom-content-list__bloc__header custom-content-list__bloc__end-date">
          {{ $t_locale('components/cockpit/automation/CustomContentList')('header_endDate') }}
        </div>
        <div class="custom-content-list__bloc custom-content-list__bloc__header custom-content-list__bloc__status">
          {{ $t_locale('components/cockpit/automation/CustomContentList')('header_status') }}
        </div>
        <div class="custom-content-list__bloc custom-content-list__bloc__header custom-content-list__bloc__garages-amount">
          {{ $t_locale('components/cockpit/automation/CustomContentList')('header_garagesAmount') }}
        </div>
        <div class="custom-content-list__bloc custom-content-list__bloc__header custom-content-list__bloc__buttons">
        </div>
      </div>
      <div class="custom-content-list__line" v-for="customContent in displayDataCustomContents" @mouseleave="displayedCustomContentControls = null">
        <div class="custom-content-list__bloc custom-content-list__bloc__content">
          <div class="custom-content-list__bloc__content__label"> {{ customContent.displayName }} </div>
          <div class="custom-content-list__bloc__content__at"> {{ customContent.addedOrModifiedAt }} </div>
          <div class="custom-content-list__bloc__content__by"> {{ customContent.by }} </div>
        </div>
        <div class="custom-content-list__bloc custom-content-list__bloc__start-date">
          {{ customContent.startAt }}
        </div>
        <div class="custom-content-list__bloc custom-content-list__bloc__end-date">
          {{ customContent.endAt }}
        </div>
        <div class="custom-content-list__bloc custom-content-list__bloc__status">
          <StatusDiode class="custom-content-list__bloc__status__diode" :status="$t_locale('components/cockpit/automation/CustomContentList')(customContent.status)" :diode="customContent.status"/>
        </div>
        <div class="custom-content-list__bloc custom-content-list__bloc__garages-amount">
          {{ customContent.amountOfGarages }}
        </div>
        <div class="custom-content-list__bloc custom-content-list__bloc__buttons">
          <div class="custom-content-list__bloc__buttons__controls" 
            @mouseover="displayedCustomContentControls = customContent.id"
            >
            <Button type="icon-btn-md"><i class="icon-gs-others" /></Button>
            <!--  displayedCustomContentControls === customContent.id  -->
            <div class="custom-content-list__bloc__buttons__controls--floating" v-show="displayedCustomContentControls === customContent.id">
              <Button type="icon-btn-md" @click="onPreview(customContent.id)"><i class="icon-gs-eye" /></Button>
              <Button type="icon-btn-md" @click="onModify(customContent.id)" ><i class="icon-gs-edit" /></Button>
              <Button type="icon-btn-md" @click="onDelete(customContent.id)"><i class="icon-gs-trash" /></Button> 
            </div>
          </div>
        </div>
      </div>
    </template>
    <template v-else>
      <div class="custom-content-list__no-results">
        {{ $t_locale('components/cockpit/automation/CustomContentList')('noResults')}}
      </div>
    </template>
  </div>
</template>

<script>


export default {
  components: { },
  data() {
    return  {
      displayedCustomContentControls: null
    };
  },

  props: {
    customContents: Array,
    onModify: Function,
    onDelete: Function,
    onPreview: Function,
  },

  computed: {
    displayDataCustomContents() {
      return this.customContents.map((customContent) => {
        const modifiedAt = new Date(customContent.lastModifiedAt);
        const createdAt = new Date(customContent.createdAt);
        const isModified = modifiedAt.getTime() !== createdAt.getTime()
        const user = isModified ? customContent.lastModifiedBy : customContent.createdBy;
        const at = isModified ? modifiedAt : createdAt;
        const amountOfActiveGarages = (customContent.activeGarageIds && customContent.activeGarageIds.length) || 0
        const today = new Date();
        const startAt = customContent.startAt ? new Date(customContent.startAt) : null;
        const endAt = customContent.endAt ? new Date(customContent.endAt) : null;
        const isNotYetActive = startAt ? startAt.getTime() > today.getTime() : true;
        const isNotActiveAnymore = customContent.noExpirationDate ? false : endAt.getTime() < today.getTime();
        return {
          displayName: customContent.displayName,
          addedOrModifiedAt: this.$t_locale('components/cockpit/automation/CustomContentList')(isModified ? 'modifiedAt' : 'addedAt', { at: this.$dd(at, 'short') }),
          by: this.$t_locale('components/cockpit/automation/CustomContentList')('by', { user }),
          startAt: this.$dd(startAt, 'short'),
          endAt: customContent.noExpirationDate ? '' : this.$dd(endAt, 'short'),
          status: !isNotYetActive && !isNotActiveAnymore && amountOfActiveGarages > 0 ? 'success' : 'muted',
          amountOfGarages: amountOfActiveGarages,
          id: customContent.id
        }
      });
    }
  },

  methods: {
      displayCustomContentControls(customContentId) {
        this.displayedCustomContentControls = this.displayedCustomContentControls === customContentId ? null : customContentId
      }
  }
};
</script>

<style lang="scss" scoped>
.custom-content-list {
  width: 100%;
  display: flex;
  flex-direction: column;
  font-size: .857rem;
  padding: 0 .5rem;
  box-sizing: border-box;

  &__no-results {
    font-size: 1rem;
    margin-top: .7rem;
  }
  &__bloc {
    text-align: center;
    border-bottom: 1px solid rgba($grey, 0.5);
    padding: 1rem 0;
    display: flex;
    flex-direction: column;
    justify-content: center;
    flex-grow: 0;
    flex-shrink: 0;

    &__content {
      text-align: left;

      flex-basis: 33%;
      &__label {
        color: $black;
        font-size: 1rem;
        font-weight: bold;
        margin-bottom: 0.35rem;
        word-break: break-word;
      }
      &__at {
        margin-bottom: 0.35rem;
      }
    }
    &__start-date {
      flex-basis: 15%;
    }
    &__end-date {
      flex-basis: 15%;
    }
    &__status {
      flex-basis: 12%;
      
      &__diode {
        margin-left: calc(50% - 1.6rem);
        justify-content: flex-start!important;
      }
    }
    &__garages-amount {
      flex-basis: 15%;
    }
    &__buttons {
      display: flex;
      flex-basis: 10%;
      flex-direction: row;
      align-items: center;
      position: relative;

      &__controls {
        display: flex;
        position: relative;
        flex-direction: row;
        align-items: center;

        &--floating {
          display: flex;
          flex-direction: row;
          width: 7.4rem;
          align-items: center;
          top: 2.3rem;
          border-radius: 5px;
          position: absolute;
          padding: 0.4rem 0 .4rem .4rem;
          background-color: $white;
          box-shadow: 0 1px 10px 0 rgba($black, 0.16);
          right: 0.5rem;
        }
      }
    }
    &__header {
      padding: 0 0 0.5rem 0;
      font-size: .92rem; 
    }
  }
  &__header {
    display:flex;
    flex-direction: row;
    margin-top: 1rem;
  }
  &__line {
    display: flex;
    flex-direction: row;
  }
}

</style>
