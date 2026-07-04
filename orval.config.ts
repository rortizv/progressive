import { defineConfig } from 'orval';

export default defineConfig({
  playground: {
    input: './examples/playground-server/openapi.json',
    output: {
      mode: 'single',
      target: './examples/playground-web/src/app/api/generated.ts',
      client: 'angular',
      override: {
        angular: {
          provideIn: 'root',
          retrievalClient: 'httpResource',
        },
      },
    },
  },
});
