const { NxAppWebpackPlugin } = require('@nx/webpack/app-plugin');
const { join } = require('path');

module.exports = {
  output: {
    path: join(__dirname, '../../dist/apps/server'),
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
      externalDependencies: [
        '@nestjs/common',
        '@nestjs/core',
        '@nestjs/platform-fastify',
        '@nestjs/swagger',
        '@progressive/ssr-nest',
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
