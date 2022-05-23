<template>
  <ModalBase noScroll class="modal-make-surveys-previsualisation">
    <template slot="header-icon">
      <img class="modal-make-surveys-previsualisation__logo" src="/logo/logo-gs-picto.svg"/>
    </template>
    <template slot="header-title">
      <span >{{ $t_locale('components/cockpit/admin/surveys/ModalMakeSurveysPrevisualisation')('title') }}</span>
    </template>
    <template slot="header-subtitle">
      <span >{{ $t_locale('components/cockpit/admin/surveys/ModalMakeSurveysPrevisualisation')('subtitle') }}</span>
    </template>
    <template slot="body">
      <span class="modal-make-surveys-previsualisation__subject">
        <span class="modal-make-surveys-previsualisation__subject__title">
          {{ $t_locale('components/cockpit/admin/surveys/ModalMakeSurveysPrevisualisation')('subject') }}
        </span>
        <span class="modal-make-surveys-previsualisation__subject__content">
          {{ decode(subject) }}
        </span>
      </span>
      <div class="modal-make-surveys-previsualisation__iframe-holder custom-scrollbar">
        <div class="modal-make-surveys-previsualisation__iframe-holder__iframe-click-blocker"></div>
        <iframe
          class="modal-make-surveys-previsualisation__iframe-holder__iframe"
          frameborder="0"
          scrolling="no"
          ref="emailBody"
        ></iframe>
      </div>
    </template>
  </ModalBase>
</template>


<script>

export default {
  name: "ModalMakeSurveysPrevisualisation",
  props: {
    htmlBody: { type: String },
    subject: { type: String },
  },
  computed: {
  },
  mounted() {
    this.updateIFrame();
  },
  methods: {
    decode(str) {
      return str.replace(/&#([0-9]{1,3});/gi, function(match, numStr) {
        var num = parseInt(numStr, 10); // read num as normal number
        return String.fromCharCode(num);
      });
    },
    updateIFrame() {
      let elem = this.$refs.emailBody;
      let doc = elem.contentWindow.document;
      doc.open(); doc.write(this.htmlBody); doc.close();
      elem.style.height = elem.contentWindow.document.body.scrollHeight + 'px';
    }
  }
}
</script>

<style lang="scss" scoped>
.modal-make-surveys-previsualisation {
  &__logo {
    height: 3rem;
    width: 3rem;
  }

  &__part {
    line-height: 1.54;
  }
  &__footer {
    display: flex;
    justify-content: center;
    & Button {
      padding-left: 2rem;
      padding-right: 2rem;

      &:first-child {
        margin-right: 1rem;
      }
    }
  }

  &__subject {
    font-size: 1rem;
    margin-bottom: 1rem;
    display:block;
    color: $dark-grey;
    display: flex;
    flex-direction: column;

    &__title {
      color: $black;
      font-weight: 900;
      padding: 0 0 10px 1rem;
    }

    &__content {
      color: $black;
      background-color: rgba($grey, .25);
      border-radius: 5px;
      font-weight: 700;
      padding: .8rem 1rem;
    }
  }

  &__iframe-holder {
    display:flex;
    align-items: flex-start;
    justify-content: flex-start;
    align-content: flex-start;
    overflow:auto;
    position: relative;
    height: 60vh;
    max-height:60vh;

    &__iframe {
      border: none;
      width:645px;

    }
    &__iframe-click-blocker {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
    }
  }
}

@media screen and (max-width: calc(#{$breakpoint-max-md})) {
  .modal-make-surveys-previsualisation {
    &__iframe-holder {

      &__iframe {
        width: calc(100vw - 1rem);
      }
    }
  }
}
</style>
