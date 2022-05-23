<template>
  <div :class="'gs-garages-list-wrapper gs-garages-list-wrapper-' + (advancedMode ? 'advanced' : 'simple')">

    <div :class="'gs-garages-list-simple gs-garages-list-' + (advancedMode ? 'visible' : 'hidden')">
      <h4 class="gs-garages-list-title">Trouver un établissement
        <div class="checkbox pull-right gs-garages-list-advanced-onoff gs-garages-list-checkbox">
          <label class="gs-garages-list-checkbox-inner">
            <input class="gs-garages-list-checkbox-input" type="checkbox" v-model="advancedMode">
            <span class="gs-garages-list-advanced-onoff-text gs-garages-list-checkbox-text">Mode Avancé</span>
          </label>
        </div>
      </h4>
      <div class="gs-garages-list-form">

        <fieldset>
          <legend>Critères de recherche</legend>
          <!-- Filters -->
          <div class="gs-garages-list-form-group gs-garages-list-filters">
            <!-- Title That Toggle The Filters -->
            <div class="gs-garages-list-filters-title gs-garages-list-collapse-title"
                 @click="toggleCollapse('gs-garages-list-filters-content')">
              <span class="gs-garages-list-collapse-text">Filtres :</span>
              <span class="gs-garages-list-collapse-details" v-for="(detail,$index) in getDetails(filters)">
           {{ ($index > 0 ? ", " : "") + detail }}
        </span>
              <span  class="gs-garages-list-collapse-caret">&nbsp;
          <i :class="'icon-gs-' + (isCollapsed('gs-garages-list-filters-content') ? 'right-caret' : 'down-caret')"></i>
        </span>
            </div>
            <!-- Content Toggled By The Title Above -->
            <div class="gs-garages-list-filters-content" id="gs-garages-list-filters-content" gs-collapsed="true" gs-working="false">
              <div class="gs-garages-list-filters-content-inner" id="gs-garages-list-filters-content-inner">
                <!-- Switch Mode : And / Or -->
                <div class="gs-garages-list-filters-mode-wrapper">
                  <div class="radio gs-garages-list-checkbox">
                    <label class="gs-garages-list-checkbox-inner">
                      <input type="radio" class="gs-garages-list-checkbox-input"
                             name="gs-filters-mode" value="gs-filters-mode-and" v-model="filtersMode" checked>
                      <span class="gs-garages-list-checkbox-text">Filtres Cumulés ('Et' Logique)</span>
                    </label>
                  </div>
                  <div class="radio gs-garages-list-checkbox">
                    <label class="gs-garages-list-checkbox-inner">
                      <input type="radio" class="gs-garages-list-checkbox-input"
                             name="gs-filters-mode" value="gs-filters-mode-or" v-model="filtersMode">
                      <span class="gs-garages-list-checkbox-text">Filtres Indépendants ('Ou' Logique)</span>
                    </label>
                  </div>
                </div>
                <!-- Filters List -->
                <div class="gs-garages-list-filters-filters">
                  <div class="row">
                    <div class="col-xs-12 col-sm-12 col-md-6 col-lg-4" v-for="filter in filters">
                      <div class="checkbox gs-garages-list-checkbox">
                        <label class="gs-garages-list-checkbox-inner">
                          <input type="checkbox" class="gs-garages-list-checkbox-input" v-model="filter.on">
                          <span class="gs-garages-list-checkbox-text">{{ filter.name }}</span>
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Import Schemas -->
          <div class="gs-garages-list-form-group gs-garages-list-schemas">
            <!-- Title That Toggle The Schemas -->
            <div class="gs-garages-list-schemas-title gs-garages-list-collapse-title"
                 @click="toggleCollapse('gs-garages-list-schemas-content')">
              <span class="gs-garages-list-collapse-text">Schemas d'Import :</span>
              <span class="gs-garages-list-collapse-details" v-for="(detail,$index) in getDetails(schemas)">
           {{ ($index > 0 ? ", " : "") + detail }}
        </span>
              <span  class="gs-garages-list-collapse-caret">&nbsp;
          <i :class="'icon-gs-' + (isCollapsed('gs-garages-list-schemas-content') ? 'right-caret' : 'down-caret')"></i>
        </span>
            </div>
            <!-- Content Toggled By The Title Above -->
            <div class="gs-garages-list-schemas-content" id="gs-garages-list-schemas-content" gs-collapsed="true" gs-working="false">
              <div class="gs-garages-list-schemas-content-inner" id="gs-garages-list-schemas-content-inner">
                <!-- Schemas List -->
                <div class="gs-garages-list-schemas-schemas">
                  <div class="row">
                    <div class="col-xs-12 col-sm-12 col-md-6 col-lg-4" v-for="schema in schemas">
                      <div class="checkbox col-xs-4 gs-garages-list-checkbox">
                        <label class="gs-garages-list-checkbox-inner">
                          <input type="checkbox" class="gs-garages-list-checkbox-input" v-model="schema.on">
                          <span class="gs-garages-list-checkbox-text">{{ schema.name }}</span>
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Group AutoComplete -->
          <div class="gs-garages-list-form-group gs-garages-list-groups">
            <label :for="groupInputId" class="gs-garages-list-label-above-input">Nom du groupe</label>
            <div class="">
              <input type="text" class="form-control input-sm gs-garages-list-input" :id="groupInputId"
                     placeholder="Saisissez le nom du groupe..."
                     v-model="groupResearch" :disabled="loading">
            </div>
          </div>

          <!-- Garage AutoComplete -->
          <div class="form-group gs-garages-list-form-group gs-garages-list-garages">
            <label :for="garageInputId" class="gs-garages-list-label-above-input">Nom, id ou slug de l'établissement</label>
            <div class="">
              <input type="text" class="form-control input-sm gs-garages-list-input" :id="garageInputId"
                     placeholder="Saisissez le nom, l'id ou le slug de l'établissement..."
                     v-model="garageResearch" :disabled="loading">
            </div>
          </div>
        </fieldset>

        <fieldset class="gs-garages-list-last-fieldset">
          <legend>Résultats, informations &amp; navigation</legend>
          <!-- Information And Misc Actions -->
          <div class="gs-garages-list-form-group gs-garages-list-actions">

            <div class="gs-garages-list-actions-resume">
              "Je recherche {{ getResearchDescription() }}"
            </div>
            <div>
              Nombre de résultats :
              <span class="gs-garages-list-highlight">{{ currentGaragesSuggestions.length }}</span>
            </div>
            <div>
              Garage sélectionné :
              <span class="gs-garages-list-highlight">{{ getGarageFromSelectedGarage() }}</span>
            </div>
            <div>
              Position dans la boucle de navigation :
              <span class="gs-garages-list-highlight">{{ getCurrentGaragePosition() + " / " + currentGaragesSuggestions.length }}</span>
            </div>
            <div>
              <button type="button" class="btn btn-sm btn-primary gs-garages-btn-primary"
                      @click="loopThrough()" :disabled="currentGaragesSuggestions.length === 0">
                <i class="icon-gs-arrow-left"></i> Précédent
              </button>
              <button type="button" class="btn btn-sm btn-primary pull-right gs-garages-btn-primary"
                      @click="loopThrough(true)" :disabled="currentGaragesSuggestions.length === 0">
                Suivant <i class="icon-gs-arrow-right"></i>
              </button>
            </div>
          </div>
        </fieldset>


      </div>
    </div>
    <div :class="'gs-garages-list-advanced gs-garages-list-' + (advancedMode ? 'hidden' : 'visible')">
      <div class="gs-garages-list-form">
        <!-- Garage AutoComplete -->
        <div class="form-group gs-garages-list-form-group gs-garages-list-garages">
          <div class="checkbox pull-right gs-garages-list-advanced-onoff gs-garages-list-checkbox">
            <label class="gs-garages-list-checkbox-inner">
              <input class="gs-garages-list-checkbox-input" type="checkbox" v-model="advancedMode">
              <span class="gs-garages-list-advanced-onoff-text gs-garages-list-checkbox-text">Mode Avancé</span>
            </label>
          </div>

          <label :for="garageInputIdAdv" class="gs-garages-list-label-above-input">Nom, id ou slug de l'établissement</label>

          <div class="">
            <input type="text" class="form-control input-sm gs-garages-list-input" :id="garageInputIdAdv"
                   placeholder="Saisissez le nom, l'id ou le slug de l'établissement..."
                   v-model="garageResearchAdv" :disabled="loading">
          </div>
        </div>
      </div>
    </div>

  </div>

