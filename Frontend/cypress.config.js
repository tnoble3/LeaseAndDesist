import { defineConfig } from 'cypress'

export default defineConfig({
  e2e: {
    baseUrl: 'http://localhost:5173',
    supportFile: false,
    defaultCommandTimeout: 10000,
    responseTimeout: 30000,
    requestTimeout: 10000,
    // Retry tests up to 2 times
    retries: {
      runMode: 2,
      openMode: 0
    }
  },
})