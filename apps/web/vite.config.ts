import tailwindcss from '@tailwindcss/vite';
import { devtools } from '@tanstack/devtools-vite';
import { tanstackStart } from '@tanstack/react-start/plugin/vite';
import viteReact from '@vitejs/plugin-react';
import { defineConfig, loadEnv } from 'vite';

const envPrefix = ['VITE_'];

const config = defineConfig(({ mode }) => {
  const env = loadEnv(mode, import.meta.dirname, envPrefix);

  return {
    resolve: {
      tsconfigPaths: true,
    },
    plugins: [
      devtools(),
      tailwindcss(),
      tanstackStart(),
      viteReact(),
    ],

    server: {
      port: Number(env.VITE_DEV_PORT),
      host: true,
    },
  };
});

export default config;
