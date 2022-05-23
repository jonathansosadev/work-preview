<template>
  <Nuxt />
</template>

<script>
import { hotjar } from '~/util/externalScripts/hotjar';

export default {
  middleware: [
    "appMounted",
    "authenticated",
    "hasAccessToCockpit",
    "cockpit-router-params"
  ],

  beforeMount() {
    // Load hotjar ASAP
    if (process.env.hotjarId) {
      hotjar(process.env.hotjarId);
    }
  },

  head() {
    const script = [];
    const meta = [];
    const link = [];

    // Some meta
    meta.push({
      name: "google-signin-client_id",
      content: process.env.GOOGLE_OAUTH_CLIENT_ID
    });
    link.push({ rel: "manifest", href: "/manifest.json" });
    return { script, meta, link };
  }
};
</script>
