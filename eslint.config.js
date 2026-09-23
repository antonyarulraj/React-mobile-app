// https://docs.expo.dev/guides/using-eslint/
const { defineConfig } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');

module.exports = defineConfig([
  expoConfig,
  {
    ignores: ['dist/*'],
  },
  {
    // eslint-import-resolver-typescript@3.x (pinned by eslint-config-expo) can't
    // load TypeScript ~6.0's resolver interface, so every import/* path check
    // false-positives as unresolved. tsc already enforces module resolution
    // (`npm run typecheck`), so disable the redundant, currently-broken checks.
    rules: {
      'import/no-unresolved': 'off',
      'import/namespace': 'off',
      'import/no-duplicates': 'off',
    },
  },
]);
