module.exports = {
  root: true,
  env: {
    node: true
  },
  globals: {
    'GIT_DESCRIBE': true
  },
  extends: [
    'vuetify',
    'plugin:vue/essential',
    '@vue/standard',
    'semistandard'
  ],
  rules: {
    'no-console': 'off',
    'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'off',
    'vue/component-name-in-template-casing': ['error', 'PascalCase' | 'kebab-case', {
      'registeredComponentsOnly': false,
      'ignores': []
    }],
    'vue/script-indent': ['error', 2, { 'baseIndent': 0 }]
  },
  parserOptions: {
    parser: 'babel-eslint'
  }
};
