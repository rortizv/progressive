import baseConfig from '../../eslint.config.mjs';

export default [
  // template/ is scaffold content for a DIFFERENT project (whatever
  // create-progressive generates) — its imports/deps have nothing to do
  // with this package's own dependency graph.
  { ignores: ['template/**'] },
  ...baseConfig,
  {
    files: ['**/*.json'],
    rules: {
      '@nx/dependency-checks': [
        'error',
        {
          ignoredFiles: ['{projectRoot}/eslint.config.{js,cjs,mjs,ts,cts,mts}'],
        },
      ],
    },
    languageOptions: {
      parser: await import('jsonc-eslint-parser'),
    },
  },
];
