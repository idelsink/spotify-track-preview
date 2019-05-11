module.exports = {
  root: true,
  env: {
    node: true
  },
  globals: {
    'GIT_DESCRIBE': true
  },
  extends: [
    'plugin:vue/essential',
    '@vue/standard',
    'semistandard'
  ],
  rules: {
    'no-console': process.env.NODE_ENV === 'production' ? 'error' : 'off',
    'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'off',
    'vue/component-name-in-template-casing': ['error', 'PascalCase' | 'kebab-case', {
      'registeredComponentsOnly': false,
      'ignores': []
    }]
  },
  parserOptions: {
    parser: 'babel-eslint'
  }
};
