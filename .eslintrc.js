module.exports = {
  parser: '@babel/eslint-parser',
  env: {
    es6: true,
    node: true,
  },
  extends: ['eslint:recommended', 'prettier'],
  parserOptions: {
    ecmaVersion: 7,
    sourceType: 'module',
    ecmaFeatures: {
      experimentalObjectRestSpread: true,
      impliedStrict: true,
    },
  },
  plugins: ['prettier'],
  rules: {
    'no-console': [0],
    'no-unused-vars': [
      'error',
      {
        vars: 'all',
        args: 'none',
      },
    ],
    'prettier/prettier': 'error',
  },
};
