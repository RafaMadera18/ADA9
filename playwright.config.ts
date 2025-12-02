import dotenv from 'dotenv';
dotenv.config();

import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  
  // Configuración de timeouts
  timeout: 30000,
  expect: {
    timeout: 5000
  },
  
  // Configuración de reportes
  fullyParallel: false, // Ejecutar secuencialmente por dependencias
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 1, // Un worker para evitar conflictos en la BD
  
  reporter: [
    ['html', { outputFolder: 'playwright-report' }],
    ['json', { outputFile: 'test-results/results.json' }],
    ['junit', { outputFile: 'test-results/junit.xml' }],
    ['list']
  ],
  
  use: {
    baseURL: process.env.API_BASE_URL || 'http://localhost:5000',
    
    // Logs de request/response
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    
    // Headers por defecto
    extraHTTPHeaders: {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    },
  },

  projects: [
    {
      name: 'api-tests',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  
  // Configuración global antes de las pruebas
  globalSetup: './tests/setup/global-setup.ts',
  globalTeardown: './tests/setup/global-teardown.ts',
});