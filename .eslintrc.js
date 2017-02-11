module.exports = {
  'env': {
    'browser': true,
    'commonjs': true,
    'es6': true
  },
  'extends': 'eslint:recommended',
  'parser': 'babel-eslint',
  'parserOptions': {
    'ecmaFeatures': {
      'experimentalObjectRestSpread': true,
      'jsx': true
    },
    'sourceType': 'module'
  },
  'plugins': [
    'react',
    'flowtype'
  ],
  'rules': {
    'flowtype/define-flow-type': 2,
    'no-console': 0,
    'require-yield': 0,
    'react/jsx-uses-react': 2,
    'react/jsx-uses-vars': 2,
    'no-unused-vars': [
      1, {
      'args': 'all',
      'argsIgnorePattern': '^e$|^t$',
      'varsIgnorePattern': '^_$'
    }],
    'no-constant-condition': [
      2, {
      'checkLoops': false
    }],
    'indent': [
      2,
      2
    ],
    'linebreak-style': [
      2,
      'unix'
    ],
    'quotes': [
      2,
      'single'
    ],
    'semi': [
      2,
      'always'
    ]
  }
};
