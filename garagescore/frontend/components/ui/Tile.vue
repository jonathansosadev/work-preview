
<template>
  <div class="tile">
    <slot />
  </div>
</template>


<script>
export default {};
</script>


<style lang="scss" scoped>
.tile {
  height: 100%;
  box-shadow: 0 0 3px 0 rgba(0, 0, 0, 0.16);
  box-sizing: border-box;
  padding: 1rem 1.5rem;
  padding-bottom: 10px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  background-color: white;
  border-radius: 5px;

  ::v-deep .title__icon {
    font-size: 1rem;
  }

  ::v-deep.title__title {
    font-size: 1.5rem;
  }
}

@media (min-width: $breakpoint-min-md) {
  .tile {
    ::v-deep .title__title {
      font-size: 1.2rem;
    }

    .stats {
      &:first-child {
        align-items: flex-start;

        .stats__label-value {
          text-align: left;
        }
      }

      &:last-child {
        align-items: flex-end;

        .stats__label-value {
          text-align: right;
        }
      }
    }

    ::v-deep .title__icon {
      font-size: 1.2rem;
    }

    .stats + .stats {
      margin-top: 1rem;
    }

    ::v-deep .title__part--icon {
      display: flex;
    }

    .stats {
      align-items: flex-start;

      &:first-child {
        align-items: flex-start;

        .stats__label-value {
          text-align: initial;
        }
      }

      &:last-child {
        align-items: flex-start;

        .stats__label-value {
          text-align: initial;
        }
      }
    }
  }
}
</style>
