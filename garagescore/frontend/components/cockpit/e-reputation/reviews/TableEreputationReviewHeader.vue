<template>
  <div class="table__thead">
    <div class="table__header table__header--top">
      <div class="table__searchbar">
        <template v-if="hasBackArrow">
          <div class="table__back">
            <button @click="handleBack()">
              <i class="icon-gs-left-circle" />
              <span class="table__back__label">{{ $t_locale('components/cockpit/e-reputation/reviews/TableEreputationReviewHeader')("back") }}</span>
            </button>
          </div>
        </template>

        <Searchbar
          v-model="search"
          :filters="filters"
          :filtersDisabled="filtersDisabled"
          :options="filtersOptions"
          @filtersChange="onFiltersChange"
          @input="onSearchChange(search)"
          @searchClick="onSearch(search)"
        />
      </div>
    </div>
    <div class="table__header table-cockpit-header">
      <TableHeader :style="{ flex: 2.1 }" />
      <TableHeader center>
        <TableFiltersLabel
          filterKey="scoreFilter"
          :filters="filters"
          :filterOptions="filtersOptions"
        />
      </TableHeader>
      <TableHeader center>
        <TableFiltersLabel
          filterKey="source"
          :filters="filters"
          :filterOptions="filtersOptions"
        />
      </TableHeader>
      <TableHeader :style="{ flex: 0.05 }" />
      <TableHeader center>
        <TableFiltersLabel
          filterKey="publicReviewCommentStatus"
          :filters="filters"
          :filterOptions="filtersOptions"
        />
      </TableHeader>
    </div>
  </div>
</template>

<script>
import Searchbar from "~/components/ui/searchbar/Searchbar";
import TableFiltersLabel from "~/components/global/TableFiltersLabel";

import { debounce, isEqual } from "lodash";


export default {
  components: {
    Searchbar,
    TableFiltersLabel
  },

  props: {
    filtersDisabled: {
      type: Boolean,
      default: false,
    },
    reviewsLiveSearch: String,
    fetchReviews: {
      type: Function,
      required: true,
    },
    handleBack: {
      type: Function,
      required: true,
    },
    reviewFilters: {
      type: Object,
      required: true,
    },
    hasBackArrow: Boolean,
    locale: String,
    onSearch: {
      type: Function,
      required: true,
    },
    onSearchChange: {
      type: Function,
      required: true,
    },
    onReviewsFiltersChange: {
      type: Function,
      required: true,
    }
  },

  data() {
    return {
      search: this.reviewsLiveSearch,
      debouncedFetch: debounce(() => {
        this.fetchReviews({
          page: 1,
          append: false
        });
      }, 500),
      filtersOptions: [
        {
          key: "scoreFilter",
          label: this.$t_locale('components/cockpit/e-reputation/reviews/TableEreputationReviewHeader')("score5"),
          icon: "icon-gs-gauge-dashboard",
          values: [
            { label: this.$t_locale('components/cockpit/e-reputation/reviews/TableEreputationReviewHeader')("promotors"), value: "Promoter" },
            { label: this.$t_locale('components/cockpit/e-reputation/reviews/TableEreputationReviewHeader')("passives"), value: "Neutral" },
            { label: this.$t_locale('components/cockpit/e-reputation/reviews/TableEreputationReviewHeader')("detractors"), value: "Detractor" }
          ]
        },

        {
          key: "source",
          label: this.$tc_locale('components/cockpit/e-reputation/reviews/TableEreputationReviewHeader')("source", 1),
          icon: "icon-gs-web",
          values: [
            { label: "Google", value: "Google" },
            { label: "Facebook", value: "Facebook" },
            { label: "PagesJaunes", value: "PagesJaunes" }
          ].filter(
            s =>
              this.locale === "fr" ||
              s.value !== "PagesJaunes"
          )
        },

        {
          key: "publicReviewCommentStatus",
          label: this.$t_locale('components/cockpit/e-reputation/reviews/TableEreputationReviewHeader')("answers"),
          icon: "icon-gs-edit",
          values: [
            { label: this.$t_locale('components/cockpit/e-reputation/reviews/TableEreputationReviewHeader')("withAnswer"), value: "Approved" },
            { label: this.$t_locale('components/cockpit/e-reputation/reviews/TableEreputationReviewHeader')("withoutAnswer"), value: "NoResponse" },
            { label: this.$t_locale('components/cockpit/e-reputation/reviews/TableEreputationReviewHeader')("rejectedAnswer"), value: "Rejected" }
          ]
        }
      ]
    };
  },

  computed: {
    filters() {
      const filtersValue = {};
      const filters = [
        "scoreFilter",
        "source",
        "publicReviewCommentStatus"
      ];
      filters.map(f => {
        const stateValue = this.reviewFilters?.[f];
        if (stateValue) {
          filtersValue[f] = stateValue;
        }
      });

      return filtersValue;
    },
  },

  methods: {
    onFiltersChange(newFilters) {
      const sameFilters = isEqual(this.filters, newFilters);

      if (!sameFilters) {
        this.onReviewsFiltersChange({
          filters: newFilters
        });
        this.debouncedFetch();
      }
    },
  }
};
</script>
