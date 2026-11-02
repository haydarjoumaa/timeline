import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
import vueDevTools from 'vite-plugin-vue-devtools'
import dts from 'vite-plugin-dts'

// https://vite.dev/config/
// `vite build --mode lib` builds the publishable library; other modes build the demo app
export default defineConfig(({ mode }) => {
  const isLib = mode === 'lib'

  return {
    plugins: [
      vue(),
      vueJsx(),
      isLib
        ? dts({
            tsconfigPath: './tsconfig.app.json',
            entryRoot: 'src',
            exclude: ['src/App.vue', 'src/main.ts', 'src/**/__tests__/**'],
          })
        : vueDevTools(),
    ],
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url))
      },
    },
    // The demo's public/ assets don't belong in the published package
    publicDir: isLib ? false : 'public',
    build: isLib
      ? {
          lib: {
            entry: fileURLToPath(new URL('./src/index.ts', import.meta.url)),
            name: 'VueTimelineSvg',
            fileName: 'vue-timeline-svg',
            cssFileName: 'style',
            formats: ['es', 'umd'],
          },
          rollupOptions: {
            external: ['vue', 'pinia', 'd3-selection', 'd3-drag'],
            output: {
              globals: { vue: 'Vue', pinia: 'Pinia', 'd3-selection': 'd3', 'd3-drag': 'd3' },
            },
          },
        }
      : undefined,
  }
})
