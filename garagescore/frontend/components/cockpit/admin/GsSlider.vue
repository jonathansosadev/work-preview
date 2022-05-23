<template>
  <div>
    <div class="slider" v-show="show">
      <div class="slides">
        <div class="overflow">
          <div
            :class="'inner ' + randomInnerClass"
            :style="{ marginLeft: '-' + currentSlide * 100 + '%' }"
          >
            <slot>
              Nothing to display
            </slot>
          </div>
          <!-- .inner -->
        </div>
        <!-- #overflow -->
      </div>
      <div class="slider-pagination" v-if="countSlides > 1">
        <button
          class="btn-nav orange-btn"
          style="float: left;"
          v-on:click="backwardSlide"
          v-if="currentSlide !== 0"
        >
          <div class="btn-content">
            Précédent
          </div>
        </button>
        <div style="display:inline-block;width: 43px;" v-else></div>
        <button
          class="btn-nav orange-btn"
          style="float: right;"
          v-on:click="forwardSlide"
          v-if="currentSlide !== countSlides - 1"
        >
          <div class="btn-content">
            Suivant
          </div>
        </button>
        <div style="display:inline-block;width: 43px;" v-else></div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    countSlides: {
      type: Number,
      required: true,
      twoWay: true,
      default: 1
    },
    goToLastElem: {
      type: Boolean,
      required: false,
      default: false
    },
    totalElements: {
      type: Number,
      required: false,
      default: 0
    }
  },
  data: function() {
    return {
      randomInnerClass: 'ric' + Math.floor(Math.random() * 1000000),
      currentSlide: 0,
      show: true,
      innerCSSRule: null,
      articleCSSRule: null
    }
  },
  mounted: function() {
    const innerProperties =
      '-webkit-transform: translateZ(0); \
      -moz-transform: translateZ(0); \
      -o-transform: translateZ(0); \
      -ms-transform: translateZ(0); \
      transform: translateZ(0); \
      -webkit-transition: all 800ms cubic-bezier(0.770, 0.000, 0.175, 1.000); \
      -moz-transition: all 800ms cubic-bezier(0.770, 0.000, 0.175, 1.000); \
      -o-transition: all 800ms cubic-bezier(0.770, 0.000, 0.175, 1.000); \
      -ms-transition: all 800ms cubic-bezier(0.770, 0.000, 0.175, 1.000); \
      transition: all 800ms cubic-bezier(0.770, 0.000, 0.175, 1.000); \
      -webkit-transition-timing-function: cubic-bezier(0.770, 0.000, 0.175, 1.000); \
      -moz-transition-timing-function: cubic-bezier(0.770, 0.000, 0.175, 1.000); \
      -o-transition-timing-function: cubic-bezier(0.770, 0.000, 0.175, 1.000); \
      -ms-transition-timing-function: cubic-bezier(0.770, 0.000, 0.175, 1.000); \
      transition-timing-function: cubic-bezier(0.770, 0.000, 0.175, 1.000); \
      width: 100%;'
    const articleProperties = 'float: left; width: 100%;'
    this.addStyleSheet('.slides .' + this.randomInnerClass, innerProperties)
    this.addStyleSheet(
      '.slides .' + this.randomInnerClass + ' article',
      articleProperties
    )
    this.innerCSSRule = this.getRule('.slides .' + this.randomInnerClass)
    this.articleCSSRule = this.getRule(
      '.slides .' + this.randomInnerClass + ' article'
    )
  },
  watch: {
    countSlides: function(val) {
      this.innerCSSRule.style.width = 100 * val + '%'
      this.articleCSSRule.style.width = 100 / val + '%'
      this.show = true
      if (this.currentSlide >= val) {
        this.currentSlide = val - 1
      }
    },
    totalElements: function(val, oldVal) {
      if (this.goToLastElem && val === oldVal + 1) {
        this.goSlide(this.countSlides - 1)
      }
    }
  },
  methods: {
    goSlide: function(n) {
      if (n < this.countSlides && n >= 0) {
        this.currentSlide = n
      }
    },
    forwardSlide: function() {
      if (this.currentSlide < this.countSlides - 1) {
        this.currentSlide++
      }
    },
    backwardSlide: function() {
      if (this.currentSlide > 0) {
        this.currentSlide--
      }
    },
    getStyleSheetByTitle(className) {
      const sheets = [...document.styleSheets]
      const sheet = sheets.find((sheet) => {
        if (!sheet.href) {
          const rules = [...sheet.rules];
          return rules.find(rule => rule.selectorText && rule.selectorText.split(',').map(sel => sel.trim()).includes(className))
        }
      });
      if (sheet) { return sheet }
      return null
    },
    getRule(name) {
      const sheet = this.getStyleSheetByTitle('.widget_component')
      if (!sheet) {
        throw new Error('slider sheet not found !')
      }
      const [...rules] = sheet.rules || sheet.cssRules
      const rule = rules.find(r => r.selectorText === name)
      if (rule) { return rule }

      return null
    },
    addStyleSheet(name, properties) {
      const sheet = this.getStyleSheetByTitle('.widget_component')
      if (!sheet) {
        throw new Error('css styleCheet not found')
      }
      sheet.insertRule(name + '{' + properties + '}', 0)
    }
  }
}
</script>

<style>
  /* don't scoped css style here, .widget_component use for find this stylesheet */
  .widget_component {
    width: 100%;
  }

  .overflow {
    width: 100%;
    overflow: hidden;
  }

  .slide-btn.active {
    background-color: #219ab5;
    ;
  }

  .slide-btn:hover {
    cursor: pointer;
  }

  .slide-btn.active:hover {
    cursor: default;
  }

  .slide-btn {
    background-color: #b6b6b6;
    border-radius: 5px;
    width: 10px;
    height: 10px;
    display: inline-block;
    margin: 0 2px;
  }

  .slider-pagination {
    padding: 10px 15px;
    display: inline-block;
    width: 100%;
    text-align: center;
    height: 55px;
    line-height: 35px;
    display: inline-block;
  }
</style>
