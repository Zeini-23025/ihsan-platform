import { defineConfig, externalizeDepsPlugin } from 'electron-vite'
import { resolve } from 'path'

export default defineConfig({
    main: {
        plugins: [externalizeDepsPlugin()]
    },
    preload: {
        plugins: [externalizeDepsPlugin()]
    },
    renderer: {
        root: resolve('../frontend'),
        build: {
            outDir: resolve('out/renderer'),
            rollupOptions: {
                input: {
                    index: resolve('../frontend/index.html')
                }
            }
        }
    }
})
