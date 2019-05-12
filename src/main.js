import '@babel/polyfill';
import Vue from 'vue';
import './plugins/fontawesome';
import './plugins/vuetify';
import './plugins/localstorage';
import './plugins/clipboard2';
import App from './App.vue';
import router from './router';

Vue.config.productionTip = false;

new Vue({
  router,
  render: h => h(App)
}).$mount('#app');
