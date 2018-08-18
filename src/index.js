// import 'babel-polyfill';
import Vue from 'vue';
import Vuetify from 'vuetify';
import VueAwesome from 'vue-awesome';
import AsyncComputed from 'vue-async-computed';
import router from './js/router';
import VueCookie from 'vue-cookie';
import VueClipboard from 'vue-clipboard2'

require('./css/app.css'); // Styles

Vue.config.productionTip = false; // Disable the "You are running Vue in development mode. message"

Vue.use(Vuetify);
Vue.use(VueAwesome);
Vue.use(AsyncComputed);
Vue.use(VueCookie);
Vue.use(VueClipboard);

Vue.component('font-awesome-icon', VueAwesome);

(() => new Vue({
  el: '#app',
  router: router,
  render: h => h('router-view')
}))();
