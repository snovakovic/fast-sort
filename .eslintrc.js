module.exports = {
  parser:  '@typescript-eslint/parser',
  parserOptions:  {
    ecmaVersion:  2018,
    sourceType:  'module',
  },
  extends: [
    'plugin:@typescript-eslint/recommended',
    'airbnb-base',
  ],
  env: {
    node: true,
    es6: true,
    mocha: true
  },
  globals: {
    expect: true,
  },
  rules: {
    'comma-dangle': ['error', 'always-multiline'],
    'no-underscore-dangle': ['error', { allow: ['_id', '_uid', '__v'] }],
    // Functions
    'func-names': ['error', 'never'],
    'arrow-parens': ['error', 'always'],
    'space-before-function-paren': ['error', 'never'],
    'no-param-reassign': ['error', { props: false }],
    'no-prototype-builtins': 0,
    'no-param-reassign': 0,
    'no-restricted-syntax': 0,
    'no-underscore-dangle': 0,
    'no-unused-expressions': 0,
    'guard-for-in': 0,
    'no-plusplus': 0,
    'arrow-parens': 0,
    '@typescript-eslint/type-annotation-spacing': ['error', { before: false, after: false }],
  }
};
