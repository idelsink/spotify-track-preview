import Vue from 'vue';
import Router from 'vue-router';

Vue.use(Router);

export default new Router({
  routes: [
    {
      path: '/',
      name: 'Authenticate',
      component: () => import(/* webpackChunkName: "authenticate" */ './views/Authenticate')
    },
    {
      path: '/player',
      name: 'Player',
      component: () => import(/* webpackChunkName: "player" */ './views/Player')
    },
    {
      path: '*',
      redirect: { name: 'Authenticate' }
    }
  ]
});