</template>

<script>
  import * as urls from '~/utils/urls';
  import { getRequest } from "~/util/gsTools";

  export default {
    data: function () {
      return {
        // DOM Data
        groupInputId: 'gs-garages-group-' + Math.floor(Math.random() * 10000),
        groupInputDom: null, // DOM Element Itself
        garageInputId: 'gs-garages-garage-' + Math.floor(Math.random() * 10000),
        garageInputDom: null, // DOM Element Itself
        garageInputIdAdv: 'gs-garages-garage-' + Math.floor(Math.random() * 10000),
        garageInputDomAdv: null, // DOM Element Itself
        // Inputs V-Model
        garageResearch: '',
        garageResearchAdv: '',
        groupResearch: '',
        // Autoselect Onselect Result
        selectedGroup: '',
        selectedGarage: '',
        // Suggestions Containers
        filtersSuggestions: {}, // All garages by filter x, y, z (arrays) formatted for suggestion
        schemasSuggestions: {}, // All garages by schema x, y, z (arrays) formatted for suggestion
        groupsSuggestions: {}, // All garages by group x, y, z (arrays) formatted for suggestion
        garagesSuggestions: [], // Special one, just all garages formatted for suggestion
        // Current Suggestions List
        currentGaragesSuggestions: [], // formatted (GarageName [Id] [Slug])
        currentGaragesSuggestionsAdv: [],
        // Environment Configuration
        loading: true,
        advancedMode: false,
        filtersMode: '', // And / Or
        collapseLoading: false, // Wether A Block Is Currently Being Collapsed / Expended
        // URLs For API / Ajax Calls
        fetchGaragesUrl: '{{ lib.client.url.getShortUrl("ADMIN_GARAGES_LIST_COMPONENT") }}',
        fetchSchemasUrl: '{{ lib.client.url.getUrlNamespace("DARKBO_IMPORT_SCHEMAS").GET_ALL }}',
        // API / Ajax Calls Results Containers
        garages: [], // unformatted
        groups: [], // unformatted
        schemas: [], // unformatted
        filters: [{ // We don't have any API call to retrieve filters, so we write them hard-mode style
          name: 'Garages Non-Branchés', value: 'unplugged', on: false,
          check: function (g) { return g.status !== 'RunningAuto'; }
        }, {
          name: 'Garages Branchés', value: 'plugged', on: false,
          check: function (g) { return g.status === 'RunningAuto'; }
        }, {
          name: 'Garages Non-Indexés', value: 'unindexed', on: false,
          check: function (g) { return g.hideDirectoryPage; }
        }, {
          name: 'Garages Indexés', value: 'indexed', on: false,
          check: function (g) { return !g.hideDirectoryPage; }
        }, {
          name: 'Garages Sans Groupes', value: 'no-group', on: false,
          check: function (g) { return !this.hasValidGroup(g); }.bind(this)
        }, {
          name: 'Garages Sans Schema d\'Import', value: 'no-import-chema', on: false,
          check: function (g) { return !this.hasValidSchema(g); }.bind(this)
        }, {
          name: 'Garages Avec Schema d\'Import Inconnu', value: 'non-valid-import-schema', on: false,
          check: function (g) { return this.hasValidSchema(g) && !this.schemasSuggestions[g.importSchema.path]; }.bind(this)
        }, {
          name: 'Garages Sans GooglePlaceId', on: false,
          check: function (g) { return !g.googlePlaceId; }
        }]
      };
    },
    props: {
      updated: {
        type: Function,
        required: true
      },
      excludedGarages: {
        type: Array,
        required: false,
        default: () => []
      },
      noMirrors: {
        type: Boolean,
        required: false,
        default: () => false
      }
    },
    // Called When The VueJs Component Is Ready, Before DOM
    created: function () {

    },
    // Called When The DOM Is Ready
    mounted: function () {
      var self = this;

      self.fetchGaragesUrl = urls.getShortUrl("ADMIN_GARAGES_LIST_COMPONENT");
      self.fetchSchemasUrl = urls.getUrlNamespace("DARKBO_IMPORT_SCHEMAS").GET_ALL;
      getRequest(self.fetchSchemasUrl, function (errSchemas, fetchedImportSchemas) {
        if (errSchemas) {
          alert('Unable to retrieve Import Schemas List :(\n' + errSchemas);
        } else {
          self.schemas = fetchedImportSchemas;
          getRequest(self.fetchGaragesUrl, function (errGarages, fetchedGarages) {
            if (errGarages) {
              alert('Unable to retrieve Garages List :(\n' + errGarages);
            } else {
              self.garages = fetchedGarages;
              if (self.excludedGarages.length > 0) {
                self.garages = self.garages.filter(e => (self.excludedGarages.map(g => g.id).indexOf(e.id) === -1));
              }
              if (self.noMirrors) {
                self.garages = fetchedGarages.filter(e => e.annexGarageId === null);
              }
              self.createAutoCompletes();
              self.generateData();
              self.loading = false;
            }
          });
        }
      });
    },
    methods: {
      createAutoCompletes: function() {
        var self = this;
        const autoComplete=function(){function e(e){function t(e,t){return e.classList?e.classList.contains(t):new RegExp("\\b"+t+"\\b").test(e.className)}function o(e,t,o){e.attachEvent?e.attachEvent("on"+t,o):e.addEventListener(t,o)}function s(e,t,o){e.detachEvent?e.detachEvent("on"+t,o):e.removeEventListener(t,o)}function n(e,s,n,l){o(l||document,s,function(o){for(var s,l=o.target||o.srcElement;l&&!(s=t(l,e));)l=l.parentElement;s&&n.call(l,o)})}if(document.querySelector){var l={selector:0,source:0,minChars:3,delay:150,offsetLeft:0,offsetTop:1,cache:1,menuClass:"",renderItem:function(e,t){t=t.replace(/[-\/\\^$*+?.()|[\]{}]/g,"\\$&");var o=new RegExp("("+t.split(" ").join("|")+")","gi");return'<div class="autocomplete-suggestion" data-val="'+e+'">'+e.replace(o,"<b>$1</b>")+"</div>"},onSelect:function(){}};for(var c in e)e.hasOwnProperty(c)&&(l[c]=e[c]);for(var a="object"==typeof l.selector?[l.selector]:document.querySelectorAll(l.selector),u=0;u<a.length;u++){var i=a[u];i.sc=document.createElement("div"),i.sc.className="autocomplete-suggestions "+l.menuClass,i.autocompleteAttr=i.getAttribute("autocomplete"),i.setAttribute("autocomplete","off"),i.cache={},i.last_val="",i.updateSC=function(e,t){var o=i.getBoundingClientRect();if(i.sc.style.left=Math.round(o.left+(window.pageXOffset||document.documentElement.scrollLeft)+l.offsetLeft)+"px",i.sc.style.top=Math.round(o.bottom+(window.pageYOffset||document.documentElement.scrollTop)+l.offsetTop)+"px",i.sc.style.width=Math.round(o.right-o.left)+"px",!e&&(i.sc.style.display="block",i.sc.maxHeight||(i.sc.maxHeight=parseInt((window.getComputedStyle?getComputedStyle(i.sc,null):i.sc.currentStyle).maxHeight)),i.sc.suggestionHeight||(i.sc.suggestionHeight=i.sc.querySelector(".autocomplete-suggestion").offsetHeight),i.sc.suggestionHeight))if(t){var s=i.sc.scrollTop,n=t.getBoundingClientRect().top-i.sc.getBoundingClientRect().top;n+i.sc.suggestionHeight-i.sc.maxHeight>0?i.sc.scrollTop=n+i.sc.suggestionHeight+s-i.sc.maxHeight:0>n&&(i.sc.scrollTop=n+s)}else i.sc.scrollTop=0},o(window,"resize",i.updateSC),document.body.appendChild(i.sc),n("autocomplete-suggestion","mouseleave",function(){var e=i.sc.querySelector(".autocomplete-suggestion.selected");e&&setTimeout(function(){e.className=e.className.replace("selected","")},20)},i.sc),n("autocomplete-suggestion","mouseover",function(){var e=i.sc.querySelector(".autocomplete-suggestion.selected");e&&(e.className=e.className.replace("selected","")),this.className+=" selected"},i.sc),n("autocomplete-suggestion","mousedown",function(e){if(t(this,"autocomplete-suggestion")){var o=this.getAttribute("data-val");i.value=o,l.onSelect(e,o,this),i.sc.style.display="none"}},i.sc),i.blurHandler=function(){try{var e=document.querySelector(".autocomplete-suggestions:hover")}catch(t){var e=0}e?i!==document.activeElement&&setTimeout(function(){i.focus()},20):(i.last_val=i.value,i.sc.style.display="none",setTimeout(function(){i.sc.style.display="none"},350))},o(i,"blur",i.blurHandler);var r=function(e){var t=i.value;if(i.cache[t]=e,e.length&&t.length>=l.minChars){for(var o="",s=0;s<e.length;s++)o+=l.renderItem(e[s],t);i.sc.innerHTML=o,i.updateSC(0)}else i.sc.style.display="none"};i.keydownHandler=function(e){var t=window.event?e.keyCode:e.which;if((40==t||38==t)&&i.sc.innerHTML){var o,s=i.sc.querySelector(".autocomplete-suggestion.selected");return s?(o=40==t?s.nextSibling:s.previousSibling,o?(s.className=s.className.replace("selected",""),o.className+=" selected",i.value=o.getAttribute("data-val")):(s.className=s.className.replace("selected",""),i.value=i.last_val,o=0)):(o=40==t?i.sc.querySelector(".autocomplete-suggestion"):i.sc.childNodes[i.sc.childNodes.length-1],o.className+=" selected",i.value=o.getAttribute("data-val")),i.updateSC(0,o),!1}if(27==t)i.value=i.last_val,i.sc.style.display="none";else if(13==t||9==t){var s=i.sc.querySelector(".autocomplete-suggestion.selected");s&&"none"!=i.sc.style.display&&(l.onSelect(e,s.getAttribute("data-val"),s),setTimeout(function(){i.sc.style.display="none"},20))}},o(i,"keydown",i.keydownHandler),i.keyupHandler=function(e){var t=window.event?e.keyCode:e.which;if(!t||(35>t||t>40)&&13!=t&&27!=t){var o=i.value;if(o.length>=l.minChars){if(o!=i.last_val){if(i.last_val=o,clearTimeout(i.timer),l.cache){if(o in i.cache)return void r(i.cache[o]);for(var s=1;s<o.length-l.minChars;s++){var n=o.slice(0,o.length-s);if(n in i.cache&&!i.cache[n].length)return void r([])}}i.timer=setTimeout(function(){l.source(o,r)},l.delay)}}else i.last_val=o,i.sc.style.display="none"}},o(i,"keyup",i.keyupHandler),i.focusHandler=function(e){i.last_val="\n",i.keyupHandler(e)},l.minChars||o(i,"focus",i.focusHandler)}this.destroy=function(){for(var e=0;e<a.length;e++){var t=a[e];s(window,"resize",t.updateSC),s(t,"blur",t.blurHandler),s(t,"focus",t.focusHandler),s(t,"keydown",t.keydownHandler),s(t,"keyup",t.keyupHandler),t.autocompleteAttr?t.setAttribute("autocomplete",t.autocompleteAttr):t.removeAttribute("autocomplete"),document.body.removeChild(t.sc),t=null}}}}return e}();!function(){"function"==typeof define&&define.amd?define("autoComplete",function(){return autoComplete}):"undefined"!=typeof module&&module.exports?module.exports=autoComplete:window.autoComplete=autoComplete}();

        self.garageInputDom = document.getElementById(self.garageInputId);
        self.garageInputDomAdv = document.getElementById(self.garageInputIdAdv);
        self.groupInputDom = document.getElementById(self.groupInputId);
        new autoComplete({
          selector: '#' + this.groupInputId,
          minChars: 0,
          cache: false,
          menuClass: 'gs-garages-list-suggestions-menu',
          source: function (token, suggest) {
            var res = [];

            for (var i = 0; i < self.groups.length; ++i) {
              if (self.isMatching(self.groups[i], token)) {
                res.push(self.groups[i]);
              }
            }
            suggest(res);
          },
          onSelect: function (event, token) {
            event.preventDefault();
            event.stopPropagation();
            self.selectedGroup = token;
            self.groupResearch = token;
            window.setTimeout(function() {
              self.groupInputDom.blur();
            }, 200);
          }
        });
        new autoComplete({
          selector: '#' + this.garageInputId,
          minChars: 0,
          cache: false,
          menuClass: 'gs-garages-list-suggestions-menu',
          source: function (token, suggest) {
            suggest(self.currentGaragesSuggestions);
          },
          onSelect: function (event, token) {
            event.preventDefault();
            event.stopPropagation();
            self.selectedGarage = token;
            self.garageInputDom.value = self.garageResearch;
            self.updated(token.replace('[', '~').replace(']', '~').split('~')[1]);
            window.setTimeout(function() {
              self.garageInputDom.blur();
            }, 200);
          }
        });
        new autoComplete({
          selector: '#' + this.garageInputIdAdv,
          minChars: 0,
          cache: false,
          menuClass: 'gs-garages-list-suggestions-menu',
          source: function (token, suggest) {
            suggest(self.currentGaragesSuggestionsAdv);
          },
          onSelect: function (event, token) {
            event.preventDefault();
            event.stopPropagation();
            self.selectedGarage = token;
            self.garageInputDomAdv.value = self.garageResearchAdv;
            self.updated(token.replace('[', '~').replace(']', '~').split('~')[1]);
            window.setTimeout(function() {
              self.garageInputDomAdv.blur();
            }, 200);
          }
        });
      },
      // Generate The Suggestions & Data
      generateData: function () {
        this.generateSchemas(); // First we NEED to generate schemas from Ajax / API call raw result
        this.generateFilters(); // And we also NEED to generate filters list from filters objects
        this.generateSuggestions(); // THEN we can loop through garages and generate suggestions
        this.setWatchers(); // Put watchers and data and regenerate final suggestions each time
        this.currentGaragesSuggestions = this.garagesSuggestions;
        this.currentGaragesSuggestionsAdv = this.garagesSuggestions;
      },
      generateSchemas: function () {
        var oldSchemas = this.schemas;

        this.schemas = [];
        for (var i = 0; i < oldSchemas.length; ++i) {
          this.schemas.push({ name: oldSchemas[i], value: oldSchemas[i], on: false });
          this.schemasSuggestions[this.schemas[i].value] = []; // Will contain garages that matche this schema
        }
      },
      generateFilters: function () {
        for (var i = 0; i < this.filters.length; ++i) {
          this.filtersSuggestions[this.filters[i].value] = []; // Will contain garages that matche this filter
        }
      },
      generateSuggestions: function () {
        for (var i = 0; i < this.garages.length; ++i) {
          this.addGarageToGaragesSuggestions(this.garages[i]);
          this.tryAddGarageToGroupsSuggestions(this.garages[i]);
          this.tryAddGarageToSchemasSuggestions(this.garages[i]);
          this.tryAddGarageToFiltersSuggestions(this.garages[i]);
        }
      },
      addGarageToGaragesSuggestions: function (g) {
        this.garagesSuggestions.push(this.formatSuggestion(g)); // The 'all garages' suggestion
      },
      tryAddGarageToGroupsSuggestions: function (g) {
        if (this.hasValidGroup(g)) {
          /* We could not establish in advance a list of groups like we did for schemas or filters
             because we don't have a list of group in database, it is just a garage property */
          if (!this.groupsSuggestions[g.group]) {
            this.groupsSuggestions[g.group] = [];
          }
          this.groupsSuggestions[g.group].push(this.formatSuggestion(g)); // Suggestions by group
          if (this.groups.indexOf(g.group) === -1) {
            this.groups.push(g.group);
          }
        }
      },
      tryAddGarageToSchemasSuggestions: function (g) {
        // No need to loop through schemas, a garage can only have one so we look
        // directly into the garage object for its schema and see if we know it
        if (this.hasValidSchema(g) && this.schemasSuggestions[g.importSchema.path]) {
          /* If the garage has a valid schema but the schema doesn't exist
             in this.schemasSuggestions it means the schema is unknown or
             at least it does not exist in the database, we will then find this garage
             in the 'Unknown Schema' filter :)
           */
          this.schemasSuggestions[g.importSchema.path].push(this.formatSuggestion(g));
        }
      },
      tryAddGarageToFiltersSuggestions: function (g) {
        // This time we need to loop through the filters as a garage can matche several
        for (var i = 0; i < this.filters.length; ++i) {
          if (this.filters[i].check(g)) { // If the garage matches this filter
            this.filtersSuggestions[this.filters[i].value].push(this.formatSuggestion(g));
          }
        }
      },
      setWatchers: function () {
        this.$watch('groupResearch', this.generateCurrentSuggestions);
        this.$watch('garageResearch', this.generateCurrentSuggestions);
        this.$watch('garageResearchAdv', this.generateCurrentSuggestionsAdv);
        this.$watch('filtersMode', this.generateCurrentSuggestions);
        this.$watch('filters', this.generateCurrentSuggestions, { deep: true }); // Detect if filter is on / off
        this.$watch('schemas', this.generateCurrentSuggestions, { deep: true}); // Detect if schema is on / off
        this.$watch('excludedGarages', () => {
          this.generateCurrentSuggestions();
          this.generateCurrentSuggestionsAdv();
        });
      },
      getActivated: function (container, container2) {
        var res = [];

        for (var i = 0; i < container.length; ++i) {
          if (container[i].on) {
            res.push(container2[container[i].value]);
          }
        }
        return res;
      },
      generateCurrentSuggestionsAdv: function () {
        var res = [];

        for (var j = 0; j < this.garagesSuggestions.length; ++j) {
          if (this.isMatching(this.garagesSuggestions[j], this.garageResearchAdv)) {
            res.push(this.garagesSuggestions[j]);
          }
        }
        this.currentGaragesSuggestionsAdv = res;
        this.currentGaragesSuggestionsAdv = this.currentGaragesSuggestionsAdv.filter(e => (this.excludedGarages.map(g => this.formatSuggestion(g)).indexOf(e) === -1));
      },
      generateCurrentSuggestions: function () {
        var filtersModeIsAnd = this.filtersMode.indexOf('and') >= 0;
        var matchingGaragesFilters = this.findMatchingGaragesFilters(this.getActivated(this.filters, this.filtersSuggestions), filtersModeIsAnd);
        var matchingGaragesSchemas = this.findMathcingGaragesSchemas(this.getActivated(this.schemas, this.schemasSuggestions));
        var matchingGaragesGroups = this.findMatchingGaragesGroups(this.groupsSuggestions[this.groupResearch] || null);

        this.currentGaragesSuggestions = this.joinArraysAnd([matchingGaragesFilters, matchingGaragesSchemas, matchingGaragesGroups]);
        this.currentGaragesSuggestions = this.currentGaragesSuggestions.filter(e => (this.excludedGarages.map(g => this.formatSuggestion(g)).indexOf(e) === -1));
      },
      findMatchingGaragesFilters: function (activatedFilters, filtersModeIsAnd) {
        if (activatedFilters.length === 0) {
          return this.garagesSuggestions;
        } else if (activatedFilters.length === 1) {
          return activatedFilters.shift();
        }
        return filtersModeIsAnd ? this.joinArraysAnd(activatedFilters) : this.joinArraysOr(activatedFilters);
      },
      findMathcingGaragesSchemas: function (activatedSchemas) {
        if (activatedSchemas.length === 0) {
          return this.garagesSuggestions;
        } else if (activatedSchemas.length === 1) {
          return activatedSchemas.shift();
        }
        return this.joinArraysOr(activatedSchemas);
      },
      findMatchingGaragesGroups: function (activatedGroup) {
        var res = [];

        if (activatedGroup) {
          return activatedGroup;
        } else if (this.groupResearch.length === 0) {
          return this.garagesSuggestions;
        }
        for (var i = 0; i < this.garages.length; ++i) {
          if (this.hasValidGroup(this.garages[i]) && this.isMatching(this.garages[i].group, this.groupResearch)) {
            res.push(this.formatSuggestion(this.garages[i]));
          }
        }
        return res;
      },
      joinArraysOr: function (arrays) {
        var res = [];

        for (var i = 0; i < arrays.length; ++i) {
          for (var j = 0; j < arrays[i].length; ++j) {
            if (res.indexOf(arrays[i][j]) === -1 && this.isMatching(arrays[i][j], this.garageResearch)) {
              res.push(arrays[i][j]);
            }
          }
        }
        return res;
      },
      joinArraysAnd: function (arrays) {
        var res = [];
        var first = arrays.shift();
        var ok = true;

        for (var i = 0; i < first.length; ++i) {
          if (this.isMatching(first[i], this.garageResearch)) {
            ok = true;
            for (var j = 0; j < arrays.length; ++j) {
              if (arrays[j].indexOf(first[i]) === -1) {
                ok = false;
                break;
              }
            }
            if (ok) {
              res.push(first[i]);
            }
          }
        }
        return res;
      },
      // Validations Functions
      hasValidGroup: function (garage) {
        return typeof garage.group === 'string' && typeof garage.group !== 'undefined' && garage.group !== '';
      },
      hasValidSchema: function (garage) {
        return garage.importSchema && garage.importSchema.path && garage.importSchema.path.length > 0;
      },
      // Formatting Functions
      normalize: function (s) {
        return s.toLowerCase().replace(/[éèêë]/g, 'e').replace(/[àâä]/g, 'a')
        .replace(/[ôö]/g, 'o').replace(/[îï]/, 'i').replace(/[-_]/g, ' ');
      },
      formatSuggestion: function (garage) {
        return (garage.type || 'Dealership') + ' - ' + garage.publicDisplayName + ' [' + garage.id + '] [' + garage.slug + ']';
      },
      // Matching Functions
      isMatching: function (container, research) {
        return this.normalize(container).indexOf(this.normalize(research)) >= 0;
      },
      loopThrough(next) {
        var pos = this.getCurrentGaragePosition();
        var newGarage = '';

        if (this.currentGaragesSuggestions.length > 0) {
          if (pos === 'x') {
            newGarage = this.currentGaragesSuggestions[0];
          } else if (next) {
            newGarage = this.currentGaragesSuggestions[pos > this.currentGaragesSuggestions.length - 1 ? 0 : pos];
          } else {
            newGarage = this.currentGaragesSuggestions[pos - 2 < 0 ? this.currentGaragesSuggestions.length - 1 : pos - 2];
          }
          this.selectedGarage = newGarage;
          this.updated(newGarage.replace('[', '~').replace(']', '~').split('~')[1]);
        }
      },
      getResearchCriteria: function (container) {
        var res = [];

        for (var i = 0; i < container.length; ++i) {
          if (container[i].on) {
            res.push(container[i]);
          }
        }
        return res;
      },
      getGarageFromSelectedGarage: function () {
        if (this.selectedGarage.length > 0) {
          return this.selectedGarage.split('[').shift();
        }
        return 'Aucun';
      },
      getCurrentGaragePosition: function () {
        if (this.selectedGarage.length > 0 && this.currentGaragesSuggestions.indexOf(this.selectedGarage) >= 0) {
          return this.currentGaragesSuggestions.indexOf(this.selectedGarage) + 1;
        }
        return 'x';
      },
      getDetails: function (container) {
        var res = [];

        for (var i = 0; i < container.length; ++i) {
          if (container[i].on) {
            res.push(' ' + container[i].name);
          }
          if (res.length > 3) {
            res[res.length - 1] = '...';
            break;
          }
        }
        return res.length > 0 ? res : [' Aucun'];
      },
      isCollapsed: function (id) {
        var wrapper = document.getElementById(id);

        return wrapper ? (wrapper.getAttribute('gs-collapsed') === 'true') : true;
      },
      getResearchDescription: function () {
        var filters = this.getResearchCriteria(this.filters);
        var schemas = this.getResearchCriteria(this.schemas);
        var res = 'les établissements ';

        if (filters.length === 0 && schemas.length === 0 && this.garageResearch.length === 0 && this.groupResearch.length === 0) {
          return 'tous les établissements';
        } else {
          if (filters.length > 0) {
            for (var i = 0; i < filters.length; ++i) {
              res += filters[i].name.replace('Garages', '') + (i < filters.length - 1 ? (this.filtersMode === 'gs-filters-mode-and' ? ', ET' : ', OU') : '');
            }
          }
          if (schemas.length > 0) {
            res += ' ayants comme schéma d\'import '
            for (var i = 0; i < schemas.length; ++i) {
              res += schemas[i].name + (i < schemas.length - 1 ? ', OU ' : '');
            }
          }
          if (this.groupsSuggestions[this.groupResearch]) {
            res += ' appartenants au groupe ' + this.groupResearch;
          } else if (this.groupResearch.length > 0) {
            res += ' dont le nom de groupe contient \'' + this.groupResearch + '\'';
          }
          if (this.garageResearch.length > 0) {
            res += ' et qui ont un nom, un id ou un slug qui contient \'' + this.garageResearch + '\'';
          }
          return res.toLowerCase();
        }
      },
      toggleCollapse: function (wrapperId) {
        var innerId = wrapperId + '-inner';
        var wrapper = document.getElementById(wrapperId);
        var inner = document.getElementById(innerId);
        var innerStyle = window.getComputedStyle(inner);
        var innerHeight = inner.offsetHeight + parseInt(innerStyle.marginTop) + parseInt(innerStyle.marginBottom);
        var isCollapsed = wrapper.getAttribute('gs-collapsed') === 'true';
        var isWorking = wrapper.getAttribute('gs-working') === 'true';
        var height = isCollapsed ? 0 : innerHeight;
        var step = isCollapsed ? parseInt(innerHeight / 35) : parseInt(innerHeight / 20);
        var speed = 5;

        function addHeight() {
          wrapper.style.height = height + 'px';
          height += step;
          if (height - step < innerHeight) {
            setTimeout(addHeight, speed);
          } else {
            wrapper.style.height = '100%';
            wrapper.setAttribute('gs-collapsed', 'false');
            wrapper.setAttribute('gs-working', 'false');
          }
        }

        function subHeight() {
          wrapper.style.height = height + 'px';
          height -= step;
          if (height + step > 0) {
            setTimeout(subHeight, speed);
          } else {
            wrapper.style.height = '0px';
            wrapper.setAttribute('gs-collapsed', 'true');
            wrapper.setAttribute('gs-working', 'false');
          }
        }
        if (isCollapsed && !isWorking) {
          wrapper.setAttribute('gs-working', 'true');
          addHeight();
        } else if (!isCollapsed && !isWorking) {
          wrapper.setAttribute('gs-working', 'true');
          subHeight();
        }
      }
    }
  }
