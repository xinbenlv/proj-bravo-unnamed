module.exports = {
  root: false,
  env: {
    browser: false,
    node: false
  },
  parserOptions: {
    parser: 'babel-eslint'
  },
  extends: [
    '@nuxtjs',
    // 'plugin:nuxt/recommended',
    // 'plugin:prettier/recommended',
    // 'prettier',
    // 'prettier/vue'
  ],
  plugins: [
    // 'prettier'
  ],
  // add your custom rules here
  rules: {
    'nuxt/no-cjs-in-config': 'off',
    'vue/max-attributes-per-line': 'off',

  }
}
