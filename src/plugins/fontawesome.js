import Vue from 'vue';

import { library } from '@fortawesome/fontawesome-svg-core';

import { faHeart } from '@fortawesome/free-solid-svg-icons/faHeart';
import { faGithub } from '@fortawesome/free-brands-svg-icons/faGithub';

import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';

library.add(
  faHeart,
  faGithub
);

Vue.component('FontAwesomeIcon', FontAwesomeIcon);
