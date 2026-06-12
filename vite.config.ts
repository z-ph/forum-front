import { defineConfig, loadEnv } from 'vite'
import { dirname, resolve } from 'path'
import { fileURLToPath } from 'url'
import vue from '@vitejs/plugin-vue'
import VueRouter from 'unplugin-vue-router/vite'
import tailwindcss from '@tailwindcss/vite'
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'

const __dirname = dirname(fileURLToPath(import.meta.url))

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd())
  const apiProxyPrefix = env.VITE_PROXY_PREFIX
  if (!apiProxyPrefix && mode === 'development') {
    throw new Error('VITE_PROXY_PREFIX is not defined in the environment variables.')
  }
  return {
    resolve: {
      alias: {
        '@': resolve(__dirname, 'src'),
      },
    },
    plugins: [
      VueRouter({
        routesFolder: 'src/pages',
        extensions: ['.page.vue'],
        dts: './src/typed-router.d.ts',
      }),
      tailwindcss(),
      vue(),
      AutoImport({
        resolvers: [ElementPlusResolver()],
      }),
      Components({
        resolvers: [ElementPlusResolver()],
      }),
    ],
    server: {
      proxy: {
        [apiProxyPrefix]: {
          target: env.VITE_API_URL,
          changeOrigin: true,
          rewrite: (path) => path.replace(apiProxyPrefix, ''),
        },
      },
    },
  }
})
