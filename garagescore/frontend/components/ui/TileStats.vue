<template>
  <Tile class="tile-stats" :class="classBinding" small>
    <div class="tile-stats__part">
      <AppText tag="span" class="tile-stats__title"><slot name="title"/></AppText>
    </div>
    <div class="tile-stats__part tile-stats__part--column">
      <AppText tag="h1" class="tile-stats__value"><slot name="value"/></AppText>
      <AppText tag="span" type="muted" class="tile-stats__prc" v-if="$slots.prc"><slot name="prc"/></AppText>
    </div>
  </Tile>
</template>

<script>
export default {  
  props: {
    type: String,
    clickable: { type: Boolean, default: false },
  },

  computed: {
    classBinding() {
      return {
        'tile-stats--orange': this.type === 'orange',
        'tile-stats--success': this.type === 'success',
        'tile-stats--clickable': this.clickable,
      }
    },
  }
}
</script>

<style lang="scss" scoped>
.tile-stats {

  &__part {
    display: flex;
    justify-content: center;
    align-items: center;

    &--column {
      flex-direction: column;
    }
  }

  &--clickable {
    &:hover, &:focus {
      background-color: lighten($grey, 2%);
      cursor: pointer;
    }
  }


  &__value {
    display: block;
    font-size: 2.5rem;
    margin: 0;
    font-weight: 900;
    margin-bottom: 0.4rem;

    & + .tile-stats__prc {
      font-size: 0.8rem;
      border-top: 1px solid $grey;
      width: 50%;
      text-align: center;
      padding: 0.25rem;
      margin-top: 0.2rem;
    }
  }

  &__prc {
    display: block;
    font-size: 1.2rem;
    color: $black-grey;
  }

  &__title {
    font-size: 1rem;
    color: $black;
    font-weight: bold;
    margin-bottom: 0.5rem;
    text-align: center;
  }

  
  &--orange {
    ::v-deep.tile {
      border-color: $orange;
    }

    .tile-stats__value {
      color: $orange;
    }

    .tile-stats__title {
      color: $orange;
    }

    
    &.tile-stats--clickable {
      &:hover, &:focus {
        background-color: lighten($orange, 45%);
      }
    }
  }

  &--success {
    ::v-deep.tile {
      border-color: $green;
    }

    .tile-stats__value {
      color: $green;
    }

    .tile-stats__title {
      color: $green;
    }

    &.tile-stats--clickable {
      &:hover, &:focus {
        background-color: lighten($green, 60%);
      }
    }
  }
}
</style>
