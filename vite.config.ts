import { defineConfig, type PluginOption } from 'vite';
import { createVuePlugin as vue } from 'vite-plugin-vue2';
import vueJsx from '@vitejs/plugin-vue-jsx';
import { fileURLToPath } from 'url';
import { VitePWA } from 'vite-plugin-pwa';
import manifestJson from './mainifest';
import packageConfig from './package.json';
import path from 'path';
import { visualizer } from 'rollup-plugin-visualizer';

const appVersion = packageConfig.version;

export default defineConfig({
  base: '/',
  build: {
    outDir: path.join(__dirname, 'dist', appVersion),
    emptyOutDir: true,
  },
  plugins: [
    // 数据分析
    visualizer({
      filename: path.join(__dirname, 'dist', 'stats.html'),
      open: true, //注意这里要设置为true，否则无效
      gzipSize: true,
      brotliSize: true,
    }) as PluginOption,
    vue(),
    vueJsx(),
    VitePWA({
      base: '/',
      manifest: manifestJson as any,
      registerType: 'autoUpdate',
      workbox: {
        cacheId: 'notes-xygengcn-cache',
        runtimeCaching: [
          {
            urlPattern: ({ url }) => url.origin === 'https://notes.xygeng.cn',
            handler: 'NetworkFirst',
            options: {
              cacheName: 'notes-xygengcn',
              cacheableResponse: {
                statuses: [200],
              },
            },
          },
          {
            urlPattern: /.*\.[js|json].*/,
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'notes-xygengcn-js',
              expiration: {
                maxEntries: 30, // 最多缓存30个，超过的按照LRU原则删除
                maxAgeSeconds: 30 * 24 * 60 * 60,
              },
              cacheableResponse: {
                statuses: [200],
              },
            },
          },
        ],
      },
    }),
  ],
  resolve: {
    alias: [
      {
        find: /^~(.*)$/,
        replacement: '$1',
      },
      {
        find: '@',
        replacement: fileURLToPath(new URL('./src', import.meta.url)),
      },
    ],
  },
  server: {
    host: '0.0.0.0',
  },
  define: {
    __APP_VERSION__: JSON.stringify(appVersion),
  },
});
