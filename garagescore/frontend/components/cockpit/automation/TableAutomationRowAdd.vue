<template>
  <TableRow class="table-automation-row-add">
    <TableRowCell :style="{ flex: 2 }" :class="mobileOnlyClass">
      <div class="table-automation-row-add__create-box">
        <div class="table-automation-row-add__create" @click="openModal">
          <i class="icon-gs-add table-automation-row-add__create__icon"></i>
          {{ $t_locale('components/cockpit/automation/TableAutomationRowAdd')('create') }}
        </div>
      </div>
    </TableRowCell>
    <TableRowCell :style="{ flex: 7 }" :class="noMobileClass">
      <div class="table-automation-row-add__create-box">
        <div class="table-automation-row-add__create" @click="openModal">
          <i class="icon-gs-add table-automation-row-add__create__icon"></i>
          {{ $t_locale('components/cockpit/automation/TableAutomationRowAdd')('create') }}
        </div>
      </div>
    </TableRowCell>
    <TableRowCell background="grey" :style="{ flex: 1 }" :class="noMobileClass"></TableRowCell>
  </TableRow>
</template>

<script>
import CardGrey from "~/components/global/CardGrey.vue";

export default {
  components: { CardGrey },

  computed: {
    noMobileClass() {
      return 'table-automation-row-add__cell table-automation-row-add__cell--no-mobile';
    },
    mobileOnlyClass() {
      return 'table-automation-row-add__cell table-automation-row-add__cell--mobile-only'
    }
  },
  methods: {
    openModal() {
      console.error('WILL BE ADDED LATER');
      // TODOAnass : add new campaign modal 
      /*this.$store.dispatch("openModal", {
        component: "ModalAddCampaign",
        props: {}
      });*/
    }
  }
};
</script>


<style lang="scss" scoped>
$add-padding: 0px 1rem 0rem 0rem;

.table-automation-row-add {
  display: flex;
  flex-direction: row;

  &__cell {
    &--no-mobile {
      display: none !important;
    }
  }

  &__create-box {
    width: 100%;
    display: flex;
    padding: $add-padding;
    box-sizing: border-box;
  }

  &__create {
    flex-grow: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    color: $dark-grey;
    padding: 1rem;
    border: 1px dashed $grey;
    border-radius: 3px;
    cursor: pointer;
    &:hover {
      background-color: $light-grey;
    }

    &__icon {
      color: $dark-grey;
      font-size: 28px;
      margin-right: 7px;
    }
  }
}

@media (min-width: $breakpoint-min-md) {
  $add-padding: 1rem;

  .table-automation-row-add {
    &__create-box {
      padding: $add-padding;
    }

    &__cell {
      &--mobile-only {
        display: none !important;
      }
      &--no-mobile {
        display: flex !important;
      }
    }
  }
}
</style>
