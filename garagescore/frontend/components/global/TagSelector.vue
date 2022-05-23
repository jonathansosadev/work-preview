<template>
  <div>
    <!--tag parent-->
    <div class="tag-selector-component" >
      <div class="tag-selector-component__tag" v-for="(tag, index) in tags" :key="index">
        <div v-if="!tag.onlySubTags" v-tooltip="{ content: tag.tooltip }">
          <Button
            :icon="tag.icon"
            :content="tag.label"
            :type="getButtonType(tag.id)"
            @click="tagHandle(tag)"
            :size="size"
            :disabled="tag.disabled"
          />
        </div>
      </div>
    </div>
    <!--tag child field-->
    <div v-if="subTags.length > 0" class="subtag">
      <div v-for="(subtag, index) in subTags" :key="index">
        <div v-tooltip="{ content: subtag.tooltip }" :style="subtag.disabled && disabled">
          <Button
            :icon="subtag.icon"
            :content="subtag.label"
            :type="getButtonType(subtag.id)"
            @click="subtagHandle(subtag)"
            size="xs-options"
            :disabled="subtag.disabled"
            class="subtag__item"
          />
        </div>
      </div>
    </div>

  </div>
</template>

<script>
  export default {
    name: 'TagSelector',
    props: {
      tags: Array,
      onTagSelected: Function,
      savedTag: String,
      size:{
        type: String,
        default: 'md-options'
      }
    },

    mounted() {
      this.selectedTag = this.savedTag || null;
      if (this.savedTag) {
        const parentTag = this.tags.find((e) => e.subTags && e.subTags.find((t) => t.id === this.savedTag));
        if (parentTag) {
          this.temporarySelectedTag = parentTag.id;
          this.subTags = parentTag.subTags || [];
        }
      }
    },

    data() {
      return {
        selectedTag: null,
        temporarySelectedTag: null,
        currentTag: null,
        subTags: [],
      };
    },

    computed: {
      disabled() {
        return { "opacity": 0.5 };
      }
    },

    methods: {
      tagHandle(tag) {
        this.currentTag = tag;
        if (!tag.subTags) {
          this.temporarySelectedTag = null;
          this.selectedTag = tag.id;
          this.subTags = [];
        } else {
          this.temporarySelectedTag = tag.id;
          this.selectedTag = null;
          this.subTags = tag.subTags;
        }
      },
      subtagHandle(tag) {
        if (!tag.subTags) {
          this.selectedTag = tag.id;
        } else {
          this.selectedTag = null;
        }
      },
      getButtonType(id) {
        if (this.selectedTag === id || this.temporarySelectedTag === id) {
          return 'options-dark-active';
        }
       return 'options-dark';
      },
      cleanSelectedButton(){
        this.selectedTag = null
        this.temporarySelectedTag = null
      }
    },
    
    watch: {
      selectedTag(newValue, oldValue) {
        if (this.onTagSelected && newValue !== oldValue) {
          this.onTagSelected(newValue);
        }
      },
      tags(newValue) {
        const isOnlySubTags = newValue.find(tag => tag.onlySubTags);
        if (isOnlySubTags) {
          this.subTags = isOnlySubTags.subTags;
        }
      },
      savedTag: {
        immediate: true,
        handler(newVal) {
          this.selectedTag = newVal;
        }
      },
    }
  };
</script>

<style lang="scss" scoped>
.tag-selector-component {
  display: flex;
  position: relative;
  width: 100%;
}

.subtag {
  display: flex;
  margin-top: 1rem;
  cursor: pointer;
  flex-flow: row wrap;
  width: 100%;
  &__item {
    margin-bottom: 10px;
  }
}
</style>