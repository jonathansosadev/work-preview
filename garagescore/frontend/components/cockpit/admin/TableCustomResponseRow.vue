<template>
  <div>
    <TableRow>
      <TableRowCell class="table__first-cell display_content" :display="['sm']">
        <AppText type="muted " tag="p" v-html="deep(row, 'contentTemp')"> </AppText>
      </TableRowCell>
    </TableRow>
    <TableRow class="table-admin-response">
      <TableRowCell :style="{ flex: 2 }" :display="['md', 'lg']" class="display_content">
        <AppText type="muted" tag="p" v-html="deep(row, 'contentTemp')"> </AppText>
      </TableRowCell>
      <!-- rating -->
      <TableRowCell center :display="['sm', 'md']">
        <div class="icon-client">
          <i :class="deep(ratingCategories, `${deep(row, 'ratingCategories[0]')}.class`)" />
          <Badge
            v-if="deep(row, 'ratingCategories').length > 1"
            :valueBadge="`+${deep(row,'ratingCategories').length - 1}`"
            size="sm"
            class="icon-client__badge"
          />
        </div>
      </TableRowCell>
      <TableRowCell center :display="['lg']">
        <i
          v-for="ratingCategoryKey in deep(row, 'ratingCategories')"
          :key="ratingCategoryKey"
          :class="deep(ratingCategories, `${ratingCategoryKey}.class`)"
          v-tooltip="{ content: deep(ratingCategories, `${ratingCategoryKey}.title`) }"
        />
      </TableRowCell>
      <!-- end rating -->
      <!-- sources -->
      <TableRowCell center :display="['sm', 'md']">
        <div class="img-source" v-if="deep(row, 'sources').length">
          <img class="logo-source" :src="deep(sources, `${row.sources[0]}.src`)" />
          <Badge
            v-if="deep(row, 'sources').length > 1"
            :valueBadge="`+${deep(row, 'sources').length - 1}`"
            size="sm"
            class="img-source__badge"
          />
        </div>
        <div v-else>
          {{ '-' }}
        </div>
      </TableRowCell>
      <TableRowCell center :display="['lg']">
        <AppText type="muted" tag="p">
          <div v-if="deep(row, 'sources').length">
            <img
              v-for="sourceKey in deep(row, 'sources')"
              :key="sourceKey"
              class="logo-source"
              v-tooltip="{ content: deep(sources, `${sourceKey}.title`) }"
              :src="deep(sources, `${sourceKey}.src`)"
              :alt="deep(sources, `${sourceKey}.title`)"
            />
          </div>
          <div v-else>
            {{ '-' }}
          </div>
        </AppText>
      </TableRowCell>
      <!-- end sources -->
      <TableRowCell center>
        <AppText type="muted" tag="p">
          {{ getGaragesCountLabel }}
        </AppText>
      </TableRowCell>
      <TableRowCell center :display="['lg', 'md']">
        <AppText type="muted" tag="p">
          {{ mode }}
        </AppText>
      </TableRowCell>
      <TableRowCell center :display="['sm']">
        <AppText type="muted" tag="p">
          {{ modeShort }}
        </AppText>
      </TableRowCell>
      <TableRowCell center>
        <div class="table-admin-response__buttons">
          <div class="table-admin-response__buttons__controls">
            <Button
              :type="getSizeButton"
              icon="icon-gs-others"
              @click="setIdRow(row._id)"
            />

            <div class="table-admin-response__buttons__controls--floating" v-if="selectedRowId === deep(row, '_id')">
              <Button
                class="table-admin-response__action-list--item"
                :type="getSizeButton"
                v-tooltip="{ content: $t_locale('components/cockpit/admin/TableCustomResponseRow')('Update') }"
                @click="updateModelAnswer(row)"
              >
                <i class="icon-gs-edit" />
              </Button>
              <Button
                class="table-admin-response__action-list--item"
                :type="getSizeButton"
                v-tooltip="{ content: $t_locale('components/cockpit/admin/TableCustomResponseRow')('Delete') }"
                @click="confirmDeleteModelResponse(deep(row, '_id'), getGaragesCount)"
              >
                <i class="icon-gs-trash" />
              </Button>
            </div>
          </div>
        </div>
      </TableRowCell>
    </TableRow>
  </div>
