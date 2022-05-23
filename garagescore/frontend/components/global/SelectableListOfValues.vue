<template>
  <div class="list-values">
    <div class="list-values__content" v-for="item in items" :key="item.key">
      <CheckBox
        v-tooltip="{ content: tooltipMessage(item.value) }"
        :checked="selectedItems[item.key]"
        :label="item.value"
        :labelClass="labelDisabled(item.value)"
        :disabled="disabled && !itemsEnabled.includes(item.value)"
        @change="toggleSelection(item.key)"
        class="checkBox"
      />
      <div v-if="options && !item.brand" class="list-values__content__options">
        <Button
          v-if="canAccessOptions"
          v-tooltip="{ content: messsageAccessOptionsUpdate }"
          @click.stop="updateValue(item)"
          type="icon-btn"
        >
          <i class="icon-gs-edit" />
        </Button>
        <Button
          v-if="canDeleteOption"
          v-tooltip="{ content: messsageAccessOptionsDelete }"
          :disabled="!canAccessOptions"
          @click.stop="deleteValue(item)"
          type="icon-btn"
        >
          <i class="icon-gs-trash" />
        </Button>
      </div>
    </div>
    <div v-if="!items || !items.length" class="list-values__noresult">
      <span>{{$t_locale('components/global/SelectableListOfValues')('noResult')}}</span>
    </div>
  </div>
</template>

<script>
  import CheckBox from '~/components/ui/CheckBox.vue';
  import { UserRoles } from '~/utils/enumV2';
  import { measureText } from '~/util/stringTools.js'

  export default {
    name: 'ListOfValues',
    components: {
      CheckBox,
    },
    props: {
      items: {
        type: Array,
        default: () => [],
      },
      options: {
        type: Boolean,
        default: false,
      },
      updateOption: {
        type: Function,
        default: (item) =>
          console.warn('SelectableListOfValues :: updateOption its necesary if options props is true', item),
      },
      deleteOption: {
        type: Function,
        default: (tagName) =>
          console.warn('SelectableListOfValues :: deleteOption its necesary if options props is true', tagName),
      },
      updateSelectedItems: {
        type: Function,
        default: (selectedItems) =>
          console.error('SelectableListOfValues :: updateSelectedItems its not set ', selectedItems),
      },
      userRole: {
        type: String,
        default: '',
      },
      initialSelectedItems: {
        type: Array,
        default: () => [],
      },
      disabled: {
        type: Boolean,
        default: false
      },
      tooltipDisabled: {
        type: String,
        default: ''
      },
      itemsEnabled: {
        type: Array,
        default : () => []
      },
    },
    computed: {
      canDeleteOption() {
        return UserRoles.SUPER_ADMIN === this.userRole;
      },
      canAccessOptions() {
        return UserRoles.SUPER_ADMIN === this.userRole || UserRoles.ADMIN === this.userRole;
      },
      messsageAccessOptionsUpdate() {
        return UserRoles.USER === this.userRole ? this.$t_locale('components/global/SelectableListOfValues')('accessRole') : this.$t_locale('components/global/SelectableListOfValues')('update');
      },
      messsageAccessOptionsDelete() {
        return UserRoles.USER === this.userRole ? this.$t_locale('components/global/SelectableListOfValues')('accessRole') : this.$t_locale('components/global/SelectableListOfValues')('delete');
      },
    },
    mounted() {
      this.initializeSelectedItems();
    },
    data() {
      return {
        selectedItems: {},
        menuSelected: null,
      };
    },
    methods: {
      toggleSelection(itemKey) {
        if (this.selectedItems[itemKey]) {
          this.$delete(this.selectedItems, itemKey);
        } else {
          this.$set(this.selectedItems, itemKey, true);
        }
        this.updateSelectedItems(Object.keys(this.selectedItems));
      },
      toggleMenu(itemKey) {
        if (this.menuSelected === itemKey) {
          this.menuSelected = null;
        } else {
          this.menuSelected = itemKey;
        }
      },
      updateValue(item) {
        this.updateOption(item);
        this.menuSelected = null;
      },
      deleteValue(item) {
        this.deleteOption(item.value);
        this.menuSelected = null;
      },
      tooltipMessage(item){
        if(this.disabled && !this.itemsEnabled.includes(item)){
          return this.tooltipDisabled
        }
        return measureText(item, 16) > 170 ? item : '';
      },
      labelDisabled(item){
        return (
          this.disabled
          && !this.itemsEnabled.includes(item)
            ? 'gray'
            : 'black'
        );
      },
      initializeSelectedItems(){
        this.items
          .filter(
            (item) => (
              this.initialSelectedItems.includes(item.key)
              || this.initialSelectedItems.includes(item.value)
            )
          )
          .map((item) => this.$set(this.selectedItems, item.key, true));
        /*this.initialSelectedItems.forEach(item=>{
          this.$set(this.selectedItems, item, true);
        })*/
      }
    },
    watch: {
      initialSelectedItems(){
        this.selectedItems = {};
        this.initializeSelectedItems();
      }
    },
  };
</script>

<style lang="scss" scoped>
  .list-values {
    margin: 0;
    padding: 0;
    position: relative;
    &__content {
      position: relative;
      margin-bottom: 1rem;
      display: flex;
      align-items: center;
      justify-content: center;
      .checkBox {
        padding: 0.23rem 0;
      }
      &__check {
        color: $blue;
      }
      &__options {
        display: flex;
        justify-content: center;
      }
    }
    &__noresult{
      display: flex;
      justify-content: center;
      color:$black;
      font-size: 1rem;
    }
  }
</style>
