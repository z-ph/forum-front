import { defineConfig, loadEnv } from 'vite'
import { dirname, resolve } from 'path'
import { fileURLToPath } from 'url'
import vue from '@vitejs/plugin-vue'
import VueRouter from 'unplugin-vue-router/vite'
import tailwindcss from '@tailwindcss/vite'

const __dirname = dirname(fileURLToPath(import.meta.url))

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const apiProxyPrefix = '/api'
  const env = loadEnv(mode, process.cwd())

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
