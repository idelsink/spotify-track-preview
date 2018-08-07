// import 'babel-polyfill';
import Vue from 'vue';
import Vuetify from 'vuetify';
import VueAwesome from 'vue-awesome';
import AsyncComputed from 'vue-async-computed';
import router from './js/router';
import VueUniversalCookies, {BrowserHandler} from 'vue-universal-cookies';

require('./css/app.css'); // Styles

Vue.config.productionTip = false; // Disable the "You are running Vue in development mode. message"

Vue.use(Vuetify);
Vue.use(VueAwesome);
Vue.use(AsyncComputed);
Vue.use(VueUniversalCookies);

Vue.component('font-awesome-icon', VueAwesome);

(() => new Vue({
  cookies: { handler: new BrowserHandler() },
  el: '#app',
  router: router,
  render: h => h('router-view')
}))();