</template>
<script>
import Badge from '~/components/ui/Badge.vue';
import { getDeepFieldValue } from "~/utils/object";
export default {
  components: {
    Badge,
  },
  props: {
    row: {
      type: Object,
      default: () => {}
    },
    confirmDeleteModelResponse: {
      type: Function,
      default: () => ({}),
    },
    updateModelAnswer: {
      type: Function,
      default: () => ({}),
    },
    setIdRow: {
      type: Function,
      default: () => ({}),
    },
    selectedRowId: {
      type: String,
      default: '',
    },
    garagesOptions: {
      type: Array,
      default: () => [],
    },
  },
  data() {
    return {
      deep: (object, fieldName) => getDeepFieldValue(object, fieldName),
      ratingCategories: {
        promoter: {
          title: 'Promoter',
          class: 'icon-gs-happy green-smile',
        },
        passive: {
          title: 'Passive',
          class: 'icon-gs-straight yellow-smile',
        },
        detractor: {
          title: 'Detractor',
          class: 'icon-gs-sad red-smile',
        },
      },
      sources: {
        DataFile: {
          title: 'Garagescore',
          src: '/e-reputation/GarageScore.svg',
        },
        Google: {
          title: 'Google',
          src: '/e-reputation/Google.svg',
        },
        Facebook: {
          title: 'Facebook',
          src: '/e-reputation/Facebook.svg',
        },
      },
    };
  },
  computed: {
    getGaragesCount() {
      return this.garagesOptions.filter((item) => this.deep(this.row, 'garageIds').includes(item.value)).length
    },
    getSizeButton() {
      return this.$mq === 'lg' ? 'icon-btn-md' : 'icon-btn';
    },
    getGaragesCountLabel() {
      if( this.getGaragesCount=== 0 || !this.deep(this.row, 'automated') ){
        return this.$t_locale('components/cockpit/admin/TableCustomResponseRow')('All')
      }
      return this.getGaragesCount;
    },
    mode() {
      return this.deep(this.row, 'automated') ? this.$t_locale('components/cockpit/admin/TableCustomResponseRow')('Automatic') : this.$t_locale('components/cockpit/admin/TableCustomResponseRow')('Manual');
    },
    modeShort() {
      return this.deep(this.row, 'automated') ? this.$t_locale('components/cockpit/admin/TableCustomResponseRow')('Automatic_short') : this.$t_locale('components/cockpit/admin/TableCustomResponseRow')('Manual');
    },
  },
};
</script>
<style lang="scss" scoped>
.display_content {
  white-space: pre-wrap;
  ::v-deep .highlightText{
    background: #e0e0e0;
    border-radius: 3px;
    padding: .2rem .25rem;
    font-weight: 700;
  }
}
.display_content::v-deep .title {
  font-weight: 700;
  font-size: 1.15rem;
  color: $black;
  margin-bottom: 0.714rem;
}
.display_content::v-deep .body {
  font-size: 0.929rem;
  color: $dark-grey;
  margin-bottom: 0.714rem;
  line-height: 1.62;
  margin-bottom: 0.714rem;
}
.display_content::v-deep .footer {
  font-size: 0.857rem;
  color: $dark-grey;
}
.table-admin-response {
  background-color: $white;
  // cursor: pointer;
  position: relative;
  .icon-client {
    display: flex;
    position: relative;
    &__badge {
      position: absolute;
      top: -8px;
      left: 14px;
    }
  }
  .img-source {
    display: flex;
    position: relative;
    &__badge {
      position: absolute;
      top: -8px;
      left: 14px;
    }
  }
  &__action-list {
    list-style: none;
    display: inline-flex;
    flex-flow: row;
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
        justify-content: center;
        align-items: center;
        border-radius: 3px;
        position: absolute;
        padding: 0.5rem 0 0.5rem 0.5rem;
        background-color: $white;
        box-shadow: 0 1px 10px 0 rgba($black, 0.1);
        margin-top: 5.5rem;
        z-index: 1;
        right: 0.5rem;
      }
      @media screen and (-ms-high-contrast: active), (-ms-high-contrast: none) {
        &--floating {
          margin-top: 1.5rem;
        }
      }

    }
  }
}
.red-smile {
  color: $red;
  margin: 0 5px;
  font-size: 18px;
}
.green-smile {
  color: $green;
  margin: 0 5px;
  font-size: 18px;
}
.yellow-smile {
  color: $yellow;
  margin: 0 5px;
  font-size: 18px;
}
.logo-source {
  width: 18px;
  margin: 0 5px;
}

// FIX FOR IE
@media screen and (-ms-high-contrast: active), (-ms-high-contrast: none) {
  ::v-deep .button {
    padding-left: 0.5rem;
    padding-right: 1.5rem;
  }
}
</style>
