import App from '../../views/App.vue';

import Player from '../../views/Player.vue';
import Authenticate from '../../views/Authenticate.vue';

const routes = [
  {
    path: '',
    component: App,
    children: [
      {
        path: '',
        name: 'Authenticate',
        component: Authenticate
      },
      {
        path: 'player',
        name: 'Player',
        component: Player
      }
    ]
  },
  {
    path: '*',
    redirect: { name: 'Authenticate' }
  }
];

export default routes;
