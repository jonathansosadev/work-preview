<template>
  <div class="campaign-editor">
    <editor-menu-bar :editor="editor" v-slot="{ commands, isActive }">
      <div class="campaign-editor__commands">
        <div class="campaign-editor__commands__colors">

          <button
            v-for="field in colorsFields"
            :key="field"
            class="campaign-editor__commands__button campaign-editor__commands__button__md"
            :style="colorPickerStyle(pickedColor[field].hex)"
            @click="toggleActiveColorPicker(field)"
          >
            <i class="icon-gs-geometric-square campaign-editor__commands__button__picker" />
            <AppText
              tag="span"
              type="muted"
              class="campaign-editor__commands__button__text"
            >
              {{ $t_locale('components/cockpit/automation/CampaignEditor')(`labelColorPicker_${field}`) }}
            </AppText>
          </button>

          <div v-show="activeColorPicker" class="campaign-editor__chrome-picker">
            <chrome-picker
              disable-alpha
              v-model="colorPickerColor"
              @cancel="toggleActiveColorPicker('none')"
            />
            <div class="campaign-editor__chrome-picker__commands">
              <Button class="chrome-picker__commands__button__validate" type="orange" @click="applyColor(commands)">{{ $t_locale('components/cockpit/automation/CampaignEditor')('validate') }}</Button>
              <Button class="chrome-picker__commands__button__cancel" type="phantom" @click="toggleActiveColorPicker('none')">{{ $t_locale('components/cockpit/automation/CampaignEditor')('cancel') }}</Button>
            </div>
          </div>
        </div>

        <div v-show="toggleCustomContent" class="campaign-editor__commands__text-modifiers">
          <!--
          <button
            class="campaign-editor__commands__button"
            :class="{ 'is-active': isActive.uppercase({ textTransform: 'uppercase' }) }"
            @click="commands.uppercase({ textTransform: 'uppercase' })"
          >
            <i class="icon-gs-uppercase" />
          </button>
          -->
          <button
            class="campaign-editor__commands__button"
            :class="{ 'is-active': isActive.bold() }"
            @click="commands.bold"
          >
            <i class="icon-gs-bold" />
          </button>

          <button
            class="campaign-editor__commands__button"
            :class="{ 'is-active': isActive.italic() }"
            @click="commands.italic"
          >
            <i class="icon-gs-italic" />
          </button>

          <button
            class="campaign-editor__commands__button"
            :class="{ 'is-active': isActive.underline() }"
            @click="commands.underline"
          >
            <i class="icon-gs-underline" />
          </button>

          <button
            class="campaign-editor__commands__button"
            :class="{ 'is-active': isActive.alignment({ textAlign: 'left' }) }"
            @click="commands.alignment({ textAlign: 'left' })"
          >
            <i class="icon-gs-left-align" />
          </button>

          <button
            class="campaign-editor__commands__button"
            :class="{ 'is-active': isActive.alignment({ textAlign: 'center' }) }"
            @click="commands.alignment({ textAlign: 'center' })"
          >
            <i class="icon-gs-center-align" />
          </button>

          <button
            class="campaign-editor__commands__button"
            :class="{ 'is-active': isActive.alignment({ textAlign: 'right' }) }"
            @click="commands.alignment({ textAlign: 'right' })"
          >
            <i class="icon-gs-right-align" />
          </button>

          <button
            class="campaign-editor__commands__button"
            :class="{ 'is-active': isActive.alignment({ textAlign: 'justify' }) }"
            @click="commands.alignment({ textAlign: 'justify' })"
          >
            <i class="icon-gs-justified" />
          </button>
        </div>

        <div v-show="toggleCustomContent" class="campaign-editor__commands__undo-redo">
          <button
            class="campaign-editor__commands__button"
            @click="commands.undo"
          >
            <i class="icon-gs-cancel" />
          </button>

          <button
            class="campaign-editor__commands__button"
            @click="commands.redo"
          >
            <i class="icon-gs-restore" />
          </button>
        </div>
      </div>
    </editor-menu-bar>

    <br v-show="toggleCustomContent">
    <h3>{{ $t_locale('components/cockpit/automation/CampaignEditor')('customContentTitle') }}</h3>

    <div class="action-button-body-flex">
      <p>{{ $t_locale('components/cockpit/automation/CampaignEditor')('addMarketingContent') }}</p>
      <Toggle v-model="toggleCustomContentEditor" />
    </div>

    <editor-content
      v-if="toggleCustomContent"
      class="campaign-editor__text-editor"
      :editor="editor"
      @input="updateContent"
    />
    <div
      v-if="toggleCustomContent && showCount && maxLength > 0"
      class="campaign-editor__char-count"
      :style="charCountStyle"
    >
      <span>
        <template v-if="tooFewCharacters && charCount > 0">{{ $t_locale('components/cockpit/automation/CampaignEditor')('tooFewCharacters', { amount: this.minLength }) }}</template>
      </span>
      <span class="count-character">
        {{ charCount }} / {{ maxLength }}
      </span>
    </div>
    <textarea
      v-if="showPreview"
      v-model="debugHtml"
      disabled
      style="margin-top: 1rem; height: 100px; width: 100%;"
    >
    </textarea>

    <div class="action-zone-wrap">
      <!--action button-->
      <div class="campaign-editor__buttons">
          <h3>{{ $t_locale('components/cockpit/automation/CampaignEditor')('action_button') }}</h3>
      </div>

      <div>
        <input class="button-input-text" type="text" v-model="inputButtonText" minlength="10" maxlength="80"/>
      </div>
      <div class="campaign-editor__char-count">
        <span class="danger-message">
          <template v-if="inputButtonText.length > 0 && inputButtonText.length < 10 ">{{ $t_locale('components/cockpit/automation/CampaignEditor')('tooFewCharacters', { amount: this.minLength }) }}</template>
        </span>
        <span class="count-character">
          {{ inputButtonText.length }} / 80
        </span>
      </div>

      <div class="action-button-body-flex">
        <p>{{ $t_locale('components/cockpit/automation/CampaignEditor')('redirection') }}</p>
        <Toggle v-model="toggleCustomUrl" />
      </div>

      <div v-if="actionToggleUrl">
        <input class="custom-input-url" type="text" v-model="inputCustomUrl" :placeholder="$t_locale('components/cockpit/automation/CampaignEditor')('hypertext')" />
      </div>

      <div class="danger-message">
        <p v-if="inputCustomUrl.length > 0 && actionToggleUrl && !customUrlValid">
          {{ $t_locale('components/cockpit/automation/CampaignEditor')('customUrlInvalid') }}
        </p>
        <p v-if="inputCustomUrl.length === 0 && actionToggleUrl">
          {{ $t_locale('components/cockpit/automation/CampaignEditor')('empty_url') }}
        </p>
      </div>
    </div>

  </div>
