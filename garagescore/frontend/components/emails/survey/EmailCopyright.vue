<template>
  <div>
    <p class="footer-element">
      {{ translatedCopyOne }}
      <br>
      <br>
      {{ translatedCopyTwo }}
      <a href="mailto:privacy@custeed.com">note@custeed.com</a>.
      <br>
      <br>
      {{ translatedCopyThree }}
      <a href="%tag_unsubscribe_url%">
        {{ $t_locale('components/emails/survey/EmailCopyright')("click") }}
      </a>.
      {{ translatedCopyFour }}
      <a href="mailto:privacy@custeed.com">privacy@custeed.com</a>.
      <br>
      <br>
      Copyright © {{ fullYear }} Custeed SAS
    </p>
    <br>
    <div id="_eoa_div"></div>
    <img
      id="_eoa_img"
      src="https://mDOh9Gcxwv.eoapxl.com/mDOh9Gcxwv/"
      style="height:1px !important;width:1px !important;border-width:0 !important;margin-top:0 !important;margin-bottom:0 !important;margin-right:0 !important;margin-left:0 !important;padding-top:0 !important;padding-bottom:0 !important;padding-right:0 !important;padding-left:0 !important;display:block;"
      alt=""
      title=""
      width="1"
      height="1"
    >
  </div>
</template>


<style>
  #_eoa_div, #_eoa_img {
    display:none;
  }

  @media print {
    #_eoa_div {
      background-image: url('https://mDOh9Gcxwv.eoapxl.com/mDOh9Gcxwv/P');
    }
  }

  div.OutlookMessageHeader,
  table.moz-email-headers-table,
  blockquote #_eoa_div,
  #mailContainerBody #_eoa_div {
    background-image:url('https://mDOh9Gcxwv.eoapxl.com/mDOh9Gcxwv/F')
  }

  p.footer-element {
    font-style: italic;
    font-size: 12px;
    color:#999;
  }
</style>

<script>
export default {
  layout() {
    return "email";
  },

  computed: {
    translatedCopyOne() {
      return this.$t_locale('components/emails/survey/EmailCopyright')(
        "copy1",
        {
          garage: this?.garage?.publicDisplayName,
          brand: "Custeed-GarageScore",
        },
      );
    },
    translatedCopyTwo() {
      return this.$t_locale('components/emails/survey/EmailCopyright')("copy2");
    },
    translatedCopyThree() {
      return this.$t_locale('components/emails/survey/EmailCopyright')(
        "copy3",
        {
          garage: this?.garage?.publicDisplayName,
          brand: "Custeed-GarageScore",
        },
      );
    },
    translatedCopyFour() {
      return this.$t_locale('components/emails/survey/EmailCopyright')("copy4");
    },
    garage() {
      return this.$store.getters.emailData("garage");
    },
    fullYear() {
      return new Date().getFullYear();
    }
  },
};
</script>
