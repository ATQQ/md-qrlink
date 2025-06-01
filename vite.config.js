import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

const isGithubActions = process.env.GITHUB_ACTIONS === 'true'
// https://vite.dev/config/
export default defineConfig({
  plugins: [vue()],
  // 便于 掘金 AI Coding 复用资源
  // https://aicoding.juejin.cn/aicoding/work/7510906446952071202
  build: isGithubActions ? {
    rollupOptions: {
      output: {
        entryFileNames: 'assets/[name].js',
        chunkFileNames: 'assets/[name].js',
        assetFileNames: 'assets/[name].[ext]'
      }
    }
  } : undefined,
  base: isGithubActions ? '/md-qrlink/' : '/',
})
