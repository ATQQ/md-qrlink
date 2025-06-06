import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { viteSingleFile } from 'vite-plugin-singlefile'

const isGithubActions = process.env.GITHUB_ACTIONS === 'true'
const isJuejin = process.env.JUEJIN === 'true'

// https://vite.dev/config/
export default defineConfig({
  // 便于 掘金 AI Coding 使用
  plugins: isJuejin ? [vue(), viteSingleFile()] : [vue()],
  base: isGithubActions ? '/md-qrlink/' : '/',
})