</script>

<style lang="scss">
  .autocomplete-suggestions {
    text-align: left; cursor: default; border: 1px solid #ccc; border-top: 0; background: #fff; box-shadow: -1px 1px 3px rgba(0,0,0,.1);

    /* core styles should not be changed */
    position: absolute; display: none; z-index: 9999; max-height: 254px; overflow: hidden; overflow-y: auto; box-sizing: border-box;
  }
  .autocomplete-suggestion { position: relative; padding: 0 .6em; line-height: 23px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; font-size: 1.02em; color: #333; }
  .autocomplete-suggestion b { font-weight: normal; color: #1f8dd6; }
  .autocomplete-suggestion.selected { background: #f0f0f0; }


  .autocomplete-form{
    width: 100%;
  }
  .autocomplete-form select {
    float: left;
  }
  .autocomplete-form input {
    width: 100%;
  }
  .autocomplete-form .stretch {
    overflow: hidden;
  }
  .autocomplete-form select, .autocomplete-form input {
    height: 34px;
    padding: 6px 12px;
    font-size: 14px;
    line-height: 1.42857143;
    color: #555;
    background-color: #fff;
    background-image: none;
    border: 1px solid #ccc;
    border-radius: 4px;
    transition: border-color ease-in-out .15s,box-shadow ease-in-out .15s;
  }
  .autocomplete-form .stretch .gs-basic-input {
    width: initial;
    height: initial;
    padding: 1px 15px;
    font-size: inherit;
    line-height: inherit;
    color: black;
    border-radius: 0;
    transition: none;
  }

  .gs-garages-list-wrapper {
    padding: 20px 30px;
    border: 1px solid #dddddd;
    background: transparent;
    margin: 20px 0;
    line-height: 32px;
    color: #333333;
  }

  .gs-garages-list-wrapper div {
    overflow: visible;
  }

  /*

   */
  .gs-garages-list-wrapper .gs-garages-list-title {
    margin: 0 0 15px 0;
  }

  .gs-garages-list-wrapper .gs-garages-list-visible {
    visibility: visible;
    opacity: 1;
    height: auto;
    overflow: visible;
    transition: all 1s;
  }

  .gs-garages-list-wrapper .gs-garages-list-hidden {
    visibility: hidden;
    opacity: 0;
    height: 0;
    overflow: hidden;
    transition: all 0.5s;
    padding: 0;
    margin: 0;
  }

  .gs-garages-list-wrapper-simple {
    border: none;
    padding: 0;
    background: transparent;
  }

  .gs-garages-list-wrapper .gs-garages-list-form-group {
    width: 100%;
    margin-bottom: 20px;
  }

  .gs-garages-list-wrapper .gs-garages-list-form .gs-garages-list-filters .gs-garages-list-filters-content {
    height: 0;
    overflow: hidden;
  }

  .gs-garages-list-wrapper .gs-garages-list-form .gs-garages-list-schemas .gs-garages-list-schemas-content {
    height: 0;
    overflow: hidden;
  }

  .gs-garages-list-wrapper .gs-garages-list-form-group .gs-garages-list-label-above-input {
    font-weight: 300;
    margin: 0;
    padding: 0 0 0 10px;
    line-height: normal;
    font-size: 13px;
    font-style: italic;
    color: #666666;
  }

  .gs-garages-list-wrapper .gs-garages-list-input {
    border-radius: 2px;
    background: #f5f5f5;
    border: 1px solid #cccccc;
    color: black;
    width: 100%;
  }

  .gs-garages-list-wrapper .gs-garages-list-input::placeholder {
    font-style: italic;
  }

  .gs-garages-list-wrapper .gs-garages-list-checkbox {
    margin: 0;
    padding: 0;
    width: 100%;
  }

  .gs-garages-list-wrapper .gs-garages-list-checkbox .gs-garages-list-checkbox-inner  {
    padding: 0;
  }

  .gs-garages-list-wrapper .gs-garages-list-checkbox .gs-garages-list-checkbox-inner .gs-garages-list-checkbox-input {
    display: inline-block;
    margin: 0;
    vertical-align: middle;
    position: static;
  }

  .gs-garages-list-wrapper .gs-garages-list-checkbox .gs-garages-list-checkbox-inner .gs-garages-list-checkbox-text {
    display: inline-block;
    margin: 0;
    vertical-align: middle;
    font-weight: 300;
    font-size: 13px;
    color: #333333;
  }

  .gs-garages-list-wrapper .gs-garages-list-advanced-onoff {
    width: auto;
  }

  .gs-garages-list-wrapper  .gs-garages-list-collapse-title {
    display: inline-block;
    cursor: pointer;
  }

  .gs-garages-list-wrapper  .gs-garages-list-collapse-title .gs-garages-list-collapse-text {
    color: #333333;
  }

  .gs-garages-list-wrapper  .gs-garages-list-collapse-title .gs-garages-list-collapse-details {
    font-size: 12px;
    color: #333333;
    font-style: italic;
  }

  .gs-garages-list-wrapper  .gs-garages-list-collapse-title .gs-garages-list-collapse-caret {
    font-size: 12px;
    color: #333333;
    font-style: italic;
  }

  .gs-garages-list-wrapper fieldset {
    border: 1px solid #dddddd;
    padding: 0px 20px;
    margin: 0;
  }

  .gs-garages-list-wrapper fieldset legend {
    color: #555555;
    font-size: 16px;
    border: none;
    width: auto;
    padding: 0 10px;
    margin: 0;
  }

  .gs-garages-list-wrapper .gs-garages-list-last-fieldset {
    margin: 20px 0 0 0;
  }

  .gs-garages-list-wrapper .gs-garages-list-actions {
    color: #333333;
  }

  .gs-garages-list-wrapper .gs-garages-list-actions .gs-garages-list-actions-resume {
    border-bottom: 1px solid #dddddd;
    line-height: 1.7;
    font-size: 13px;
    padding: 10px 0 15px 0;
    margin: 0 0 10px 0;
    color: #333333;
    font-style: italic;
    text-indent: 20px;
  }

  .gs-garages-list-wrapper .gs-garages-list-highlight {
    color: #219ab5;
  }

  .gs-garages-list-wrapper .gs-garages-btn-primary {
    background: #219ab5;
    border: none;
    transition: all 0.5s;
  }

  .gs-garages-list-wrapper .gs-garages-btn-primary:hover {
    background: #286090;
    transition: all 0.5s;
  }

  .gs-garages-list-wrapper .gs-garages-list-filters .gs-garages-list-filters-mode-wrapper {
    border-bottom: 1px solid #CCCCCC;
    padding: 0 0 5px 0;
    margin: 0 0 5px 0;
  }

  .gs-garages-list-wrapper .gs-garages-list-filters-content-inner, .gs-garages-list-wrapper .gs-garages-list-schemas-content-inner {
    padding: 5px 10px;
  }

  .gs-garages-list-suggestions-menu {
    background: #EEEEEE;
    border: none;
  }

  .gs-garages-list-suggestions-menu .autocomplete-suggestion {
    color: #666666;
    font-size: 13px;
    line-height: 1.7;
    font-style: italic;
    background: transparent;
  }

  .gs-garages-list-suggestions-menu .autocomplete-suggestion.selected {
    color: #666666;
    font-size: 13px;
    line-height: 1.7;
    font-style: italic;
    background: transparent;
  }

  .gs-garages-list-suggestions-menu .autocomplete-suggestion:hover {
    color: #666666;
    font-size: 13px;
    line-height: 1.7;
    font-style: italic;
    background: #DDDDDD;
    cursor: pointer;
  }

  .gs-garages-list-suggestions-menu::-webkit-scrollbar-track
  {
    -webkit-box-shadow: inset 0 0 6px rgba(0,0,0,0.3);
    border-radius: 10px;
    background-color: #dddddd;
  }

  .gs-garages-list-suggestions-menu::-webkit-scrollbar
  {
    width: 10px;
    background-color: transparent;
  }

  .gs-garages-list-suggestions-menu::-webkit-scrollbar-thumb
  {
    border-radius: 10px;
    -webkit-box-shadow: inset 0 0 6px rgba(0,0,0,.3);
    background-color: #bbbbbb;
  }

</style>
