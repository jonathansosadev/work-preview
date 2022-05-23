import Vue from "vue";
import * as filters from "../util/filters";

Object.keys(filters).forEach(key => {
  Vue.filter(key, filters[key]);
});
