import react from '@vitejs/plugin-react';
import { defineConfig, loadEnv } from 'vite';
import { createHtmlPlugin } from 'vite-plugin-html';

const envPrefix = ['VITE_'];

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, import.meta.dirname, envPrefix);

  return {
    plugins: [
      react(),
      createHtmlPlugin({
        inject: {
          data: {
            title: env.VITE_APP_TITLE,
          },
        },
      }),
    ],
    server: {
      port: Number(env.VITE_DEV_PORT),
      host: true,
    },
  };
});
