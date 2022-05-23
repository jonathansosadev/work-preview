<template>
  <html xmlns="http://www.w3.org/1999/xhtml">
  <head>
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
    <meta http-equiv="X-UA-Compatible" content="IE=edge" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title></title>
  </head>
  <body>
  <center class="wrapper">
    <div class="webkit">
      <table width="600" align="center" cellpadding="0" cellspacing="0" border="0">
        <tr>
          <td>
            <table class="outer" align="center">
              <tr>
                <td class="one-column">
                  <table width="100%">
                    <tr>
                      <td class="inner contents">
                        <table width="100%" border="0" cellspacing="0" cellpadding="0">
                          <tr>
                            <slot name="content"/>
                          </tr>
                        </table>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </div>
  </center>
  </body>
  </html>
</template>


<script>

  export default {
    components: { },
    methods: {
    },
    computed: {
    }
  }
</script>


<style lang="css" scoped>
  /*{#*/
  /*Based on http://webdesign.tutsplus.com/tutorials/creating-a-future-proof-responsive-email-without-media-queries--cms-23919*/
  /*you should usually do not touch this file*/
  /*#}*/

  /* Basics */
  body {
    margin: 0 !important;
    padding: 0;
    background-color: #ffffff;
  }
  table {
    border-spacing: 0;
    font-family: "Trebuchet MS";
    color: #333333;
    border-collapse: collapse;
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
    Margin: 0 auto;
    width: 100%;
    max-width: 600px;
  }
  .full-width-image img {
    width: 100%;
    max-width: 600px;
    height: auto;
  }
  .inner {
    /*padding: 10px;*/
  }
  p {
    Margin: 0;
  }
  a {
    text-decoration: underline;
  }
  .h1 {
    font-size: 21px;
    font-weight: bold;
    Margin-bottom: 18px;
  }
  .h2 {
    font-size: 18px;
    font-weight: bold;
    Margin-bottom: 12px;
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
  /*Two column layout*/
  .two-column {
    text-align: center;
    font-size: 0;
  }
  .two-column .column {
    display: inline-block;
    vertical-align: top;
    min-width: 50%;
  }

  .two-column .column1 {
    width: 100%;
    max-width: 180px;
  }
  .two-column .column2 {
    width: 100%;
    max-width: 420px;
  }

  /*Media Queries*/
  @media screen and (max-width: 400px) {
    /*.two-column .column,*/
    .two-column img {
      max-width: 160px !important;
    }
  }
</style>