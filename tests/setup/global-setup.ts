import { chromium, FullConfig } from '@playwright/test';

/**
 * Global setup que se ejecuta UNA VEZ antes de todas las pruebas
 * Útil para:
 * - Verificar que la API esté disponible
 * - Crear usuario de prueba si no existe
 * - Limpiar datos de pruebas anteriores
 * - Configurar estado inicial
 */

async function globalSetup(config: FullConfig) {
  console.log('\n╔═══════════════════════════════════════════════════════╗');
  console.log('║  🚀 INICIANDO CONFIGURACIÓN GLOBAL DE PRUEBAS      ║');
  console.log('╚═══════════════════════════════════════════════════════╝\n');

  const baseURL = process.env.API_BASE_URL || 'http://localhost:5000';
  
  console.log(`📍 Base URL: ${baseURL}`);
  console.log(`⏰ Timestamp: ${new Date().toLocaleString('es-MX')}\n`);

  // Crear contexto de navegador para hacer requests
  const browser = await chromium.launch();
  const context = await browser.newContext({
    baseURL: baseURL,
  });

  try {
    // 1. Verificar que la API esté disponible
    console.log('🔍 Verificando disponibilidad de la API...');
    const healthCheck = await context.request.get('/api/account/admin-register-status');
    
    if (!healthCheck.ok()) {
      throw new Error(`API no disponible. Status: ${healthCheck.status()}`);
    }
    console.log('✅ API disponible y respondiendo\n');

    // 2. Verificar estado de registro de admin
    const canRegisterAdmin = await healthCheck.json();
    console.log(`🔐 Registro de admin permitido: ${canRegisterAdmin}\n`);

    // 3. Intentar crear/verificar usuario de prueba
    const testUsername = process.env.TEST_USERNAME || 'testuser';
    const testPassword = process.env.TEST_PASSWORD || 'Test123!';
    
    console.log('👤 Configurando usuario de prueba...');
    
    // Intentar login primero
    const loginResponse = await context.request.post('/api/account/login', {
      data: {
        userName: testUsername,
        password: testPassword
      }
    });

    if (loginResponse.ok()) {
      console.log(`✅ Usuario de prueba existente: ${testUsername}`);
    } else {
      // Si no existe, intentar crear
      console.log(`📝 Creando nuevo usuario de prueba: ${testUsername}`);
      
      const registerResponse = await context.request.post('/api/account/register', {
        data: {
          userName: testUsername,
          password: testPassword
        }
      });

      if (registerResponse.ok()) {
        console.log(`✅ Usuario de prueba creado exitosamente`);
      } else {
        console.warn(`⚠️  No se pudo crear usuario de prueba (Status: ${registerResponse.status()})`);
        console.warn('   Las pruebas continuarán con las credenciales existentes');
      }
    }

    console.log('\n╔═══════════════════════════════════════════════════════╗');
    console.log('║  ✅ CONFIGURACIÓN GLOBAL COMPLETADA               ║');
    console.log('╚═══════════════════════════════════════════════════════╝\n');

  } catch (error) {
    console.error('\n❌ ERROR EN CONFIGURACIÓN GLOBAL:');
    console.error(error);
    console.error('\n⚠️  Las pruebas pueden fallar si la API no está disponible\n');
    throw error;
  } finally {
    await browser.close();
  }
}

export default globalSetup;