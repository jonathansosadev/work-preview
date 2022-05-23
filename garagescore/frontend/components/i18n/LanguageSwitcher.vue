<template>
  <Dropdown active class="dropdown-language-switcher">
    <template slot="icon">
      <i class="icon-gs-language" />
    </template>
    <template slot="label">{{ label(currentLang) }}</template>
    <template>
      <DropdownContent :items="items" v-model="activeLang" />
    </template>
  </Dropdown>
</template>

<script>
// it s not really good pratice to represent a lang by a country ...import CountryFlag from '~/components/i18n/CountryFlag';

/** Dropdown to force language */
export default {
  components: {},

  data() {
    return {
      dropdownOpen: false
    };
  },

  computed: {
    availableLangs() {
      return (
        this.$store.state.locales && this.$store.state.locales.map(l => l.code)
      );
    },

    currentLang() {
      return this.$store.state.locale;
    },

    items() {
      return this.availableLangs.map(lang => ({
        key: lang,
        label: this.label(lang),
        value: lang
      }));
    },

    activeLang: {
      get() {
        return {
          key: this.currentLang,
          label: this.label(this.currentLang),
          value: this.currentLang
        };
      },

      set(item) {
        this.setCurrentLang(item.value);
        return item;
      }
    }
  },

  methods: {
    label(langCode) {
      const l = {};
      l["fr"] = "Français";
      l["es"] = "Castellano";
      l["ca"] = "Catalá";
      l["en"] = "English";
      l["de"] = "Deutsch";
      l["it"] = "Italiano";
      l["nl"] = "Nederlands";
      l["pt"] = "Português";
      l["sv"] = "Svenska";
      return l[langCode] || "???";
    },

    setCurrentLang(lang) {
      document.cookie = `gs-locale=${lang}`;
      // this.$store.commit('setLang', lang); doesnt work, we need to reload the page
      location.reload();
    },

    // return country code for displaying a flag
    country(lang) {
      return lang;
    }
  }
};
</script>

<style lang="scss" scoped>
.dropdown-language-switcher {
  ::v-deep .dropdown-button {
    background-color: transparent;
    border: none;
    min-width: unset;
    color: $blue;

    &__label {
      color: $blue !important;
    }
  }
}
</style>
