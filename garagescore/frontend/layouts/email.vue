<template>
  <div class="email">
    <BaseLayout>
      <template #content>
        <Nuxt/>
      </template>
    </BaseLayout>
  </div>
</template>

<script>
  import BaseLayout from '~/components/emails/BaseLayout';

  export default {
    components: { BaseLayout },
  };
</script>


<style>
  /*{#*/
  /*Based on http://webdesign.tutsplus.com/tutorials/creating-a-future-proof-responsive-email-without-media-queries--cms-23919*/
  /*you should usually do not touch this file*/
  /*#}*/
  body {
    margin: 0 !important;
    padding: 0;
    background-color: #ffffff;
  }
  table {
    border-spacing: 0;
    font-family: sans-serif;
    color: #333333;
  }
  td {
    padding: 0;
  }
  img {
    border: 0;
  }
  div[style*="margin: 16px 0"] {
    margin:0 !important;
  }
  .wrapper {
    width: 100%;
    table-layout: fixed;
    -webkit-text-size-adjust: 100%;
    -ms-text-size-adjust: 100%;
  }
  .webkit {
    max-width: 600px;
    margin: 0 auto;
  }
  .outer {
    margin: 0 auto;
    width: 100%;
    max-width: 600px;
  }
  .full-width-image img {
    width: 100%;
    max-width: 600px;
    height: auto;
  }
  .inner {
    padding: 10px;
  }
  .inner-garage-logo {
    text-align: left;
  }
  .inner-garage-logo .logo-wrapper {
    display: inline-block;
    padding: 5px 10px;
  }
  .inner-garage-logo .logo-wrapper .garage-logo {
    margin: 0;
    padding: 0;
    height: 105px;
    width: auto;
  }
  p {
    margin: 0;
  }
  a {
    text-decoration: none;
  }
  .h1 {
    font-size: 21px;
    font-weight: bold;
    Margin-bottom: 18px;
  }
  .h2 {
    font-size: 18px;
    font-weight: bold;
    margin-bottom: 12px;
  }
  /* One column layout */
  .one-column .contents {
    text-align: left;
  }
  .one-column p, .one-column li {
    font-size: 14px;
  }
  .contents {
    width: 100%;
  }
  table {
    margin: 0 !important;
  }
</style>
