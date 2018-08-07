import {gitInfo} from './git-info';

const appInfo = {
  name: '',
  author: 'Ingmar Delsink',
  spotify: {
    clientId: '69b10a305aef482e80c3aa3ad3e3fd7b'
  },
  gitInfo: gitInfo
};

export default {
  ...appInfo
};
