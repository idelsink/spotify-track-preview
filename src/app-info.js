
const appInfo = {
  name: '',
  author: 'Ingmar Delsink',
  spotify: {
    clientId: process.env.NODE_ENV === 'development' ? 'db3242b094df4cfe95a57750acc0a632' : '69b10a305aef482e80c3aa3ad3e3fd7b'
  },
  gitInfo: GIT_DESCRIBE
};

export default {
  ...appInfo
};
