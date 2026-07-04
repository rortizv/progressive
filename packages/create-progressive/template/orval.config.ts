import { defineConfig } from 'orval';

export default defineConfig({
  app: {
    input: './apps/server/openapi.json',
    output: {
      mode: 'single',
      target: './apps/web/src/app/api/generated.ts',
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
