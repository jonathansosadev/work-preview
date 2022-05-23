Customized routing defined in nuxt.config.js to load 'hidden pages' (hidden because thery are not in pages/)

Example of reasons to customize routing:

- Root pages '/' share the same url between the apps (app, www, survey etc.) => We do not want to use the same 'pages/index.vue' for every apps

- Certificatte pages (garage/slug, garaje/slug, controle-technique/slug etc.) share the same vue => We do not want to multiply the pages files in pages/
