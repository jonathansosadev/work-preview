<template>
  <div class="page-learn">
    <nuxt-child />
    <ElearningDashboard
      :resources-by-product="resourcesByProduct"
      :mark-resource-watched="markResourceWatched"
    />
  </div>
</template>

<script>
import { makeApolloQueries, makeApolloMutations } from "../../util/graphql";
import ElearningDashboard from "../../.custeedbook/newComponents/ElearningDashboard.vue";
export default {
  layout: "learn",
  components: { ElearningDashboard },

  methods: {
    markResourceWatched(url) {
      console.log(url);
      const resourceWatched = {
        name: "ElearningResourceWatched",
        args: { url },
        fields: "status"
      };
      makeApolloMutations([resourceWatched]);
    }
  },
  async asyncData({ req }) {
    const request = {
      name: "ConfigurationGetLearningResources",
      args: {},
      fields: `resourcesByProduct {
        product
        resources {
          title
          url
          thumbnail
          description
        }
      }
        `
    };
    const res = await makeApolloQueries([request], {
      documentCookies: req.headers && req.headers.cookie
    });
    return {
      resourcesByProduct:
        res.data &&
        res.data.ConfigurationGetLearningResources &&
        res.data.ConfigurationGetLearningResources.resourcesByProduct
    };
  }
};
</script>
