<template>
  <div class="preview">
    <span class="preview__text" v-html="$t_locale('components/cockpit/admin/sources/SourcePreview')('text', { url, sourceType })" />
    <div class="preview__data" id="tooltipContainer">
      <span>{{ email }}</span>
      <Button
        type="grey"
        class="preview__data__copy-button"
        v-tooltip="{
          content: $t_locale('components/cockpit/admin/sources/SourcePreview')('copyEmail'),
          show: showTooltip.email,
          container: '#tooltipContainer',
          trigger: 'manual'
        }"
        @click="handleCopy('email')"
      >
        {{ $t_locale('components/cockpit/admin/sources/SourcePreview')("copy") }}
      </Button>
    </div>
    <div class="preview__data">
      <OvhPhone :phone="phone"/>
      <Button
        type="grey"
        class="preview__data__copy-button"
        @click="handleCopy('phone')"
        v-tooltip="{
          content: $t_locale('components/cockpit/admin/sources/SourcePreview')('copyPhone'),
          show: showTooltip.phone,
          container: '#tooltipContainer',
          trigger: 'manual'
        }"
      >
        {{ $t_locale('components/cockpit/admin/sources/SourcePreview')("copy") }}
      </Button>
    </div>
  </div>
</template>

<script>
  import OvhPhone from "~/components/cockpit/admin/sources/OvhPhone.vue";

  export default {
    components: { OvhPhone },
    props: {
      email: String,
      phone: String,
      url: String,
      sourceType: String
    },

    data() {
      return {
        showTooltip: { phone: false, email: false },
      };
    },

    methods: {
      handleCopy(type) {
        let value = this[type];
        if (type === 'phone') value = value.replace(/^00/, '+');
        navigator.clipboard.writeText(value);
        this.showTooltip[type] = true;
        window.setTimeout(() => {
          this.showTooltip[type] = false;
        }, 1000);
      }
    }
  };
</script>

<style lang="scss" scoped>
  .preview {
    padding: 21px 14px;
    background-color: #f5f5f5;
    &__text {
      font-size: 14px;
      color: $dark-grey;

      ::v-deep a {
        color: $blue;
        font-weight: bold;
      }
    }

    &__data {
      margin-top: 14px;
      border-radius: 3px;
      border: dashed 1px $dark-grey;
      display: flex;
      align-items: center;
      background-color: $white;
      padding: 5px 5px 5px 10px;
      span {
        font-size: 14px;
        color: $dark-grey;
      }
      &__copy-button {
        margin-left: auto;
        font-size: 14px;
        color: $white;
      }
    }
  }
</style>
