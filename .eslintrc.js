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
    'func-names': ['error', 'never'],
    'space-before-function-paren': ['error', 'never'],
    'no-param-reassign': 0,
    'arrow-parens': 0,
    'dot-notation': 0,
    'operator-linebreak': 0,
    'import/no-unresolved': 0,
    'import/extensions': 0,
    '@typescript-eslint/type-annotation-spacing': ['error', { before: false, after: false }],
    '@typescript-eslint/interface-name-prefix': ['error', 'always'],
    '@typescript-eslint/member-delimiter-style': ['error', {
      multiline: { delimiter: 'comma' },
    }],
    '@typescript-eslint/no-explicit-any': 0,
    '@typescript-eslint/explicit-function-return-type': 0,
  },
};
