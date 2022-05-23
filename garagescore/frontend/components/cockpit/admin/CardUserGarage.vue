<template>
  <Card class="card-user-garage">
    <div class="card-user-garage__header">
      <div class="card-user-garage__header-part">
        <Title icon="icon-gs-garage">{{$t_locale('components/cockpit/admin/CardUserGarage')("garages")}} ({{ count }})</Title>
      </div>
    </div>
    <div class="card-user-garage__body">
      <div class="card-user-garage__select" v-if="canAddGarages">
        <Multiselect
          :placeholder="$t_locale('components/cockpit/admin/CardUserGarage')('addGarage')"
          label="publicDisplayName"
          track-by="publicDisplayName"
          v-model="selectedGarages"
          :loading="false"
          :disabled="false"
          :hide-selected="false"
          :options="selectableGarages"
          :select-label="$t_locale('components/cockpit/admin/CardUserGarage')('click2Confirm')"
          >
        </Multiselect>
      </div>
      <div class="card-user-garage__item" v-for="garage in displayedGarages" :key="garage.id">
        <span class="card-user-garage__item-label">{{garage.publicDisplayName}}</span>
        <template v-if="canRemoveGarage(garage.id)">
          <button class="card-user-garage__phantom-button" @click="removeGarage(garage.id)" v-if="!isDeleteGaragePending(garage.id)"><i class="icon-gs-close card-user-garage__item-icon"/></button>
          <i class="icon-gs-loading card-user-garage__item-icon card-user-garage__item-icon--fw" v-else/>
        </template>
        <template v-else-if="isManagerOnThisGarage(garage.id)">
          <button @click="alert($t_locale('components/cockpit/admin/CardUserGarage')('cantDeleteUserAffected'))" class="card-user-garage__phantom-button card-user-garage__phantom-button--muted" :title="$t_locale('components/cockpit/admin/CardUserGarage')('cantDeleteUserAffected')"><i class="icon-gs-close card-user-garage__item-icon"/></button>
        </template>
        <template v-else-if="isLastGarageAvailable()">
          <button @click="alert($t_locale('components/cockpit/admin/CardUserGarage')('cantHaveZeroGarage'))" class="card-user-garage__phantom-button card-user-garage__phantom-button--muted" :title="$t_locale('components/cockpit/admin/CardUserGarage')('cantHaveZeroGarage')"><i class="icon-gs-close card-user-garage__item-icon"/></button>
        </template>
      </div>
      <div class="card-user-garage__footer">
      <Button type="phantom" @click="displayMore" v-if="garageDisplayCount < garages.length">
        <AppText tag="span" bold>{{$t_locale('components/cockpit/admin/CardUserGarage')("LoadMore")}}</AppText>
        <template name="left"><i class="icon-gs-down icon-fix" /></template>
      </Button>
    </div>
    </div>
  </Card>
</template>


<script>
export default {
  name: 'CardUserGarage',
  props: {
    garages: { type: Array, default: () => ([]) },
    garagesFromCurrentUser: { type: Array, default: () => ([]) },
    edit: Boolean,
    isGod: Boolean,
    defaultManagerGaragesIds: { type: Array, default: () => ([]) }
  },

  data() {
    return {
      selectedGarages: null,
      garageDisplayCount: 10,
      garageDeletePending: [],

      pending: {
        allGarage: false,
      },
    }
  },

  watch: {
    selectedGarages(value) {
      if (value !== null) {
        this.$store.dispatch('cockpit/admin/profile/addGarage', { garageId: value.id });
        this.selectedGarages = null;
      }
    }
  },

  methods: {
    displayMore() {
      this.garageDisplayCount += 10;
    },
    removeGarage(id) {
      this.garageDeletePending.push(id);
      this.$store.dispatch('cockpit/admin/profile/removeGarage', { garageId: id }).then(() => {
        this.garageDeletePending = this.garageDeletePending.filter((e) => e !== id);
      });
    },
    isDeleteGaragePending(garageId) {
      return this.garageDeletePending.find(item => item === garageId);
    },
    isManagerOnThisGarage(id) {
      return this.defaultManagerGaragesIds.find(i => i === id);
    },
    isLastGarageAvailable() {
      return this.garages.length <= 1;
    },
    alert(message) {
      alert(message);
    },
  },

  computed: {
    canAddGarages() {
      return !this.isGod && this.edit;
    },
    canRemoveGarage() {
      return (garageId) => (!this.isGod && this.edit && !this.isManagerOnThisGarage(garageId) && this.garages.length !== 1);
    },

    // selectableGarages are the two garages scopes merged together
    selectableGarages() {
      return this.garagesFromCurrentUser.filter((e) => !this.garages.find(g => g.id === e.id));
    },
    displayedGarages() {
      return this.garages.slice(0, this.garageDisplayCount);
    },

    willRemoveDefaultManagerGarage() {
      return this.defaultManagerGaragesIds.length > 0;
    },
    count() {
      if (this.isGod) {
        return this.$t_locale('components/cockpit/admin/CardUserGarage')('isGod');
      }
      return this.garages.length;
    }
  }
}
</script>

<style lang="scss">
$item-bcg: #f5f5f5;
$item-bdr: $light-grey;

.card-user-garage {
  max-width: 100%;
  box-sizing: border-box;
  &__header {
    display: flex;
    justify-content: flex-start;
    align-items: center;
    padding-bottom: 0.7rem;
    padding-left: 1rem;
    border-bottom: 1px solid rgba($grey, .7);
    overflow: hidden;
  }

  &__header-part + &__header-part {
    margin-left: 1rem;
  }

  &__header-part {
    display: flex;
    align-items: center;
  }

  &__header-toggle {
    margin-right: 1rem;
  }

  &__header-loading {
    margin-right: 0.25rem;
  }


  &__body {
    margin-top: .5rem;
    display: flex;
    flex-wrap: wrap;
  }

  &__select {
    min-width: 18rem;
    margin: 0.5rem;
  }


  &__item {
    border: 2px solid $item-bdr;
    background-color: $item-bcg;
    padding: 0.25rem 0.5rem;
    display: flex;
    justify-content: center;
    align-items: center;
    margin: 0.5rem;
    box-sizing: border-box;
    min-height: 40px; // vue-multiselect height
    border-radius: 20px;
  }

  &__item-label {
    font-size: 0.8rem;
    margin-right: 0.5rem;
    margin-left: 0.5rem;
    white-space: nowrap;
    user-select: none;
  }

  &__item-icon {
    margin: 0 0.5rem;
    font-size: 0.5rem;

    &--fw {
      font-size: 0.8rem;
    }
  }

  &__footer {
    display: flex;
    align-items: center;
    justify-content: center;

    .icon-fix {
      position: relative;
      top: 2px;
      padding-left: .2rem;
      font-size: 0.8rem;
    }
  }

  &__phantom-button {
    appearance: none;
    border: 0;
    background-color: transparent;
    padding: 0;
    cursor: pointer;
    display: flex;

    &--muted {
      opacity: 0.5;
      outline: none;
      cursor: default;
    }
  }
}
@media (max-width: $breakpoint-min-md) {
  .card-user-garage {
    &__header {
      padding-left: 0;
    }
  }
}
</style>
