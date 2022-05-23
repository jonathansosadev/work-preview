<template>
  <ModalBase class="modal-remove-garage" type="danger">
    <template slot="header">
    </template>
    <template slot="body">
      <div class="modal-remove-garage__part">
        <AppText tag="p" class="modal-remove-garage__text">
          {{ $t_locale('components/cockpit/modals/ModalRemoveGarage')('disclaimer') }}<br><br>{{ $t_locale('components/cockpit/modals/ModalRemoveGarage')('continue') }}
        </AppText>
      </div>
    </template>
    <template slot="footer">
      <button class="btn red" v-on:click="closeModal()">{{ $t_locale('components/cockpit/modals/ModalRemoveGarage')('cancel') }}</button>&nbsp;
      <button class="btn green" v-on:click="removeGarage()">{{ $t_locale('components/cockpit/modals/ModalRemoveGarage')('confirm') }}</button>
    </template>
  </ModalBase>
</template>


<script>

export default {
  props: {
    garageId: { type: String },
    userId: { type: String }
  },
  computed: {
    connectAsLink() {
      return '';
    }
  },
  methods: {
    removeGarage(userId) {
      this.$store.dispatch('closeModal');
      //this.$store.dispatch('cockpit/admin/users/removeGarage', { userId: this.userId, garageId: this.garageId });
    },
    closeModal() {
      this.$store.dispatch('closeModal');
    }
  }
}
</script>

<style lang="scss" scoped>
.modal-remove-garage {
  width: 50rem;

  .btn {
    display: inline-block;
    padding: 6px 12px;
    margin-bottom: 0;
    font-size: 14px;
    font-weight: 400;
    line-height: 1.42857143;
    text-align: center;
    white-space: nowrap;
    vertical-align: middle;
    -ms-touch-action: manipulation;
    touch-action: manipulation;
    cursor: pointer;
    -webkit-user-select: none;
    -moz-user-select: none;
    -ms-user-select: none;
    user-select: none;
    background-image: none;
    border: 1px solid transparent;
    border-radius: 4px;
    color:white;
  }

  .red {
    background-color:$red;
  }

  .green {
    background-color:$green;
  }

  &__icon {
    font-size: 3rem;
    margin-right: 0.5rem;
    color: $blue;
  }

  &__part {
    display: flex;
    flex-flow: row;
    align-items: center;
  }

  &__text {
    font-size: 1.2rem;
  }
}
</style>
