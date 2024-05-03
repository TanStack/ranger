import { defineConfig, mergeConfig } from 'vitest/config'
import { tanstackBuildConfig } from '@tanstack/config/build'

const config = defineConfig({
  plugins: [],
  test: {
    watch: false,
    environment: 'jsdom'
  },
})

export default mergeConfig(
  config,
  tanstackBuildConfig({
    entry: './src/index.tsx',
    srcDir: './src',
  }),
)
