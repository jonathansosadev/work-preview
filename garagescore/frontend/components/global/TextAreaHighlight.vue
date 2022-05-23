<template>
  <div>
    <Dropdown :active="false" type="phantom-orange" size="max-width" :caret="false" class="edit-select" ref="dropdown">
      <template slot="icon">
        <div class="edit-select__icon">
          <i class="icon-gs-at-symbol" />
        </div>
      </template>
      <template slot="label">
        <div class="button-dropdwon__label">
          {{ labelTag }}
        </div>
      </template>
      <template>
        <div class="edit-select__items custom-scrollbar">
          <div
            v-for="(item, index) in itemsTag"
            :key="index"
            @click="selectItem(item)"
            v-tooltip="{ content: getTooltip(item) }"
          >
            <span :class="getClassBindingDisabled(item)">{{ item.label }}</span>
          </div>
        </div>
      </template>
    </Dropdown>
    <div class="container-editor">
      <div class="backdrop-editor" ref="highlights">
        <div class="highlights-editor" v-html="highlights"></div>
      </div>
      <textarea
        title="comment"
        :placeholder="labelTextarea"
        class="textarea-editor"
        v-model="innerValue"
        @keyup="onInput"
        ref="editorTextArea"
        @scroll="scrollTextArea"
      ></textarea>
    </div>
  </div>
</template>
<script>
import { searchAndReplaceValues } from '~/util/filters.js';
export default {
  name: 'TextAreaHighlight',
  props: {
    value: {
      type: String,
      default: '',
    },
    itemsTag: {
      type: Array,
      default: '',
    },
    labelTag: {
      type: String,
      default: '',
    },
    labelTextarea: {
      type: String,
      default: '',
    },
    disabledTooltip: {
      type: String,
      default: '',
    },
  },
  data() {
    return {
      innerValue: this.value,
      positionCursor: 0,
      positionContainer: {},
      writting: false,
      highlights: '',
    };
  },
  watch: {
    value() {
      this.innerValue = this.value;
      if (!this.writting) {
        this.highlightText();
      }
      this.writting = false;
    },
    highlights() {
      this.$refs.highlights.scrollTop = this.$refs.editorTextArea.scrollTop;
    },
  },
  mounted() {
    this.highlightText();
  },
  methods: {
    scrollTextArea(evt) {
      this.$refs.highlights.scrollTop = this.$refs.editorTextArea.scrollTop;
    },
    selectItem(item) {
      if (item.disabled) return '';
      this.$refs.dropdown.closeDropdown();
      const position = this.$refs.editorTextArea.selectionStart;
      this.innerValue = `${this.innerValue.substring(0, position)}@${item.label} ${this.innerValue.substring(
        position,
        this.innerValue.length
      )}`;
      this.highlightText();
    },
    onInput(event) {
      this.$emit('input', event.target.value);
      this.highlightText();
      this.writting = true;
    },
    highlightText() {
      this.highlights = this.innerValue.slice();
      this.itemsTag.map(({ label }) => {
        if (this.innerValue.includes(label)) {
          const replaceValue = `<span class="highlight">@${label}</span>`;
          const searchValue = `@${label}`;
          this.highlights = searchAndReplaceValues(searchValue, replaceValue, this.highlights);
        }
      });
      this.$emit('input', this.innerValue);
    },
    getTooltip({ disabled }) {
      return disabled ? this.disabledTooltip : '';
    },
    getClassBindingDisabled({ disabled }) {
      return { disabled: disabled };
    },
  },
};
</script>
<style lang="scss" scoped>
.edit-select {
  position: relative;
  float: right;
  top: -3.3rem;
  left: 1rem;
  background: $white;
  &__icon {
    display: flex;
    justify-content: center;
    align-items: center;
    background: $orange;
    color: $white;
    padding: 0.3rem;
    border-radius: 3px;
  }
  &__items {
    display: block;
    position: absolute;
    background: $white;
    box-shadow: 0 0.1em 0.5em rgba($black, 0.16);
    border-radius: 5px;
    max-height: 200px;
    min-width: 160px;
    overflow-x: hidden;
    overflow-y: auto;
    right: 0.5rem;
    span {
      padding: 8px 14px;
      color: $black;
      width: 100%;
      border: none;
      background-color: transparent;
      cursor: pointer;
      font-weight: 300;
      display: flex;
      flex-direction: row;
      align-items: center;
      flex: 1;
      text-align: left;
      text-overflow: ellipsis;
      max-width: 100%;
      overflow: hidden;
      display: block;
      padding: 0.7rem 0.5rem;
      font-size: 1rem;
      white-space: nowrap;
      &:hover {
        background-color: $very-light-grey;
        cursor: pointer;
      }
    }
    .disabled {
      color: $grey;
      &:hover {
        background-color: $white;
        cursor: pointer;
      }
    }
  }
}
.container-editor,
.backdrop-editor,
.textarea-editor {
  width: 100%;
  height: 6rem;
}

.textarea-editor,
.highlights-editor {
  padding: 0.7rem;
  font-size: 0.92rem;
}

.container-editor {
  display: block;
  margin: 0 auto;
  transform: translateZ(0);
  -webkit-text-size-adjust: none;
  position: relative;
}

.backdrop-editor {
  position: absolute;
  z-index: 1;
  background-color: $white;
  border: 1px solid $grey;
  border-radius: 3px;
  overflow: auto;
  pointer-events: none;
  transition: transform 1s;
  box-sizing: border-box;
  line-height: 1.5;
}

.highlights-editor {
  white-space: pre-wrap;
  word-wrap: break-word;
  color: transparent;
  overflow: auto;
  ::v-deep.highlight {
    background: #e0e0e0;
    color: transparent;
  }
}

.textarea-editor {
  color: $dark-grey;
  display: block;
  position: absolute;
  z-index: 2;
  margin: 0;
  border-radius: 3px;
  background-color: transparent;
  border: 1px solid $grey;
  overflow: auto;
  resize: none;
  transition: transform 1s;
  box-sizing: border-box;
  line-height: 1.5;

  &::placeholder {
    color: $dark-grey;
  }
}

.textarea-editor::v-deep div {
  margin: 0.5rem 0;
}
</style>
