<template>
  <div class="modal-complete-profile">
    <div class="modal-complete-profile__content">
      <div class="modal-complete-profile__title">
        <i class="modal-complete-profile__title-icon icon-gs-alert-warning-circle"/>
        <AppText tag="h1" class="modal-complete-profile__title-text">{{ $t_locale('components/global/ModalCompleteProfile')('missingInfo') }}</AppText>
      </div>
      <AppText 
        class="modal-complete-profile__text"
        tag="p"
        align="center"
      >
        {{ $t_locale('components/global/ModalCompleteProfile')('dearPartner') }}<br>
        {{ $t_locale('components/global/ModalCompleteProfile')('finalizeProfile') }}
      </AppText>
      <nuxt-link
        class="modal-complete-profile__button"
        :to="{ name: 'cockpit-admin-profile' }"
        @click.native="$store.dispatch('closeModal')"
      >
        <i class="modal-complete-profile__icon icon-gs-user"/>
        {{ $t_locale('components/global/ModalCompleteProfile')('confirm') }}
      </nuxt-link>
    </div>
  </div>
</template>


<script>
export default {
}
</script>

<style lang="scss" scoped>
.modal-complete-profile {
  background-color: $white;
  height: 100%;
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 1.5rem;
  box-sizing: border-box;
  border-radius: 5px;
  box-shadow: 0 25px 35px 0 rgba($black, .16);

  &__content {
    display: flex;
    align-items: center;
    flex-flow: column;
  }

  &__title {
    color: $black;
    margin-bottom: 2rem;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  &__title-text {
    font-size: 2rem;
    text-align: center;
  }

  &__title-icon {
    font-size: 1.5rem;
    margin-right: 0.5rem;
  }

  &__text {
    color: $dark-grey;
    line-height: 1.5;
    font-size: 1.2rem;
    max-width: 700px;
  }

  &__button {
    margin-top: 1.5rem;
    background-color: $orange;
    border-radius: 5px;
    color: $white;
    padding: 1rem;
    font-size: 1.2rem;
    text-decoration: none;
  }

  &__icon {
    font-size: 1.5rem;
    margin-right: 0.7rem;
  }
}
</style>
