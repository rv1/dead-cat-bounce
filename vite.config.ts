import { defineConfig } from 'vite'
import { execSync } from 'node:child_process'
import path from 'node:path'

function inferBase(): string {
  try {
    const url = execSync('git config --get remote.origin.url', { stdio: ['ignore', 'pipe', 'ignore'] })
      .toString()
      .trim()
    const match = url.match(/github\.com[:/](.+?)\/(.+?)(\.git)?$/)
    if (match?.[2]) return `/${match[2].replace(/\.git$/, '')}/`
  } catch {}
  return '/'
}

export default defineConfig({
  base: inferBase(),
  server: { port: 5173 },
  build: {
    target: 'es2018',
    outDir: 'dist',
    sourcemap: false,
    chunkSizeWarningLimit: 900,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('pixi')) return 'vendor_pixi'
            if (id.includes('matter-js')) return 'vendor_matter'
            // lodash no longer used
            return 'vendor'
          }
        }
      }
    }
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'source')
    }
  }
})


