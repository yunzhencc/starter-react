import type { UserConfig } from 'vite';
import path from 'node:path';
import process from 'node:process';
import tailwindcss from '@tailwindcss/vite';
import { tanstackRouter } from '@tanstack/router-plugin/vite';
import react from '@vitejs/plugin-react';
import { bundleStats } from 'rollup-plugin-bundle-stats';
import { visualizer } from 'rollup-plugin-visualizer';
import { defineConfig, loadEnv } from 'vite';
import { createHtmlPlugin } from 'vite-plugin-html';

const envPrefix = ['VITE_'];
const analyze = process.env.ANALYZE;

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, import.meta.dirname, envPrefix);

  const plugins: UserConfig['plugins'] = [
    tanstackRouter({
      target: 'react',
      routesDirectory: './src/pages',
      routeFileIgnorePattern: 'components|views|types',
      autoCodeSplitting: true,
    }),
    react(),
    tailwindcss(),
    createHtmlPlugin({
      inject: {
        data: {
          title: env.VITE_APP_TITLE,
        },
      },
    }),
  ];

  if (analyze) {
    plugins.push(visualizer({
      gzipSize: true,
      brotliSize: true,
      emitFile: false,
      open: true,
    }));
  }

  if (env.VITE_DEV_BUNDLE_STATS === 'true') {
    plugins.push(bundleStats());
  }

  return {
    base: env.VITE_BASE_URL ?? '/',

    resolve: {
      alias: {
        '@': path.resolve(import.meta.dirname, './src'),
      },
    },

    plugins,

    build: {
      rollupOptions: {
        output: {
          chunkFileNames: 'static/js/[name]-[hash].js',
          entryFileNames: 'static/js/[name]-[hash].js',
          assetFileNames: 'static/[ext]/[name]-[hash].[ext]',
        },
      },
      // 按需开启
      // 是否生成 source map 文件
      sourcemap: false,
      // 单个 chunk 文件的大小超过 500kB 时发出警告
      chunkSizeWarningLimit: 500,
    },

    server: {
      port: Number(env.VITE_DEV_PORT),
      host: true,
      // proxy: {
      //   '/api': {
      //     target: env.VITE_DEV_API_BASE_URL,
      //     changeOrigin: true,
      //     rewrite: path => path.replace(/^\/api/, ''),
      //   },
      // },
    },
  };
});
