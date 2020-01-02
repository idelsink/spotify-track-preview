import '@babel/polyfill';
import Vue from 'vue';
import './plugins/vue-github-button';
import './plugins/fontawesome';
import vuetify from './plugins/vuetify';
import './plugins/localstorage';
import './plugins/clipboard2';
import App from './App.vue';
import router from './router';

import 'roboto-fontface/css/roboto/roboto-fontface.css';
import '@fortawesome/fontawesome-free/css/all.css';

Vue.config.productionTip = false;

new Vue({
  router,
  vuetify,
  render: h => h(App)
}).$mount('#app');
