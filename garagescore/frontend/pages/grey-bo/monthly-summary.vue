<template>
  <div id="app">
    <MonthlySummary
      :loading="loading"
      :results="results"
      :error="error"
      :userId="userId"
      :fetchUserLast12MonthlySummaries="fetchUserLast12MonthlySummaries"
    />
  </div>
</template>
<script>
import MonthlySummary from "~/components/grey-bo/MonthlySummary";

import {makeApolloQueries} from '~/util/graphql';

export default {
  name: "monthlysummary",
  layout: "greybo",
  components: {
    MonthlySummary,
  },
  data() {
    return {
      loading: false,
      results: [],
      error: '',
      userId: '',
    }
  },
  methods: {
    async fetchUserLast12MonthlySummaries(email) {
      try {
        const req = {
          name: 'reportLatestMonthlySummaries',
          args: {
            email
          },
          fields: `
            results {
              id
              createdAt
            }
            error
            userId
          `
        };
        this.loading = true;
        const queryResult = await makeApolloQueries([req]);
        const {data: {reportLatestMonthlySummaries}} = queryResult;
        this.loading = false;
        this.results = reportLatestMonthlySummaries.results || [];
        this.error = reportLatestMonthlySummaries.error || null;
        this.userId = reportLatestMonthlySummaries.userId || '';
      } catch (e) {
        return [];
      }
    }
  }
};
</script>
