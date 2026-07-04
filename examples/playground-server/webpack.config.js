const { NxAppWebpackPlugin } = require('@nx/webpack/app-plugin');
const { join } = require('path');

module.exports = {
  output: {
    path: join(__dirname, '../../dist/examples/playground-server'),
    clean: true,
    ...(process.env.NODE_ENV !== 'production' && {
      devtoolModuleFilenameTemplate: '[absolute-resource-path]',
    }),
  },
  plugins: [
    new NxAppWebpackPlugin({
      target: 'node',
      compiler: 'tsc',
      main: './src/main.ts',
      tsConfig: './tsconfig.app.json',
      assets: ['./src/assets'],
      optimization: false,
      outputHashing: 'none',
      generatePackageJson: true,
      sourceMap: true,
      // Default externalizes ALL third-party packages, but `@progressive/ssr-nest`
      // is a workspace-only library (not yet published) whose node_modules symlink
      // points at its unbuilt TS source — so it must stay OUT of this list to be
      // bundled inline from source instead of left as an unresolvable `require()`.
      externalDependencies: [
        '@nestjs/common',
        '@nestjs/core',
        '@nestjs/platform-fastify',
        '@nestjs/swagger',
        '@fastify/static',
        'fastify',
        'reflect-metadata',
        'rxjs',
        'class-validator',
        'class-transformer',
      ],
    }),
  ],
};