</template>


<script>

import { Editor, EditorContent, EditorMenuBar, Extension } from 'tiptap';
import Alignment from '~/components/automation/tiptap/extensions/TextAlign.js';
import Uppercase from '~/components/automation/tiptap/extensions/TextTransform.js';
import Textcolor from '~/components/automation/tiptap/extensions/TextColor.js';
import MaxSize from '~/components/automation/tiptap/extensions/MaxSize.js';
import VueColor from 'vue-color';
import { HardBreak } from 'tiptap-extensions';

var Chrome = VueColor.Chrome;

import {
  Heading,
  Bold,
  Italic,
  Underline,
  History,
  Focus,
} from 'tiptap-extensions'

export default {
  name: 'CampaignEditor',
  components: {
    EditorMenuBar,
    EditorContent,
    'chrome-picker': Chrome,
  },
  props: {
    text: {
      type: String,
      default: '',
    },
    themeColor: {
      type: String,
      default: '#f36233',
    },
    textColor: {
      type: String,
      default: '#000000',
    },
    showCount: {
      type: Boolean,
      default: true,
    },
    showPreview: {
      type: Boolean,
      default: false,
    },
    minLength: {
      type: Number,
      default: 10
    },
    maxLength: {
      type: Number,
      default: 150
    },
    onValidate: {
      type: Function,
      required: true
    },
    onCancel: {
      type: Function,
      required: true
    },
    isValid: {
      type: Boolean,
      required: true
    },
    updateActionToggle: {
      type: Function,
      required: true
    },
    updateCumtomUrl: {
      type: Function,
      required: true
    },
    customUrlValid: {
      type: Boolean,
      required: true
    },
    actionToggleUrl: {
      type: Boolean,
      required: true
    },
    customUrl: {
      type: String,
      default: '',
    },
    updateCustomButtonText: {
      type: Function,
      required: true
    },
    customButtonText: {
      type: String,
      default: '',
    },
    updateToggleCustomContent: {
      type: Function,
      required: true
    },
    toggleCustomContent: {
      type: Boolean,
      required: true
    },
  },
  data() {
    return {
      editor: new Editor({
        extensions: [
          new HardBreak(),
          new class extends Extension {
            keys() {
              return {
                Enter(state, dispatch, view) {
                  const { schema, doc, tr } = view.state

                  const hard_break = schema.nodes.hard_break
                  const transaction = tr.replaceSelectionWith(hard_break.create()).scrollIntoView()
                  view.dispatch(transaction)
                  return true
                }
              }
            }
          }(),

          new Heading({ levels: [1, 2, 3] }),
          new Bold(),
          new Italic(),
          new Underline(),
          new History(),
          new Alignment(),
          new Uppercase(),
          new Textcolor({ color: [ this.textColor ]}),
          new MaxSize({ maxSize: this.maxLength }),
          new Focus({
            className: 'has-focus',
            nested: true,
          }),
        ],
        onUpdate: this.update,
        autoFocus: true,
        content: '',
      }),
      debugHtml: '',
      activeColorPicker: false,
      pickedColor: {
        text: { hex: '#000000' },
        theme: { hex: '#f36233' },
      },
      colorPickerColor: { hex: '#000000' },
      showSource: false,
      inputCustomUrl: this.customUrl || '',
      inputButtonText: this.customButtonText || this.$t_locale('components/cockpit/automation/CampaignEditor')('default_button_text'),
    }
  },
  computed: {
    colorsFields() {
      if (this.toggleCustomContent) {
        return ['text', 'theme'];
      }
      return ['theme'];
    },
    toggleCustomUrl: {
      get () {
        return this.actionToggleUrl;
      },
      set (val) {
        this.updateActionToggle(val);
      }
    },
    toggleCustomContentEditor: {
      get () {
        return this.toggleCustomContent;
      },
      set (val) {
        this.updateToggleCustomContent(val);
        if (!val) {
          // erase content when toggle is off
          this.editor.setContent('');
        }
      }
    },
    charCount () {
      if (!this.editor) return 0;
      return this.editor.state.doc.textContent.length;
    },
    charCountStyle() {
      return {
        color: this.tooFewCharacters ? '#d04331' : '#434243'
      }
    },
    tooFewCharacters() {
      return this.editor.state.doc.textContent.length >= 0 && this.editor.state.doc.textContent.length < this.minLength
    },
    localValue: {
      get() {
        return this.text;
      },
      set(newValue) {
        const modifiedDatas = {
          themeColor: this.pickedColor.theme.hex,
          textColor: this.pickedColor.text.hex,
          text: newValue
        }
        this.$emit('input', modifiedDatas);
        this.$emit('change', modifiedDatas);
      }
    },
  },
  watch: {
    themeColor(newValue) {
      this.pickedColor.theme.hex = newValue;
    },
    inputCustomUrl(newValue) {
      this.updateCumtomUrl(newValue);
    },
    inputButtonText(newValue) {
      this.updateCustomButtonText(newValue);
    },
    actionToggleUrl(newValue) {
      if (!newValue) {
        this.inputCustomUrl = '';
      }
    }
  },
  mounted() {
    if (this.text) {
      this.editor.setContent(this.text);
    }
    if (this.themeColor) {
      this.pickedColor.theme.hex = this.themeColor;
    }
    if (this.textColor) {
      this.pickedColor.text.hex = this.textColor;
      this.colorPickerColor.hex = this.textColor
    }
  },
  beforeDestroy() {
    this.editor.destroy()
  },
  methods: {
    update(e) {
      this.localValue = e.getHTML();
      this.debugHtml = e.getHTML();
    },
    updateSource(e) {
      this.updateContent(e.target.value);
    },
    updateContent(content) {
      this.editor.setContent(content);
    },
    colorPickerStyle(color) {
      return {
        color: color,
        "background-color": `rgba(${color}, 0.15)`
      }
    },
    toggleActiveColorPicker(field) {
      if (this.pickedColor[field]) {
        this.activeColorPicker = field;
        this.colorPickerColor = this.pickedColor[field];
      } else {
        this.activeColorPicker = null;
      }
    },
    applyColor(commands) {
      if (this.activeColorPicker === 'text') {
        commands.textcolor({ color: this.colorPickerColor.hex });
      } else if (this.activeColorPicker === 'theme') {
        const modifiedDatas = {
          themeColor: this.colorPickerColor.hex,
          textColor: this.pickedColor.text.hex,
          text: this.text
        }
        this.$emit('input', modifiedDatas);
        this.$emit('change', modifiedDatas);
      }
      this.pickedColor[this.activeColorPicker] = this.colorPickerColor;
      this.activeColorPicker = false;
    }
  },
}
</script>

