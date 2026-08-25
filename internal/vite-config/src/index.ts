import type { ConfigEnv, UserConfig, UserConfigFnPromise } from 'vite';

import process from 'node:process';

import react from '@vitejs/plugin-react';
import { visualizer } from 'rollup-plugin-visualizer';
import { loadEnv, mergeConfig, defineConfig as viteDefineConfig } from 'vite';

interface ApplicationConfigEnv extends ConfigEnv {
  env: Record<string, string>;
}

type DefineConfig = (
  config: ApplicationConfigEnv,
) => Promise<UserConfig> | UserConfig;

function defineConfig(userConfig?: DefineConfig): UserConfigFnPromise {
  return viteDefineConfig(async (config) => {
    const env = loadEnv(config.mode, process.cwd(), 'VITE_');
    const appConfig = await userConfig?.({ ...config, env });
    const { plugins: appPlugins = [], ...restAppConfig } = appConfig ?? {};

    const plugins: NonNullable<UserConfig['plugins']> = [
      ...appPlugins,
      ...react(),
    ];
    if (process.env.ANALYZE) {
      plugins.push(
        visualizer({
          brotliSize: true,
          emitFile: false,
          gzipSize: true,
          open: true,
        }),
      );
    }

    return mergeConfig(
      {
        plugins,
        server: {
          host: true,
          port: Number(env.VITE_DEV_PORT) || 5173,
        },
      },
      restAppConfig,
    );
  });
}

export { defineConfig };
export type { ApplicationConfigEnv, DefineConfig };
