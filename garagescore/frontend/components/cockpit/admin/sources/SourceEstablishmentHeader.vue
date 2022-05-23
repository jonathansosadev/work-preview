<template>
  <div class="header">
    <div class="header__item header__item--small">{{ $t_locale('components/cockpit/admin/sources/SourceEstablishmentHeader')("establishment") }}</div>
    <div class="header__item header__item--center header__item--smaller">{{ $t_locale('components/cockpit/admin/sources/SourceEstablishmentHeader')("phone") }}</div>
    <div class="header__item header__item--center">{{ $t_locale('components/cockpit/admin/sources/SourceEstablishmentHeader')("emails") }}</div>
    <div class="header__actions"></div>
  </div>
</template>

<script>
export default {};
</script>

<style lang="scss" scoped>
.header {
  padding: 0 1rem;
  height: 50px;
  background-color: #fcfcfc;
  display: flex;
  align-items: center;
  border-bottom: 1px solid rgba($grey, .5);

  &__item {
    color: $black;
    font-size: 1rem;
    flex: 1;
    font-weight: bold;
    display: flex;

    &--center {
      justify-content: center;
      align-items: center;
    }

    &--small {
      flex: 0.42;
    }
    &--smaller {
      flex: 0.3;
    }
  }

  &__actions {
    width: 30px;
  }
}
</style>
