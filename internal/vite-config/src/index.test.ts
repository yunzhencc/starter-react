import type { ConfigEnv, UserConfig } from 'vite';

import { afterEach, describe, expect, it } from 'vitest';

import { defineConfig } from './index';

const configEnv: ConfigEnv = {
  command: 'serve',
  isPreview: false,
  isSsrBuild: false,
  mode: 'test',
};

function getPluginNames(config: UserConfig) {
  return (config.plugins ?? [])
    .flat()
    .filter((plugin): plugin is { name: string } => Boolean(plugin))
    .map(plugin => plugin.name);
}

describe('@yunzhen/vite-config', () => {
  afterEach(() => {
    delete process.env.ANALYZE;
  });

  it('adds React and server defaults before applying app overrides', async () => {
    let receivedMode: string | undefined;

    const config = await defineConfig(({ mode }) => {
      receivedMode = mode;
      return {
        plugins: [{ name: 'app-plugin' }],
        server: { port: 4300 },
      };
    })(configEnv);

    expect(receivedMode).toBe('test');
    expect(config.server).toMatchObject({ host: true, port: 4300 });
    const pluginNames = getPluginNames(config);

    expect(pluginNames).toEqual(expect.arrayContaining(['app-plugin', 'vite:react-babel']));
    expect(pluginNames.indexOf('app-plugin')).toBeLessThan(
      pluginNames.indexOf('vite:react-babel'),
    );
  });

  it('adds bundle analysis only when ANALYZE is enabled', async () => {
    process.env.ANALYZE = '1';

    const config = await defineConfig()(configEnv);

    expect(getPluginNames(config)).toContain('visualizer');
  });
});
