import Vue from 'vue'
import SearchInput from '~/components/global/SearchInput.vue'

const test = Vue.component("searchInputCB", {
  name: 'searchInputCB',
  render: function (createElement) {
    return createElement(
      'div',
      [
        createElement(SearchInput, {
          props: {
            placeholder: 'Rechercher un établissement',
            searchItems: this.searchItems
          },
        }),
        createElement('div', this.q)
      ]
    )
  },
  components: { SearchInput },
  data: function() {
		return {
			q: ''
		}
  },
  methods: {
    searchItems(text) {
      this.q = text
    }
  },
  
});

export default {
  component: test,
  props: [
  ],
  }
  