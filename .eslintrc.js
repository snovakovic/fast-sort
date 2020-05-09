module.exports = {
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 2018,
    sourceType: 'module',
  },
  extends: [
    'airbnb-base',
    'plugin:@typescript-eslint/recommended',
  ],
  env: {
    node: true,
    es6: true,
    mocha: true,
  },
  globals: {
    expect: true,
  },
  rules: {
    'comma-dangle': ['error', 'always-multiline'],
    // Functions
    'func-names': ['error', 'never'],
    'arrow-parens': ['error', 'always'],
    'space-before-function-paren': ['error', 'never'],
    'no-param-reassign': 0,
    'no-use-before-define': 0,
    'operator-linebreak': 0,
    'import/no-unresolved': 0,
    'no-plusplus': 0,
    'dot-notation': 0,
    'no-unused-expressions': 0,
    '@typescript-eslint/no-use-before-define': 0,
    '@typescript-eslint/type-annotation-spacing': ['error', { before: false, after: false }],
    '@typescript-eslint/interface-name-prefix': ['error', 'always'],
    '@typescript-eslint/member-delimiter-style': ['error', {
      multiline: { delimiter: 'comma' },
    }],
    '@typescript-eslint/no-explicit-any': 0,
    '@typescript-eslint/explicit-function-return-type': 0,
    '@typescript-eslint/no-var-requires': 0,
  },
};