<style lang="scss" scoped>
.danger-message {
  color: $red;
}
.action-zone-wrap {
  margin-top: 1rem;
  border-top: 1px solid rgba($grey, .5);
}
.action-button-body-flex {
  margin: 1rem 0;
  display: flex;
  justify-content: space-between;
}
.button-input-text {
  width: 100%;
  height: 1.929rem;
  margin-bottom: 5px;
  border-radius: 5px;
  border: solid 2px $blue;
  font-weight: bolder;
  text-align: center;
}
.custom-input-url {
  width: 100%;
  margin-top: 1rem;
  height: 1.929rem;
  margin-bottom: 5px;
  border-radius: 5px;
  border: solid 2px $blue;
  color: $dark-grey;
}
.custom-input-url::placeholder {
  color: $grey;
}
.campaign-editor {
  
  &__chrome-picker {
    position: absolute;
    z-index: 3;

    &__commands {
      display: flex;
      transition: visibility 0.2s 0.4s, opacity 0.2s 0.4s;
      z-index: 3;
      width: 225px;
      height: 65px;
      background: $white;
      padding: 1rem;
      box-sizing: border-box;
      box-shadow: 0 0 2px rgba($black, .30), 0 4px 8px rgba($black, .30);
    }
  }
  &__buttons {
    display: flex;
    flex-direction: row;
    justify-content: flex-start;
  }
  &__commands {
    transition: visibility 0.2s 0.4s, opacity 0.2s 0.4s;
    margin-top: 0.5rem;
    margin-bottom: 0.5rem;

    &__colors {
      display: block;
    }

    &__text-modifiers {
      float: left;
      display: block;
    }

    &__undo-redo {
      float: right;
      display: block;
    }

    &__button {
      font-weight: bold;
      display: inline-flex;
      background: transparent;
      border: 0;
      color: $dark-grey;
      padding: .4rem;
      margin-right: 0.2rem;
      border-radius: 3px;
      cursor: pointer;

      &__md {
        margin-right: 1.5rem;

        &:hover {
        background-color: rgba($dark-grey, 0)!important;
      }
      }

      &__picker {
        border: 1px solid rgba($grey, .5);
        padding: 0.15rem .2rem;
        border-radius: 3px;
        font-size: 1.2rem;
        margin-right: .3rem;
      }

      &__text {
        position: relative;
        top: 3px;
      }

      & i {
        font-size: 1rem;
      }

      &:hover {
        background-color: rgba($dark-grey, 0.15);
      }

      &.is-active {
        color: $blue;
        background-color: rgba($blue, 0.15);
      }
    }

    &.is-hidden {
      visibility: hidden;
      opacity: 0;
    }

    &.is-focused {
      visibility: visible;
      opacity: 1;
      transition: visibility 0.2s, opacity 0.2s;
    }

    span#{&}__button {
      font-size: 1rem;
    }
  }

  &__char-count {
    color: $dark-grey;
    margin: 0.5rem 0;
    display: flex;
    justify-content: space-between;
  }

}

.has-focus {
  border-radius: 3px;
  border: 3px solid $blue;
  padding: 5px;
}
*,*:focus,*:hover{
  outline:none;
}
</style>

<style lang="scss">
// editor css
.campaign-editor {
  .count-character {
    text-align: right;
    color: $green;
  }
  &__text-editor {
    line-height: 1.5;
    font-size: 1rem;
    width: 25vw;

    p {
      padding: 5px;
      border-radius: 5px;
      border: 2px solid $blue;
      word-break: break-word;
      &:not(:first-child) {
        display: none;
      }

    }

    *, *:focus, *:hover {
      outline: none;
    }
  }
}
</style>
